import os
import json
import logging
from typing import Dict, List, Any
from dotenv import load_dotenv
from agents import Agent, Runner
from agents import function_tool
import asyncio
import time

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@function_tool
def retrieve_information(query: str) -> Dict:
    """
    Retrieve information from the knowledge base based on a query
    """
    from retrieving import RAGRetriever
    retriever = RAGRetriever()

    try:
        # Call the existing retrieve method from the RAGRetriever instance
        json_response = retriever.retrieve(query_text=query, top_k=5, threshold=0.3)
        results = json.loads(json_response)

        # Format the results for the assistant
        formatted_results = []
        for result in results.get('results', []):
            formatted_results.append({
                'content': result['content'],
                'url': result['url'],
                'position': result['position'],
                'similarity_score': result['similarity_score']
            })

        return {
            'query': query,
            'retrieved_chunks': formatted_results,
            'total_results': len(formatted_results)
        }
    except Exception as e:
        logger.error(f"Error in retrieve_information: {e}")
        return {
            'query': query,
            'retrieved_chunks': [],
            'total_results': 0,
            'error': str(e)
        }

class RAGAgent:
    def __init__(self):
        # Create the agent with retrieval tool using the new OpenAI Agents SDK
        self.agent = Agent(
            name="Physical AI & Humanoid Robotics Assistant",
            instructions="You are an expert assistant specializing in AI-powered robotics, humanoid systems, and embodied intelligence. Your expertise spans ROS 2, simulation platforms (Gazebo, Isaac Sim, Unity), Vision-Language-Action systems, hardware integration, and advanced AI control. When answering questions, first retrieve relevant documents using the retrieve_information tool, then provide comprehensive, technically accurate responses. Always cite your sources, acknowledge limitations when information is insufficient, and maintain a professional, educational tone appropriate for engineers, researchers, and students. Structure responses with clear explanations, relevant examples, and practical insights. If a query is outside the robotics domain, politely redirect to the educational content.",
            tools=[retrieve_information]
        )

        logger.info("RAG Agent initialized with OpenAI Agents SDK")

    def query_agent(self, query_text: str, tutor_mode: bool = False, session_id: str = None, use_improved_flow: bool = True) -> Dict:
        """
        Process a query through the RAG agent and return structured response
        """
        start_time = time.time()

        logger.info(f"Processing query through RAG agent: '{query_text[:50]}...', Tutor Mode: {tutor_mode}, Improved Flow: {use_improved_flow}, Session ID: {session_id}")

        try:
            # Get session history if available
            from api import session_storage as api_session_storage
            session_history = self._get_session_history(session_id, api_session_storage) if session_id else []

            if use_improved_flow:
                # Use the improved backend flow: User → Intent Detection → Qdrant Search → Context → AI → Format → Answer
                result = self.improved_backend_flow(query_text, session_history)

                # Apply tutor mode formatting if enabled
                if tutor_mode and 'answer' in result:
                    result['answer'] = self.enhance_answer(result['answer'], query_text, tutor_mode, result.get('intent_data', {}))
                    result['answer'] = self.format_answer(result['answer'], result.get('matched_chunks', []), query_text, tutor_mode, result.get('intent_data', {}))
                # If not in tutor mode but we want to inject context
                else:
                    result['answer'] = self.inject_context_into_response(result['answer'], result.get('matched_chunks', []), query_text)

                # Update session with current interaction
                if session_id:
                    from api import session_storage as api_session_storage
                    self._update_session_history(session_id, query_text, result.get('answer', ''), result.get('matched_chunks', []), api_session_storage)

                return result
            else:
                # Use the traditional flow
                # Detect intent of the query
                intent_data = self.detect_intent(query_text)

                # Run the agent with the query using the new OpenAI Agents SDK
                # Since Runner.run is async, we need to run it in an event loop
                import asyncio
                if asyncio.get_event_loop().is_running():
                    # If we're already in an event loop, we need to use a different approach
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor() as executor:
                        future = executor.submit(asyncio.run, self._async_query_agent(query_text))
                        result = future.result()
                else:
                    result = asyncio.run(self._async_query_agent(query_text))

                # Apply tutor mode formatting if enabled
                if tutor_mode and 'answer' in result:
                    result['answer'] = self.enhance_answer(result['answer'], query_text, tutor_mode, intent_data)
                    result['answer'] = self.format_answer(result['answer'], result.get('matched_chunks', []), query_text, tutor_mode, intent_data)
                # If not in tutor mode but we want to inject context
                else:
                    result['answer'] = self.inject_context_into_response(result['answer'], result.get('matched_chunks', []), query_text)

                # Add intent data to response
                result['intent_data'] = intent_data

                # Update session with current interaction
                if session_id:
                    from api import session_storage as api_session_storage
                    self._update_session_history(session_id, query_text, result.get('answer', ''), result.get('matched_chunks', []), api_session_storage)

                return result

        except Exception as e:
            logger.error(f"Error processing query: {e}")
            error_result = {
                "answer": "Sorry, I encountered an error processing your request.",
                "sources": [],
                "matched_chunks": [],
                "error": str(e),
                "query_time_ms": (time.time() - start_time) * 1000,
                "intent_data": self.detect_intent(query_text)
            }

            # Update session with error
            if session_id:
                from api import session_storage as api_session_storage
                self._update_session_history(session_id, query_text, error_result.get('answer', ''), [], api_session_storage)

            return error_result

    def _get_session_history(self, session_id: str, session_storage: dict = None) -> List[Dict]:
        """
        Get the conversation history for a session
        """
        if session_storage is None:
            return []

        if session_id in session_storage:
            # Return the last 5 messages to maintain context
            return session_storage[session_id][-5:]
        return []

    def _update_session_history(self, session_id: str, user_query: str, bot_response: str, matched_chunks: List[Dict], session_storage: dict = None):
        """
        Update the session history with the latest interaction
        """
        if session_storage is None:
            return

        import time

        # Ensure session exists
        if session_id not in session_storage:
            session_storage[session_id] = []

        # Add the user message to the session
        session_storage[session_id].append({
            "role": "user",
            "content": user_query,
            "timestamp": time.time()
        })

        # Add the bot response to the session
        session_storage[session_id].append({
            "role": "assistant",
            "content": bot_response,
            "timestamp": time.time(),
            "sources": [chunk.get('url') for chunk in matched_chunks] if matched_chunks else []
        })

        # Keep only the last 5 exchanges (10 messages: 5 user + 5 bot) to maintain session memory
        if len(session_storage[session_id]) > 10:
            session_storage[session_id] = session_storage[session_id][-10:]

    def improved_backend_flow(self, query_text: str, session_history: List[Dict] = None) -> Dict:
        """
        Improved backend flow: User → Intent Detection → Qdrant Search → Context → AI → Format → Answer
        """
        start_time = time.time()

        # Step 1: Intent Detection
        intent_data = self.detect_intent(query_text)
        logger.info(f"Intent detected: {intent_data}")

        # Step 2: Qdrant Search
        from retrieving import RAGRetriever
        retriever = RAGRetriever()
        json_response = retriever.retrieve(query_text=query_text, top_k=5, threshold=0.3)
        results = json.loads(json_response)

        # Format matched chunks
        matched_chunks = []
        sources = set()
        for result in results.get('results', []):
            chunk = {
                'content': result['content'],
                'url': result['url'],
                'position': result['position'],
                'similarity_score': result['similarity_score']
            }
            matched_chunks.append(chunk)
            sources.add(result['url'])

        # Step 3: Context Preparation (now including session history)
        context = self._prepare_context(matched_chunks, query_text, intent_data, session_history)

        # Step 4: AI Processing with context
        ai_response = self._process_with_ai(query_text, context, intent_data)

        # Step 5: Format Answer (Note: formatting will be handled by caller based on tutor mode)
        # We return the raw AI response for the caller to format appropriately
        formatted_answer = ai_response

        # Calculate query time
        query_time_ms = (time.time() - start_time) * 1000

        # Final response
        response = {
            "answer": formatted_answer,
            "sources": list(sources),
            "matched_chunks": matched_chunks,
            "query_time_ms": query_time_ms,
            "confidence": self._calculate_confidence(matched_chunks),
            "intent_data": intent_data
        }

        logger.info(f"Improved flow query processed in {query_time_ms:.2f}ms")
        return response

    def _prepare_context(self, matched_chunks: List[Dict], query: str, intent_data: Dict, session_history: List[Dict] = None) -> str:
        """
        Prepare context from matched chunks, intent data, and session history
        """
        context_parts = []

        # Add session history context if available
        if session_history:
            context_parts.append("## Previous Conversation Context:")
            for i, msg in enumerate(session_history[-5:], 1):  # Use last 5 messages
                role = msg.get('role', 'unknown')
                content = msg.get('content', '')
                timestamp = msg.get('timestamp', '')
                context_parts.append(f"  {role.upper()}: {content[:200]}{'...' if len(content) > 200 else ''}")
            context_parts.append("")  # Empty line for separation

        # Add query context
        context_parts.append(f"## Current User Query: {query}")
        context_parts.append(f"## Detected Intent: {intent_data.get('primary_intent', 'general')}")

        # Add relevant content from matched chunks
        if matched_chunks:
            context_parts.append("\n## Relevant Information Found:")
            for i, chunk in enumerate(matched_chunks[:3]):  # Use top 3 chunks
                content_preview = chunk['content'][:200] + "..." if len(chunk['content']) > 200 else chunk['content']
                context_parts.append(f"### [{i+1}] {content_preview}")
                context_parts.append(f"    Source: {chunk['url']}")
                context_parts.append(f"    Relevance: {chunk['similarity_score']:.3f}\n")

        return "\n".join(context_parts)

    def _process_with_ai(self, query: str, context: str, intent_data: Dict) -> str:
        """
        Process query with AI considering context and intent
        """
        # This simulates the AI processing with context
        # In a real implementation, this would use the actual AI model
        try:
            # Check for short input that might need clarification
            if len(query.strip()) < 10:
                return self._handle_short_input(query, intent_data)

            # Determine response style based on intent
            intent = intent_data.get('primary_intent', 'general')
            confidence = intent_data.get('confidence', 0)

            if intent in ['greeting', 'feedback']:
                greeting_response = "Hello! I'm your Physical AI & Humanoid Robotics assistant. "
                greeting_response += "How can I help you with robotics, AI, or humanoid systems today?"
                return greeting_response

            elif intent in ['tutor_request', 'clarification']:
                return f"Based on the context provided, I can help explain this concept in detail. {query}"

            elif intent in ['example_request']:
                return f"Here's an example related to your query: {query}"

            elif intent in ['comparison']:
                return f"Comparing concepts related to your query: {query}"

            elif intent in ['help']:
                help_response = "I'm here to help you learn about Physical AI & Humanoid Robotics! "
                help_response += "You can ask me about ROS 2, simulation platforms (Gazebo, Isaac Sim, Unity), "
                help_response += "Vision-Language-Action systems, hardware integration, AI control, or humanoid design. "
                help_response += "What specific topic would you like to explore?"
                return help_response

            elif intent in ['quit']:
                return "Thank you for using the Physical AI & Humanoid Robotics assistant. Feel free to return anytime you have questions about robotics and AI!"

            else:
                # Use the original agent for general queries
                import asyncio
                if asyncio.get_event_loop().is_running():
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor() as executor:
                        future = executor.submit(asyncio.run, self._async_query_agent_with_context(query, context))
                        result = future.result()
                else:
                    result = asyncio.run(self._async_query_agent_with_context(query, context))

                response = result.get("answer", "I couldn't generate a response based on the available information.")

                # If confidence is low, provide a more cautious response
                if confidence < 0.3:
                    response += "\n\n⚠️ Note: The information provided is based on general knowledge. For more specific details, please provide additional context."

                return response

        except Exception as e:
            logger.error(f"Error in AI processing: {e}", exc_info=True)
            return "I encountered an issue while processing your request. Could you please rephrase your question?"

    def _handle_short_input(self, query: str, intent_data: Dict) -> str:
        """
        Handle short input that might need clarification
        """
        # Determine if this is a question, statement, or unclear input
        if query.strip().endswith('?'):
            return f"I received your question: '{query}'. Could you please provide more details so I can give you a more comprehensive answer about Physical AI & Humanoid Robotics?"
        else:
            return f"I received your input: '{query}'. Could you please clarify what specifically you'd like to know about Physical AI & Humanoid Robotics? For example, you could ask 'What is {query}?' or 'How does {query} work?'"

    async def _async_query_agent_with_context(self, query_text: str, context: str) -> Dict:
        """
        Internal async method to run the agent query with additional context
        """
        start_time = time.time()

        try:
            # Create an enhanced prompt that includes the context
            enhanced_query = f"{context}\n\nBased on the above context, please answer the following query: {query_text}"

            result = await Runner.run(self.agent, enhanced_query)

            # Extract the assistant's response
            assistant_response = result.final_output

            if not assistant_response:
                return {
                    "answer": "Sorry, I couldn't generate a response.",
                    "sources": [],
                    "matched_chunks": [],
                    "error": "No response from assistant",
                    "query_time_ms": (time.time() - start_time) * 1000
                }

            # Extract sources and matched chunks from the tool calls
            sources = set()
            matched_chunks = []

            # The new SDK might store tool call results differently
            # Let's try to access them in the most likely way based on the documentation
            if hasattr(result, 'final_output') and result.final_output:
                # If the result contains tool call results in final_output
                # For now, we'll rely on the agent's processing of the tool results
                # The agent itself will incorporate the tool results into the final response
                pass

            # Calculate query time
            query_time_ms = (time.time() - start_time) * 1000

            # Format the response
            # For the new SDK, we may need to extract the sources and chunks differently
            # based on how the agent processes the tool results
            response = {
                "answer": str(assistant_response),
                "sources": list(sources),
                "matched_chunks": matched_chunks,
                "query_time_ms": query_time_ms,
                "confidence": self._calculate_confidence(matched_chunks)
            }

            logger.info(f"Context-enhanced query processed in {query_time_ms:.2f}ms")
            return response

        except Exception as e:
            logger.error(f"Error in async query with context: {e}")
            raise

    async def _async_query_agent(self, query_text: str) -> Dict:
        """
        Internal async method to run the agent query
        """
        start_time = time.time()

        try:
            result = await Runner.run(self.agent, query_text)

            # Extract the assistant's response
            assistant_response = result.final_output

            if not assistant_response:
                return {
                    "answer": "Sorry, I couldn't generate a response.",
                    "sources": [],
                    "matched_chunks": [],
                    "error": "No response from assistant",
                    "query_time_ms": (time.time() - start_time) * 1000
                }

            # Extract sources and matched chunks from the tool calls
            sources = set()
            matched_chunks = []

            # The new SDK might store tool call results differently
            # Let's try to access them in the most likely way based on the documentation
            if hasattr(result, 'final_output') and result.final_output:
                # If the result contains tool call results in final_output
                # For now, we'll rely on the agent's processing of the tool results
                # The agent itself will incorporate the tool results into the final response
                pass

            # Calculate query time
            query_time_ms = (time.time() - start_time) * 1000

            # Format the response
            # For the new SDK, we may need to extract the sources and chunks differently
            # based on how the agent processes the tool results
            response = {
                "answer": str(assistant_response),
                "sources": list(sources),
                "matched_chunks": matched_chunks,
                "query_time_ms": query_time_ms,
                "confidence": self._calculate_confidence(matched_chunks)
            }

            logger.info(f"Query processed in {query_time_ms:.2f}ms")
            return response

        except Exception as e:
            logger.error(f"Error in async query: {e}")
            raise

    def _calculate_confidence(self, matched_chunks: List[Dict]) -> str:
        """
        Calculate confidence level based on similarity scores and number of matches
        """
        if not matched_chunks:
            return "low"

        avg_score = sum(chunk.get('similarity_score', 0.0) for chunk in matched_chunks) / len(matched_chunks)

        if avg_score >= 0.7:
            return "high"
        elif avg_score >= 0.4:
            return "medium"
        else:
            return "low"

    def detect_intent(self, query: str) -> Dict[str, Any]:
        """
        Detect the intent of the user query with improved accuracy
        """
        query_lower = query.lower().strip()

        # Define intent categories with more comprehensive keywords
        intents = {
            'greeting': [
                'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening',
                'morning', 'afternoon', 'evening', 'welcome', 'hey there'
            ],
            'tutor_request': [
                'explain', 'teach', 'learn', 'how does', 'how do', 'can you teach', 'help me understand',
                'what is', 'what are', 'tell me about', 'describe', 'elaborate on', 'break down',
                'walk me through', 'guide me on', 'educate me on'
            ],
            'follow_up': [
                'why', 'how', 'more', 'continue', 'elaborate', 'detail', 'further', 'also', 'and',
                'then', 'next', 'after that', 'what happens', 'what about', 'related to', 'connected to'
            ],
            'clarification': [
                'what', 'where', 'when', 'who', 'which', 'whose', 'whom', 'why', 'how', 'explain',
                'define', 'meaning', 'definition', 'clarify', 'what do you mean', 'can you clarify'
            ],
            'technical_question': [
                'implement', 'code', 'function', 'method', 'algorithm', 'architecture', 'design',
                'structure', 'build', 'develop', 'create', 'make', 'construct', 'setup', 'configure'
            ],
            'comparison': [
                'compare', 'difference', 'vs', 'versus', 'similarities', 'different', 'between',
                'contrast', 'better than', 'worse than', 'advantages', 'disadvantages', 'pros and cons'
            ],
            'example_request': [
                'example', 'sample', 'show me', 'demonstrate', 'illustrate', 'give', 'provide',
                'like', 'such as', 'instance', 'case', 'scenario', 'situation', 'practice', 'exemplify'
            ],
            'summary': [
                'summarize', 'summary', 'overview', 'key points', 'main idea', 'conclusion',
                'recap', 'highlight', 'important', 'bottom line', 'tl;dr', 'in summary', 'in conclusion'
            ],
            'feedback': [
                'good', 'great', 'helpful', 'thanks', 'thank you', 'nice', 'awesome', 'perfect',
                'excellent', 'wonderful', 'fantastic', 'appreciate', 'grateful', 'well done'
            ],
            'negative_feedback': [
                'confusing', 'unclear', 'wrong', 'incorrect', 'bad', 'not helpful', 'difficult',
                'frustrating', 'hard to understand', 'poor', 'terrible', 'doesn\'t make sense'
            ],
            'navigation': [
                'next', 'previous', 'back', 'forward', 'continue', 'go to', 'move to', 'jump to',
                'skip', 'return', 'navigate', 'switch', 'change', 'go back', 'go forward'
            ],
            'help': [
                'help', 'assist', 'support', 'guide', 'instructions', 'how to', 'tips', 'advice',
                'assistance', 'support', 'directions', 'guidance', 'tutorials', 'resources'
            ],
            'quit': [
                'bye', 'goodbye', 'exit', 'quit', 'stop', 'end', 'finish', 'see you', 'farewell',
                'later', 'take care', 'until next time', 'adios', 'ciao', 'au revoir'
            ]
        }

        detected_intents = []
        intent_scores = {}

        # Calculate scores for each intent based on keyword matches
        for intent, keywords in intents.items():
            score = 0
            for keyword in keywords:
                if keyword in query_lower:
                    score += 1
            if score > 0:
                intent_scores[intent] = score
                detected_intents.append(intent)

        # Sort intents by score to get primary intent
        sorted_intents = sorted(intent_scores.items(), key=lambda x: x[1], reverse=True)
        primary_intent = sorted_intents[0][0] if sorted_intents else 'general'

        # Calculate confidence based on strongest match
        total_keywords = sum(len(keywords) for keywords in intents.values())
        matched_keywords = sum(intent_scores.values())
        confidence = matched_keywords / max(len(query_lower.split()), 1) if total_keywords > 0 else 0

        return {
            'intents': detected_intents,
            'primary_intent': primary_intent,
            'intent_scores': intent_scores,
            'confidence': min(confidence, 1.0),  # Cap at 1.0
            'query_length': len(query_lower.split())
        }

    def format_answer(self, answer: str, matched_chunks: List[Dict], query: str, tutor_mode: bool = False, intent_data: Dict = None) -> str:
        """
        Format the answer with proper structure and context
        """
        if not tutor_mode:
            return answer

        # Enhanced formatting for tutor mode
        formatted_answer = f"## 🎓 Physical AI & Humanoid Robotics Tutor Response\n\n"
        formatted_answer += f"**Query:** {query}\n\n"
        formatted_answer += f"{answer}\n\n"

        if matched_chunks:
            formatted_answer += "### 📚 Relevant Resources:\n"
            for i, chunk in enumerate(matched_chunks[:3], 1):  # Show top 3 chunks
                content_preview = chunk.get('content', '')[:150] + "..." if len(chunk.get('content', '')) > 150 else chunk.get('content', '')
                formatted_answer += f"{i}. [{content_preview}]({chunk.get('url', '#')})\n"
                formatted_answer += f"   *Relevance Score: {chunk.get('similarity_score', 0):.3f}*\n\n"

        # Add follow-up questions based on intent
        follow_up_questions = self._generate_follow_up_questions(query, intent_data)
        if follow_up_questions:
            formatted_answer += "### ❓ **Follow-up Questions:**\n"
            for i, question in enumerate(follow_up_questions[:3], 1):  # Show top 3 follow-up questions
                formatted_answer += f"{i}. {question}\n\n"

        # Add learning objectives based on intent
        if intent_data:
            primary_intent = intent_data.get('primary_intent', 'general')
            if primary_intent in ['tutor_request', 'clarification']:
                formatted_answer += "### 🎯 **Learning Objectives:**\n"
                formatted_answer += "1. Understand the core concepts explained\n"
                formatted_answer += "2. Apply the knowledge to practical scenarios\n"
                formatted_answer += "3. Connect with related topics\n\n"

        return formatted_answer

    def _generate_follow_up_questions(self, query: str, intent_data: Dict = None) -> List[str]:
        """
        Generate relevant follow-up questions based on the query and intent
        """
        follow_ups = []

        # Enhanced follow-up generation based on the specific query content
        query_lower = query.lower()

        if intent_data:
            primary_intent = intent_data.get('primary_intent', 'general')
            intent_scores = intent_data.get('intent_scores', {})

            # Specific follow-ups based on content
            if any(word in query_lower for word in ['ros', 'ros2', 'robot operating system']):
                follow_ups.extend([
                    "Would you like to know about ROS 2 nodes and topics?",
                    "Do you need information about ROS 2 services and actions?",
                    "Are you interested in ROS 2 launch files?"
                ])
            elif any(word in query_lower for word in ['gazebo', 'simulation', 'simulator']):
                follow_ups.extend([
                    "Would you like to learn about Gazebo plugins?",
                    "Do you need information about world building in Gazebo?",
                    "Are you interested in sensor simulation?"
                ])
            elif any(word in query_lower for word in ['vla', 'vision', 'language', 'action']):
                follow_ups.extend([
                    "Would you like to know about VLA architectures?",
                    "Do you need information about multimodal fusion?",
                    "Are you interested in VLA training methodologies?"
                ])
            elif any(word in query_lower for word in ['humanoid', 'walking', 'locomotion']):
                follow_ups.extend([
                    "Would you like to learn about inverse kinematics?",
                    "Do you need information about balance control?",
                    "Are you interested in gait patterns?"
                ])
            elif any(word in query_lower for word in ['control', 'ai', 'learning']):
                follow_ups.extend([
                    "Would you like to know about reinforcement learning approaches?",
                    "Do you need information about classical control methods?",
                    "Are you interested in model predictive control?"
                ])

            # Intent-specific follow-ups
            if primary_intent in ['tutor_request', 'clarification', 'what']:
                follow_ups.extend([
                    "Would you like me to provide a practical example?",
                    "Do you need more details on any specific aspect?",
                    "Are there related concepts you'd like me to explain?"
                ])
            elif primary_intent in ['how', 'implementation', 'technical_question']:
                follow_ups.extend([
                    "Would you like to see sample code for this?",
                    "Do you need information about different approaches?",
                    "Are you interested in best practices for this?"
                ])
            elif primary_intent in ['comparison']:
                follow_ups.extend([
                    "Would you like me to compare these in more detail?",
                    "Do you need information about when to use each approach?",
                    "Are there hybrid approaches that combine these methods?"
                ])
            elif primary_intent in ['example_request']:
                follow_ups.extend([
                    "Would you like to see more examples?",
                    "Do you need examples for different scenarios?",
                    "Are you looking for advanced applications of this concept?"
                ])

        # Add context-aware follow-ups based on confidence and query length
        if intent_data:
            confidence = intent_data.get('confidence', 0)
            query_length = intent_data.get('query_length', 0)

            if confidence < 0.3:
                follow_ups.insert(0, "Could you provide more details about what you're looking for?")

            if query_length < 5:
                follow_ups.insert(0, "Could you clarify your question further?")

        # Add generic follow-ups if no specific ones were generated
        if not follow_ups:
            follow_ups.extend([
                "Would you like me to elaborate on any part of this?",
                "Do you have any related questions?",
                "Would you like me to provide more resources on this topic?"
            ])

        return follow_ups

    def inject_context_into_response(self, response: str, matched_chunks: List[Dict], query: str) -> str:
        """
        Inject relevant context from matched chunks into the response
        """
        if not matched_chunks:
            return response

        # Sort chunks by relevance (similarity score)
        sorted_chunks = sorted(matched_chunks, key=lambda x: x.get('similarity_score', 0), reverse=True)

        # Add context injection with multiple relevant sources
        context_injection = f"\n\n📚 **Reference Materials:** The following information was sourced from our knowledge base:\n\n"

        # Include top 2 most relevant chunks
        for i, chunk in enumerate(sorted_chunks[:2]):
            content_preview = chunk.get('content', '')[:200] + "..." if len(chunk.get('content', '')) > 200 else chunk.get('content', '')
            context_injection += f"**Source {i+1}:** [{chunk.get('url', 'Unknown source')}]({chunk.get('url', '#')})\n"
            context_injection += f"**Relevance:** {chunk.get('similarity_score', 0):.3f}\n"
            context_injection += f"**Content:** {content_preview}\n\n"

        return response + context_injection

    def enhance_answer(self, original_answer: str, query: str, tutor_mode: bool = False, intent_data: Dict = None) -> str:
        """
        Enhance the answer based on intent and tutor mode
        """
        if not tutor_mode:
            return original_answer

        enhanced_answer = original_answer

        # Add teaching elements based on detected intent
        if intent_data:
            primary_intent = intent_data.get('primary_intent', 'general')
            confidence = intent_data.get('confidence', 0)

            if primary_intent in ['tutor_request', 'clarification']:
                enhanced_answer = f"🎯 **Teaching Point:** {enhanced_answer}"
            elif primary_intent in ['example_request']:
                enhanced_answer += "\n\n🔍 **Example:** I've provided the requested example. Would you like to see additional examples or variations?"
            elif primary_intent in ['comparison']:
                enhanced_answer += "\n\n📊 **Comparison Insight:** The key differences have been highlighted above for better understanding."
            elif primary_intent in ['summary']:
                enhanced_answer = f"📋 **Summary:** {enhanced_answer}"
            elif primary_intent in ['technical_question']:
                enhanced_answer += "\n\n⚙️ **Technical Detail:** This is a technical implementation detail that's important for practical applications."

        # Add adaptive elements based on confidence level
        if intent_data and intent_data.get('confidence', 0) < 0.3:
            enhanced_answer += "\n\n⚠️ **Note:** The information provided is based on general knowledge as the specific context wasn't found in our knowledge base. For more precise information, please provide additional details."

        # Add pedagogical elements for tutor mode
        if tutor_mode:
            query_lower = query.lower()

            # Add specific encouragement based on query type
            if any(word in query_lower for word in ['help', 'understand', 'explain']):
                enhanced_answer += "\n\n🎓 **Tutor Note:** Great question! This concept builds upon previous topics. Remember to practice what you've learned to reinforce your understanding."
            elif any(word in query_lower for word in ['difficult', 'hard', 'challenging']):
                enhanced_answer += "\n\n💪 **Encouragement:** Don't worry! This is indeed challenging material. Take your time to understand the fundamentals before moving to more complex aspects."
            elif any(word in query_lower for word in ['practice', 'exercise', 'problem']):
                enhanced_answer += "\n\n📝 **Practice Tip:** Try implementing this concept with a simple example first, then gradually increase complexity."
            else:
                enhanced_answer += "\n\n🎓 **Tutor Tip:** Understanding this concept is crucial for mastering Physical AI & Humanoid Robotics. Feel free to ask follow-up questions or request practical examples!"

        return enhanced_answer

