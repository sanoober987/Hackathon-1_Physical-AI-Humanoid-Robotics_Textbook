import os
import asyncio
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Log that the environment has been loaded
logger.info("Environment variables loaded")
logger.info(f"CWD: {os.getcwd()}")

# Import the existing RAG agent functionality
from agent import RAGAgent

# Create FastAPI app
app = FastAPI(
    title="RAG Agent API",
    description="API for RAG Agent with document retrieval and question answering",
    version="1.0.0"
)

# Add CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Add exposed headers to allow frontend to see response headers
    allow_origin_regex=r"https?://localhost(:[0-9]+)?|https?://127\.0\.0\.1(:[0-9]+)?|https?://\[::1\](:[0-9]+)?|capacitor://localhost|ionic://localhost|https://.+\.vercel\.app",
    # Expose all headers to prevent issues with accessing response headers
    expose_headers=["*"]
)

# Pydantic models
class QueryRequest(BaseModel):
    query: str
    tutor_mode: Optional[bool] = False
    session_id: Optional[str] = None

class MatchedChunk(BaseModel):
    content: str
    url: str
    position: int
    similarity_score: float

class QueryResponse(BaseModel):
    answer: str
    sources: List[str]
    matched_chunks: List[MatchedChunk]
    error: Optional[str] = None
    status: str  # "success", "error", "empty"
    query_time_ms: Optional[float] = None
    confidence: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    message: str

# Global RAG agent instance
rag_agent = None

# Session storage for maintaining conversation history
session_storage = {}

@app.on_event("startup")
async def startup_event():
    """Initialize the RAG agent on startup"""
    global rag_agent
    logger.info("Initializing RAG Agent...")
    try:
        rag_agent = RAGAgent()
        logger.info("RAG Agent initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize RAG Agent: {e}")
        raise

@app.post("/ask", response_model=QueryResponse)
async def ask_rag(request: QueryRequest):
    """
    Process a user query through the RAG agent and return the response
    """
    logger.info(f"Processing query: {request.query[:50]}..., Tutor Mode: {request.tutor_mode}")

    try:
        # Validate input
        if not request.query or len(request.query.strip()) == 0:
            raise HTTPException(status_code=400, detail="Query cannot be empty")

        if len(request.query) > 2000:
            raise HTTPException(status_code=400, detail="Query too long, maximum 2000 characters")

        # Ensure RAG agent is initialized
        if rag_agent is None:
            raise HTTPException(status_code=500, detail="RAG Agent is not initialized")

        # Process query through RAG agent with tutor mode and session support
        response = rag_agent.query_agent(
            request.query,
            tutor_mode=request.tutor_mode,
            session_id=request.session_id
        )

        # Format response
        formatted_response = QueryResponse(
            answer=response.get("answer", ""),
            sources=response.get("sources", []),
            matched_chunks=[
                MatchedChunk(
                    content=chunk.get("content", ""),
                    url=chunk.get("url", ""),
                    position=chunk.get("position", 0),
                    similarity_score=chunk.get("similarity_score", 0.0)
                )
                for chunk in response.get("matched_chunks", [])
            ],
            error=response.get("error"),
            status="error" if response.get("error") else "success",
            query_time_ms=response.get("query_time_ms"),
            confidence=response.get("confidence")
        )

        logger.info(f"Query processed successfully in {response.get('query_time_ms', 0):.2f}ms")
        return formatted_response

    except HTTPException as e:
        logger.warning(f"HTTP exception in ask endpoint: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing query: {e}", exc_info=True)
        return QueryResponse(
            answer="I'm having trouble processing your request. Please try again or contact support if the issue persists.",
            sources=[],
            matched_chunks=[],
            error=f"Internal server error: {str(e)}",
            status="error"
        )


