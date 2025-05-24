import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// SVG icons as components
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path
      fillRule="evenodd"
      d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-7.152.52c-2.43 0-4.817-.178-7.152-.52C2.87 16.438 1.5 14.706 1.5 12.76V6.741c0-1.946 1.37-3.68 3.348-3.97z"
      clipRule="evenodd"
    />
    <path d="M7.5 15.75c-.414 0-.75.336-.75.75s.336.75.75.75h.008a.75.75 0 00.75-.75.75.75 0 00-.75-.75H7.5zM12 15.75a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75V16.5a.75.75 0 01.75-.75H12zM16.5 15.75c-.414 0-.75.336-.75.75s.336.75.75.75h.008a.75.75 0 00.75-.75.75.75 0 00-.75-.75H16.5z" />
  </svg>
);

const MinimizeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
      clipRule="evenodd"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

const FloatingChatbotCreator = ({ onChatbotCreated, onClose }) => {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdChatbot, setCreatedChatbot] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false); // Start expanded
  const messagesEndRef = useRef(null);

  // API endpoint
  const API_URL = "http://localhost:8000/api/chatbot-creator/";

  // Initialize conversation on component mount
  useEffect(() => {
    startConversation();
  }, []);

  // Scroll to bottom of messages when they change
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  // When a chatbot is created, notify the parent component
  useEffect(() => {
    if (createdChatbot && onChatbotCreated) {
      onChatbotCreated(createdChatbot);
    }
  }, [createdChatbot, onChatbotCreated]);

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(API_URL, { message: "" });
      setSessionId(response.data.session_id);
      setMessages([{ sender: "bot", text: response.data.message }]);
    } catch (error) {
      console.error("Error starting conversation:", error);
      setMessages([
        {
          sender: "bot",
          text: "Error connecting to the chatbot creator service. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { sender: "user", text: inputMessage }]);
    setIsLoading(true);
    const userMessage = inputMessage;
    setInputMessage("");

    try {
      // Send message to backend
      const response = await axios.post(API_URL, {
        session_id: sessionId,
        message: userMessage,
      });

      // Add bot response to chat if there's a message
      if (response.data.message) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: response.data.message },
        ]);
      }

      // Check if chatbot was created
      if (response.data.function_called && response.data.chatbot) {
        console.log("Chatbot created:", response.data.chatbot);
        setCreatedChatbot(response.data.chatbot);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, there was an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setCreatedChatbot(null);
    setMessages([]);
    startConversation();
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const closeChat = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col">
      {/* Chat bubble when minimized */}
      {isMinimized ? (
        <button
          onClick={toggleMinimize}
          className="self-end bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <ChatIcon />
        </button>
      ) : (
        /* Chat window when expanded */
        <div className="flex flex-col w-80 sm:w-96 h-[500px] bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
          {/* Chat header */}
          <div className="bg-gray-900 p-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-full">
                <ChatIcon />
              </div>
              <span className="font-medium text-white">AI Chatbot Creator</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={toggleMinimize}
                className="text-gray-400 hover:text-white"
                title="Minimize"
              >
                <MinimizeIcon />
              </button>
              <button
                onClick={closeChat}
                className="text-gray-400 hover:text-white"
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-800 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-700 text-white rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="loading-dots">
                  <span className="bg-blue-500"></span>
                  <span className="bg-blue-500"></span>
                  <span className="bg-blue-500"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Created chatbot info */}
          {createdChatbot && (
            <div className="p-3 bg-gray-900 border-t border-gray-700">
              <div className="bg-green-800 bg-opacity-40 p-2 rounded-md mb-2">
                <p className="text-green-400 text-sm font-medium">
                  Chatbot Created Successfully!
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div className="bg-gray-700 p-2 rounded">
                  <span className="text-gray-400">Name</span>
                  <p className="text-white font-medium">
                    {createdChatbot.name}
                  </p>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <span className="text-gray-400">Domain</span>
                  <p className="text-white font-medium">
                    {createdChatbot.domain}
                  </p>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <span className="text-gray-400">Language</span>
                  <p className="text-white font-medium">
                    {createdChatbot.language}
                  </p>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <span className="text-gray-400">Style</span>
                  <p className="text-white font-medium">
                    {createdChatbot.style}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateAnother}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition-colors duration-200"
              >
                Create Another Chatbot
              </button>
            </div>
          )}

          {/* Input area */}
          {!createdChatbot && (
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-gray-900 border-t border-gray-700 flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className={`bg-blue-600 p-2.5 rounded-full ${
                  isLoading || !inputMessage.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                } transition-colors duration-200`}
              >
                <SendIcon />
              </button>
            </form>
          )}
        </div>
      )}

      <style jsx>{`
        .loading-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        .loading-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          animation: loadingDots 1.4s infinite ease-in-out both;
        }
        .loading-dots span:nth-child(1) {
          animation-delay: -0.32s;
        }
        .loading-dots span:nth-child(2) {
          animation-delay: -0.16s;
        }
        @keyframes loadingDots {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingChatbotCreator;
