import React, { useState } from "react";
import { useDropzone } from "react-dropzone"; // For drag-and-drop file uploads
import {
  FiSend,
  FiMessageCircle,
  FiDatabase,
  FiMonitor,
  FiGlobe,
  FiFileText,
  FiGrid,
  FiX,
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
import handleModalSubmit from "../Services/HandleDocuments";
import Cookies from "js-cookie";
import DeployModal from "../components/DeployModal";
import handleDeploy from "../Services/handleDeploy";

const Studio = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [file, setFile] = useState(null);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const chatbot = location.state?.bot;
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [text, setText] = useState(`
    ## Identity
    You are the Customer Support AI Agent for [COMPANY NAME]. Your role is to interact with customers, address their inquiries, and provide assistance with common support topics.
    
    ## Scope
    - Focus on customer inquiries about orders, billing, account issues, and general support.
    - Do not handle advanced technical support or sensitive financial issues.
    - Redirect or escalate issues outside your expertise to a human agent.
    
    ## Responsibility
    - Initiate interactions with a friendly greeting.
    - Guide the conversation based on customer needs.
    - Provide accurate and concise information.
    - Escalate to a human agent when customer inquiries exceed your capabilities.
    
    ## Response Style
    - Maintain a friendly, clear, and professional tone.
    - Keep responses brief and to the point.
    - Use buttons for quick replies and easy navigation whenever possible.
    
    ## Ability
    - Delegate specialized tasks to AI-Associates or escalate to a human when needed.
    
    ## Guardrails
    - **Privacy**: Respect customer privacy; only request personal data if absolutely necessary.
    - **Accuracy**: Provide verified and factual responses coming from Knowledge Base or official sources. Avoid speculation.
    
    ## Instructions
    - **Greeting**: Start every conversation with a friendly welcome.
      _Example_: "Hi, welcome to [COMPANY NAME] Support! How can I help you today?"
    - **Escalation**: When a customer query becomes too complex or sensitive, notify the customer that you'll escalate the conversation to a human agent.
      _Example_: "I’m having trouble resolving this. Let me get a human agent to assist you further."
    - **Closing**: End interactions by confirming that the customer's issue has been addressed.
      _Example_: "Is there anything else I can help you with today?"
      `);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    // Add user's message to the chat
    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Show loading state
    setIsLoading(true);

    // Retrieve the authentication token
    const token = Cookies.get("access_token");

    if (!token) {
      console.error("No authentication token found! Please log in.");
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Error: Please log in to continue." },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      // Send the user's message to the chatbot API
      const response = await fetch("http://localhost:8000/api/test_ChatBot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include JWT token
        },
        body: JSON.stringify({
          chatbot_id: chatbot.id, // Ensure `chatbot.id` is defined
          session_id: 10, // Replace with dynamic session ID if needed
          company_name: "Linedata", // Replace with dynamic company name if needed
          message: input,
        }),
      });

      // Check if the API response is successful
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Parse the API response
      const data = await response.json();

      // Add the bot's response to the chat
      const botMessage = {
        sender: "bot",
        text: data.response || "I'm not sure, please try again.",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error communicating with chatbot:", error);

      // Add an error message to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Error: Unable to reach chatbot service." },
      ]);
    } finally {
      // Hide loading state
      setIsLoading(false);
    }

    // Clear the input field
    setInput("");
  };

  const handleSourceClick = (source) => {
    setSelectedSource(source);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    if (selectedSource === "Document" && file) {
      const formData = new FormData();
      formData.append("chatbot", chatbot.id);
      formData.append("file", file);
      handleModalSubmit(formData);
      setIsModalOpen(false);
      setFile(null);
    } else if (selectedSource !== "Document") {
      alert(`Data submitted for ${selectedSource}`);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
  });

  const confirmDeploy = async () => {
    const result = await handleDeploy(chatbot.id);
    return result;
  };

  const handleChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-4 flex flex-col">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FiMonitor /> BotForge
        </h1>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Instructions Section */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FiMessageCircle /> Instructions
          </h2>
          <textarea
            className="text-sm mt-2 p-2 bg-gray-900 text-white rounded-lg w-full"
            value={text}
            onChange={handleChange} // Update the state as the user types
          ></textarea>
        </div>

        {/* Knowledge Base Section */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FiDatabase /> Knowledge Bases
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              className="bg-blue-600 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
              onClick={() => handleSourceClick("Website")}
            >
              <FiGlobe /> Website
            </button>
            <button
              className="bg-yellow-600 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-yellow-700 transition"
              onClick={() => handleSourceClick("Document")}
            >
              <FiFileText /> Document
            </button>
            <button
              className="bg-green-600 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition"
              onClick={() => handleSourceClick("Table")}
            >
              <FiGrid /> Table
            </button>
          </div>
          {/*  Deploy button */}
          <div className="mt-6 text-center">
            <button
              disabled={chatbot.is_deployed}
              className="bg-purple-600 px-8 py-3 rounded-md hover:bg-purple-400 transition"
              onClick={() => setIsDeployModalOpen(true)}
            >
              Get API Credentials
            </button>
            {isDeployModalOpen && (
              <DeployModal
                onClose={() => setIsDeployModalOpen(false)}
                onConfirm={confirmDeploy}
              />
            )}
          </div>
        </div>
      </div>

      {/* Emulator Panel (Conversational UI) */}
      <aside className="w-1/3 bg-gray-800 p-4 flex flex-col">
        {/* Chatbot Header */}
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FiMessageCircle /> Chatbot Emulator
        </h2>

        {/* Chat Messages Container */}
        <div className="flex-1 bg-gray-700 p-3 rounded-lg mt-2 overflow-y-auto h-96">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 my-2 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-right"
                    : "bg-gray-600 text-left"
                }`}
              >
                {msg.text}
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">
              Start the conversation...
            </p>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-gray-400 text-center">Bot is typing...</div>
          )}
        </div>

        {/* Input Field and Send Button */}
        <div className="mt-2 flex">
          <input
            type="text"
            className="flex-1 p-2 rounded-l-lg text-black"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="bg-blue-600 px-4 py-2 rounded-r-lg flex items-center gap-2 hover:bg-blue-700 transition"
            onClick={sendMessage}
            disabled={isLoading} // Disable button while loading
          >
            <FiSend /> Send
          </button>
        </div>
      </aside>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-1/3">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              {selectedSource === "Document" ? <FiFileText /> : <FiGlobe />}
              Add {selectedSource}
            </h2>
            {selectedSource === "Document" ? (
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-600 p-6 rounded-lg text-center cursor-pointer hover:border-gray-500 transition"
              >
                <input {...getInputProps()} />

                <p className="mt-2 text-gray-400">
                  Drag and drop a file here, or click to select a file
                </p>
                {file && (
                  <div className="mt-4 flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                    <span className="text-sm">{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the dropzone
                        setFile(null);
                      }}
                      className="text-gray-400 hover:text-gray-200"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                className="w-full p-2 rounded-lg text-black mb-4"
                placeholder={`Enter ${selectedSource} URL or data`}
              />
            )}
            <div className="flex justify-end">
              <button
                className="bg-gray-600 px-4 py-2 rounded-lg mr-2 hover:bg-gray-700 transition"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Studio;