@app.post("/chat", response_model=QueryResponse)
async def chat_endpoint(request: QueryRequest):
    """
    Chat endpoint for conversational interactions with the RAG agent
    """
    logger.info(f"Processing chat message: {request.query[:50]}..., Tutor Mode: {request.tutor_mode}")

    try:
        # Validate input
        if not request.query or len(request.query.strip()) == 0:
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        if len(request.query) > 2000:
            raise HTTPException(status_code=400, detail="Message too long, maximum 2000 characters")

        # Ensure RAG agent is initialized
        if rag_agent is None:
            raise HTTPException(status_code=500, detail="RAG Agent is not initialized")

        # Process query through RAG agent with tutor mode and session support
        response = rag_agent.query_agent(
            request.query,
            tutor_mode=request.tutor_mode,
            session_id=request.session_id
        )

        # Format response for chat
        chat_response = QueryResponse(
            answer=response.get("answer", ""),
            sources=response.get("sources", []),
            matched_chunks=[
                MatchedChunk(
                    content=chunk.get("content", ""),
                    url=chunk.get("url", ""),
                    position=chunk.get("position", 0),
                    similarity_score=chunk.get("similarity_score", 0.0)
                )
                for chunk in response.get("matched_chunks", [])
            ],
            error=response.get("error"),
            status="error" if response.get("error") else "success",
            query_time_ms=response.get("query_time_ms"),
            confidence=response.get("confidence")
        )

        logger.info(f"Chat message processed successfully in {response.get('query_time_ms', 0):.2f}ms")
        return chat_response

    except HTTPException as e:
        logger.warning(f"HTTP exception in chat endpoint: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing chat message: {e}", exc_info=True)
        return QueryResponse(
            answer="I'm having trouble responding right now. Please try again or contact support if the issue persists.",
            sources=[],
            matched_chunks=[],
            error=f"Internal server error: {str(e)}",
            status="error"
        )

@app.post("/sessions/{session_id}/messages", response_model=QueryResponse)
async def add_message_to_session(session_id: str, request: QueryRequest):
    """
    Add a message to a specific session's history
    """
    logger.info(f"Adding message to session {session_id}")

    # Ensure session exists
    if session_id not in session_storage:
        session_storage[session_id] = []

    # Add the message to the session
    session_storage[session_id].append({
        "role": "user",
        "content": request.query,
        "timestamp": time.time()
    })

    # Keep only the last 5 messages to maintain session memory
    if len(session_storage[session_id]) > 5:
        session_storage[session_id] = session_storage[session_id][-5:]

    # Process the query through the RAG agent
    response = rag_agent.query_agent(request.query, tutor_mode=request.tutor_mode, session_id=session_id)

    # Add the bot response to the session
    session_storage[session_id].append({
        "role": "assistant",
        "content": response.get("answer", ""),
        "timestamp": time.time()
    })

    # Format response
    formatted_response = QueryResponse(
        answer=response.get("answer", ""),
        sources=response.get("sources", []),
        matched_chunks=[
            MatchedChunk(
                content=chunk.get("content", ""),
                url=chunk.get("url", ""),
                position=chunk.get("position", 0),
                similarity_score=chunk.get("similarity_score", 0.0)
            )
            for chunk in response.get("matched_chunks", [])
        ],
        error=response.get("error"),
        status="error" if response.get("error") else "success",
        query_time_ms=response.get("query_time_ms"),
        confidence=response.get("confidence")
    )

    return formatted_response


@app.get("/sessions/{session_id}/history")
async def get_session_history(session_id: str):
    """
    Get the conversation history for a specific session
    """
    logger.info(f"Retrieving history for session {session_id}")

    if session_id not in session_storage:
        return {"messages": [], "session_id": session_id}

    return {
        "messages": session_storage[session_id],
        "session_id": session_id,
        "count": len(session_storage[session_id])
    }


@app.delete("/sessions/{session_id}")
async def clear_session(session_id: str):
    """
    Clear the conversation history for a specific session
    """
    logger.info(f"Clearing session {session_id}")

    if session_id in session_storage:
        del session_storage[session_id]
        return {"status": "success", "message": f"Session {session_id} cleared"}

    return {"status": "success", "message": f"Session {session_id} did not exist"}


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    """
    global rag_agent
    agent_status = "initialized" if rag_agent is not None else "not_initialized"
    return HealthResponse(
        status="healthy",
        message=f"RAG Agent API is running - Agent status: {agent_status}"
    )

@app.get("/ready", response_model=HealthResponse)
async def readiness_check():
    """
    Readiness check endpoint - confirms if the service is ready to handle requests
    """
    global rag_agent
    if rag_agent is None:
        return HealthResponse(
            status="not_ready",
            message="RAG Agent is not initialized"
        )
    return HealthResponse(
        status="ready",
        message="RAG Agent API is ready to handle requests"
    )

# For running with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)