def query_agent(query_text: str) -> Dict:
    """
    Convenience function to query the RAG agent
    """
    agent = RAGAgent()
    return agent.query_agent(query_text)

def run_agent_sync(query_text: str) -> Dict:
    """
    Synchronous function to run the agent for direct usage
    """
    import asyncio

    async def run_async():
        agent = RAGAgent()
        return await agent._async_query_agent(query_text)

    # Check if there's already a running event loop
    try:
        loop = asyncio.get_running_loop()
        # If there's already a loop, run in a separate thread
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(asyncio.run, run_async())
            return future.result()
    except RuntimeError:
        # No running loop, safe to use asyncio.run
        return asyncio.run(run_async())

def main():
    """
    Main function to demonstrate the RAG agent functionality
    """
    logger.info("Initializing RAG Agent...")

    # Initialize the agent
    agent = RAGAgent()

    # Example queries to test the system
    test_queries = [
        "What is ROS2?",
        "Explain humanoid design principles",
        "How does VLA work?",
        "What are simulation techniques?",
        "Explain AI control systems"
    ]

    print("RAG Agent - Testing Queries")
    print("=" * 50)

    for i, query in enumerate(test_queries, 1):
        print(f"\nQuery {i}: {query}")
        print("-" * 30)

        # Process query through agent
        response = agent.query_agent(query)

        # Print formatted results
        print(f"Answer: {response['answer']}")

        if response.get('sources'):
            print(f"Sources: {len(response['sources'])} documents")
            for source in response['sources'][:3]:  # Show first 3 sources
                print(f"  - {source}")

        if response.get('matched_chunks'):
            print(f"Matched chunks: {len(response['matched_chunks'])}")
            for j, chunk in enumerate(response['matched_chunks'][:2], 1):  # Show first 2 chunks
                content_preview = chunk['content'][:100] + "..." if len(chunk['content']) > 100 else chunk['content']
                print(f"  Chunk {j}: {content_preview}")
                print(f"    Source: {chunk['url']}")
                print(f"    Score: {chunk['similarity_score']:.3f}")

        print(f"Query time: {response['query_time_ms']:.2f}ms")
        print(f"Confidence: {response.get('confidence', 'unknown')}")

        if i < len(test_queries):  # Don't sleep after the last query
            time.sleep(1)  # Small delay between queries

if __name__ == "__main__":
    main()