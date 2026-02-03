import { useState, useEffect } from "react";
import axios from "axios";
import "./chat.css";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your Physical AI & Humanoid Robotics assistant. Ask me anything about ROS 2, simulation, VLA systems, hardware integration, or humanoid design!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutorMode, setTutorMode] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Generate a unique session ID if not already set
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, []);

  // Initialize with welcome message when chat opens
  useEffect(() => {
    if (open && messages.length === 1 && messages[0].sender === "bot" &&
        messages[0].text.includes("Hello!")) {
      // Welcome message already set
    } else if (open && messages.length === 0) {
      setMessages([
        {
          sender: "bot",
          text: "Hello! I'm your Physical AI & Humanoid Robotics assistant. Ask me anything about ROS 2, simulation, VLA systems, hardware integration, or humanoid design!"
        }
      ]);
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // Handle special commands
    const trimmedInput = input.trim().toLowerCase();

    if (trimmedInput === '/help' || trimmedInput === 'help') {
      const helpMessage = "🤖 **Chat Commands Available:**\n\n" +
                         "• Ask about robotics topics (ROS 2, simulation, VLA, etc.)\n" +
                         "• Type 'examples' to see sample questions\n" +
                         "• Type 'topics' to see covered subjects\n" +
                         "• Type '/tutor' to toggle tutor mode\n" +
                         "• Type '/clear' to clear the chat\n" +
                         "• Type '/help' to see this menu again";

      setMessages(prev => [...prev,
        { sender: "user", text: input },
        { sender: "bot", text: helpMessage }
      ]);
      setInput("");
      return;
    }

    if (trimmedInput === '/tutor') {
      const newTutorMode = !tutorMode;
      setTutorMode(newTutorMode);

      const tutorMessage = newTutorMode
        ? "🎓 **Tutor Mode Activated!** I'll provide more detailed explanations, examples, and follow-up questions to enhance your learning experience."
        : "💬 **Tutor Mode Deactivated.** I'll provide concise answers. Use '/tutor' to reactivate.";

      setMessages(prev => [...prev,
        { sender: "user", text: input },
        { sender: "bot", text: tutorMessage }
      ]);
      setInput("");
      return;
    }

    if (trimmedInput === '/clear') {
      setMessages([
        {
          sender: "bot",
          text: "Chat cleared. Hello! I'm your Physical AI & Humanoid Robotics assistant. Ask me anything about ROS 2, simulation, VLA systems, hardware integration, or humanoid design!"
        }
      ]);
      setInput("");
      return;
    }

    if (trimmedInput === 'examples') {
      const examplesMessage = "📚 **Sample Questions You Can Ask:**\n\n" +
                            "• \"Explain ROS 2 architecture\"\n" +
                            "• \"How does Gazebo simulation work?\"\n" +
                            "• \"What are VLA systems?\"\n" +
                            "• \"Compare Isaac Sim and Unity for robotics\"\n" +
                            "• \"Explain humanoid locomotion principles\"";

      setMessages(prev => [...prev,
        { sender: "user", text: input },
        { sender: "bot", text: examplesMessage }
      ]);
      setInput("");
      return;
    }

    if (trimmedInput === 'topics') {
      const topicsMessage = "🔬 **Covered Topics:**\n\n" +
                          "• **ROS 2**: Framework, nodes, topics, services\n" +
                          "• **Simulation**: Gazebo, Isaac Sim, Unity, Webots\n" +
                          "• **VLA Systems**: Vision-Language-Action integration\n" +
                          "• **Hardware**: Actuators, sensors, embedded systems\n" +
                          "• **AI Control**: RL, MPC, trajectory optimization\n" +
                          "• **Humanoid Design**: Kinematics, mechanics, locomotion";

      setMessages(prev => [...prev,
        { sender: "user", text: input },
        { sender: "bot", text: topicsMessage }
      ]);
      setInput("");
      return;
    }

    const userMessage = { sender: "user", text: input };
    const currentInput = input;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Try multiple potential backend URLs to handle different deployment scenarios
      const backendUrls = [
        "http://127.0.0.1:8001/chat",  // Standard IP address on port 8001
        "http://127.0.0.1:8000/chat",  // Standard IP address on port 8000
        "http://localhost:8001/chat",  // Localhost on port 8001
        "http://localhost:8000/chat",  // Localhost on port 8000
        "/api/chat",                   // Proxy path (if configured)
      ];

      let res;
      let attemptedUrl = "";

      // Try each URL until one succeeds
      let lastError = null;
      for (const url of backendUrls) {
        try {
          attemptedUrl = url;
          res = await axios.post(
            url,
            {
              query: currentInput,
              tutor_mode: tutorMode,
              session_id: sessionId
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
              },
              timeout: 45000,  // Increased timeout for more complex queries
              // Add retry mechanism with proper error handling
              validateStatus: function (status) {
                return status < 500; // Resolve only if the status code is less than 500
              }
            }
          );

          // If successful, break out of the loop
          if (res && res.status < 500) {
            console.log(`Successfully connected to backend via: ${url}`);
            break;
          }
        } catch (urlErr) {
          lastError = urlErr;
          console.warn(`Attempt failed for ${url}:`, urlErr.message);

          // If this was the last URL in the list, throw the error
          if (url === backendUrls[backendUrls.length - 1]) {
            console.error("All backend connection attempts failed:", urlErr);
            throw urlErr;
          }
        }
      }

      // Check if response indicates an error
      if (res.status >= 400) {
        throw new Error(`Backend responded with status ${res.status}: ${res.statusText}`);
      }

      // Check if response data is valid
      if (!res.data) {
        throw new Error("Invalid response from server - no data received");
      }

      // Check for specific error in response
      if (res.data.error && res.data.status === "error") {
        throw new Error(res.data.error);
      }

      const botReply = res.data?.answer || "I'm unable to provide a detailed answer at the moment. Please try rephrasing your question.";

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply }
      ]);

    } catch (err) {
      console.error("Chat error:", err); // Log the full error for debugging

      let errorMessage = "⚠️ I'm currently experiencing connectivity issues. ";

      // Provide more specific guidance based on error type
      if (err.code === 'ECONNREFUSED' || err.message.includes('connect') || err.message.includes('ENOTFOUND')) {
        errorMessage = "⚠️ Unable to connect to the AI service. Please ensure the backend server is running at http://127.0.0.1:8000 or http://localhost:8000.";

        // Try to check if server is running by making a simple request
        try {
          fetch('http://127.0.0.1:8000/health', { method: 'GET', timeout: 5000 })
            .then(response => {
              if (!response.ok) {
                console.log("Backend server might not be running or is not accessible");
              }
            })
            .catch(healthErr => {
              console.log("Health check failed - backend likely not running:", healthErr.message);
            });
        } catch (healthErr) {
          console.log("Could not perform health check:", healthErr.message);
        }
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = "⚠️ Request timed out. The AI service may be busy or taking too long to respond. Please try your question again.";
      } else if (err.response?.status === 400) {
        errorMessage = "⚠️ Bad request. Please check your query and try again.";
      } else if (err.response?.status === 401) {
        errorMessage = "⚠️ Unauthorized access. Please check your credentials.";
      } else if (err.response?.status === 403) {
        errorMessage = "⚠️ Forbidden. You don't have permission to access this resource.";
      } else if (err.response?.status === 404) {
        errorMessage = "⚠️ Service not found. The backend endpoint may not be available.";
      } else if (err.response?.status === 500) {
        errorMessage = "⚠️ Server error. The AI service encountered an internal issue. Please try again later.";
      } else if (err.response?.status === 502) {
        errorMessage = "⚠️ Bad gateway. The server received an invalid response from the upstream server.";
      } else if (err.response?.status === 503) {
        errorMessage = "⚠️ Service unavailable. The server is temporarily unable to handle the request.";
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "⚠️ No response received from the server. Please check your internet connection and ensure the backend is running.";

        // Try to check if server is running by making a health check
        try {
          // Try both common ports
          fetch('http://127.0.0.1:8001/health')
            .then(healthRes => {
              if (healthRes.ok) {
                console.log("Backend server is running and healthy on port 8001");
              } else {
                return fetch('http://127.0.0.1:8000/health');
              }
            })
            .then(healthRes => {
              if (healthRes && healthRes.ok) {
                console.log("Backend server is running and healthy on port 8000");
              } else if (healthRes) {
                console.log("Backend server may not be accessible on either port 8000 or 8001");
              }
            })
            .catch(healthErr => {
              console.log("Health check failed on both ports - backend likely not running:", healthErr.message);
            });
        } catch (healthErr) {
          console.log("Could not perform health check:", healthErr.message);
        }
      } else {
        // Something else happened in setting up the request
        errorMessage += `Details: ${err.message}`;
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: errorMessage }
      ]);

    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <button className="chat-button" onClick={() => setOpen(!open)}>
        💬 Chat
      </button>

      {open && (
        <div className="chat-box">
          <div className="chat-header">
            <div className="header-content">
              <strong>AI Assistant</strong>
              <div className="session-info">
                <span className={`tutor-mode-toggle ${tutorMode ? 'active' : ''}`} onClick={() => {
                  setTutorMode(!tutorMode);
                  const tutorMessage = !tutorMode
                    ? "🎓 **Tutor Mode Activated!** I'll provide more detailed explanations, examples, and follow-up questions to enhance your learning experience."
                    : "💬 **Tutor Mode Deactivated.** I'll provide concise answers.";

                  setMessages(prev => [...prev, { sender: "bot", text: tutorMessage }]);
                }}>
                  🎓 Tutor: {tutorMode ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>

          <div className="chat-body">
            {messages.map((m, i) => {
              let bubbleClass = `bubble ${m.sender}`;

              // Add special classes for help, examples, and topics messages
              if (m.sender === 'bot') {
                if (m.text.includes('Chat Commands Available')) {
                  bubbleClass += ' help';
                } else if (m.text.includes('Sample Questions You Can Ask')) {
                  bubbleClass += ' examples';
                } else if (m.text.includes('Covered Topics')) {
                  bubbleClass += ' topics';
                } else if (m.text.includes('Tutor Mode')) {
                  bubbleClass += ' info';
                }
              }

              return (
                <div key={i} className={bubbleClass}>
                  {m.text.split('\n').map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              );
            })}

            {loading && (
              <div className="bubble bot">
                <div className="typing-indicator">
                  <span>Thinking</span>
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Type your question... ${tutorMode ? '(Tutor Mode Active)' : ''}`}
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
