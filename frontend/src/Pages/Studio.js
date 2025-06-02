import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  FiSend,
  FiMessageCircle,
  FiDatabase,
  FiMonitor,
  FiGlobe,
  FiFileText,
  FiGrid,
  FiX,
  FiFile,
  FiRefreshCw,
  FiFolder,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import handleModalSubmit from "../Services/HandleDocuments";
import handleWebsiteScrape from "../Services/handlewebsite";
import handleTableSubmit from "../Services/handleDB";
import Cookies from "js-cookie";
import DeployModal from "../components/DeployModal";
import handleDeploy from "../Services/handleDeploy";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Studio = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [file, setFile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const chatbot = location.state?.bot;
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Document states
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);

  // Website URL state
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Database connection states
  const [selectedDbType, setSelectedDbType] = useState("MySQL");
  const [dbCredentials, setDbCredentials] = useState({
    host: "",
    user: "",
    password: "",
    database: "",
    server: "",
    username: "",
    dsn: "",
    db_path: "",
    table_name: "",
  });

  // Prompt states
  const [prompt, setPrompt] = useState(chatbot?.system_prompt || "");
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [promptSaved, setPromptSaved] = useState(false);

  // Edit chatbot states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingChatbot, setIsSavingChatbot] = useState(false);
  const [isDeletingChatbot, setIsDeletingChatbot] = useState(false);
  const [chatbotData, setChatbotData] = useState({
    name: chatbot?.name || "",
    domain: chatbot?.domain || "",
    company_name: chatbot?.company_name || "",
    style: chatbot?.style || "",
    language: chatbot?.language || "English",
  });

  // Function to fetch documents from the backend
  const fetchDocuments = async () => {
    if (!chatbot?.id) {
      console.error("No chatbot ID available");
      return;
    }

    setIsLoadingDocuments(true);
    setDocumentsError(null);

    const token = Cookies.get("access_token");
    if (!token) {
      setDocumentsError("No authentication token found");
      setIsLoadingDocuments(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents/?chatbot=${chatbot.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }

      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocumentsError(error.message);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Fetch documents when component mounts or chatbot changes
  useEffect(() => {
    if (chatbot?.id) {
      fetchDocuments();
    }
  }, [chatbot?.id]);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

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
      const response = await fetch(`${API_BASE_URL}/api/test_ChatBot/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatbot_id: chatbot.id,
          session_id: Cookies.get("session_id"),
          message: input,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const botMessage = {
        sender: "bot",
        text: data.response || "I'm not sure, please try again.",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error communicating with chatbot:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Error: Unable to reach chatbot service." },
      ]);
    } finally {
      setIsLoading(false);
    }

    setInput("");
  };

  const handleSourceClick = (source) => {
    setSelectedSource(source);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (selectedSource === "Document" && file) {
      const formData = new FormData();
      formData.append("chatbot", chatbot.id);
      formData.append("file", file);

      try {
        await handleModalSubmit(formData);
        setIsModalOpen(false);
        setFile(null);
        fetchDocuments();
      } catch (error) {
        console.error("Error uploading document:", error);
      }
    } else if (selectedSource === "Table") {
      try {
        await handleTableSubmit(chatbot.id, selectedDbType, dbCredentials);
        setIsModalOpen(false);
        // Reset form
        setDbCredentials({
          host: "",
          user: "",
          password: "",
          database: "",
          server: "",
          username: "",
          dsn: "",
          db_path: "",
          table_name: "",
        });
        setSelectedDbType("MySQL");
      } catch (error) {
        console.error("Error connecting to database:", error);
      }
    } else if (selectedSource === "Website" && websiteUrl.trim()) {
      try {
        await handleWebsiteScrape(websiteUrl, chatbot.id);
        setIsModalOpen(false);
        setWebsiteUrl(""); // Reset the URL input
        fetchDocuments(); // Refresh documents list in case website content was added
        alert("Website content scraped successfully!");
      } catch (error) {
        console.error("Error scraping website:", error);
        alert("Error scraping website: " + error.message);
      }
    }
  };

  const handleCredentialChange = (field, value) => {
    setDbCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getRequiredFields = (dbType) => {
    const fields = {
      MySQL: ["host", "user", "password", "database", "table_name"],
      MariaDB: ["host", "user", "password", "database", "table_name"],
      MSSQL: ["server", "username", "password", "database", "table_name"],
      PostgreSQL: ["host", "user", "password", "database", "table_name"],
      CockroachDB: ["host", "user", "password", "database", "table_name"],
      Oracle: ["user", "password", "dsn", "table_name"],
      Firebird: ["host", "user", "password", "database", "table_name"],
      SQLite: ["db_path", "table_name"],
    };
    return fields[dbType] || [];
  };

  const getFieldLabel = (field) => {
    const labels = {
      host: "Host",
      user: "User",
      password: "Password",
      database: "Database",
      server: "Server",
      username: "Username",
      dsn: "DSN",
      db_path: "Database Path",
      table_name: "Table Name",
    };
    return labels[field] || field;
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
    setPrompt(e.target.value);
  };

  // Function to save prompt to backend
  const savePrompt = async () => {
    if (!chatbot?.id) {
      alert("No chatbot ID available");
      return;
    }

    setIsSavingPrompt(true);
    setPromptSaved(false);

    const token = Cookies.get("access_token");
    if (!token) {
      alert("No authentication token found. Please log in.");
      setIsSavingPrompt(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbots/${chatbot.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            system_prompt: prompt,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save prompt: ${response.status}`);
      }

      setPromptSaved(true);
      setTimeout(() => setPromptSaved(false), 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error("Error saving prompt:", error);
      alert("Error saving prompt: " + error.message);
    } finally {
      setIsSavingPrompt(false);
    }
  };

  // Function to handle chatbot data changes
  const handleChatbotChange = (field, value) => {
    setChatbotData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to save chatbot changes
  const saveChatbotChanges = async () => {
    if (!chatbot?.id) {
      alert("No chatbot ID available");
      return;
    }

    setIsSavingChatbot(true);

    const token = Cookies.get("access_token");
    if (!token) {
      alert("No authentication token found. Please log in.");
      setIsSavingChatbot(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbots/${chatbot.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(chatbotData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save chatbot: ${response.status}`);
      }

      alert("Chatbot updated successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving chatbot:", error);
      alert("Error saving chatbot: " + error.message);
    } finally {
      setIsSavingChatbot(false);
    }
  };

  // Function to delete chatbot
  const deleteChatbot = async () => {
    if (!chatbot?.id) {
      alert("No chatbot ID available");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${chatbot.name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setIsDeletingChatbot(true);

    const token = Cookies.get("access_token");
    if (!token) {
      alert("No authentication token found. Please log in.");
      setIsDeletingChatbot(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbots/${chatbot.id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete chatbot: ${response.status}`);
      }

      alert("Chatbot deleted successfully!");
      navigate("/dashboard"); // Redirect to dashboard or chatbots list
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      alert("Error deleting chatbot: " + error.message);
    } finally {
      setIsDeletingChatbot(false);
    }
  };

  // Helper function to get filename from file path
  const getFileName = (filePath) => {
    if (!filePath) return "Unknown File";
    return filePath.split("/").pop() || "Unknown File";
  };

  // Helper function to get file extension from type or filename
  const getFileExtension = (type, filePath) => {
    if (type && type.startsWith(".")) {
      return type.substring(1).toUpperCase();
    }
    if (filePath) {
      const extension = filePath.split(".").pop();
      return extension ? extension.toUpperCase() : "FILE";
    }
    return "FILE";
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-y-auto">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-800 p-4 flex flex-col">
        <h1 className="text-xl font-bold flex items-center gap-2 mb-6">
          <FiMonitor /> BotForge
        </h1>

        {/* Documents Section */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FiFolder /> Documents
            </h2>
            <button
              onClick={fetchDocuments}
              disabled={isLoadingDocuments}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Refresh documents"
            >
              <FiRefreshCw
                className={`h-4 w-4 ${
                  isLoadingDocuments ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          {/* Documents List */}
          <div className="overflow-y-auto flex-1">
            {isLoadingDocuments ? (
              <div className="flex items-center justify-center py-8">
                <FiRefreshCw className="animate-spin h-6 w-6 text-gray-400" />
                <span className="ml-2 text-gray-400">Loading documents...</span>
              </div>
            ) : documentsError ? (
              <div className="text-red-400 text-sm py-4">
                <p>Error loading documents:</p>
                <p className="text-xs mt-1">{documentsError}</p>
                <button
                  onClick={fetchDocuments}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-xs underline"
                >
                  Try again
                </button>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-gray-400 text-sm py-4 text-center">
                <FiFile className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No documents uploaded yet</p>
                <p className="text-xs mt-1">Upload documents to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <FiFileText className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          title={getFileName(doc.file)}
                        >
                          {getFileName(doc.file)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 uppercase">
                            {getFileExtension(doc.type, doc.file)}
                          </span>
                        </div>
                        {doc.uploaded_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Instructions Section */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FiMessageCircle /> Instructions
          </h2>
          <textarea
            className="text-sm mt-2 p-2 bg-gray-900 text-white rounded-lg w-full h-60 resize-none overflow-y-auto"
            value={prompt}
            onChange={handleChange}
            placeholder="Enter your chatbot instructions and prompt template..."
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {promptSaved && (
                <span className="text-green-400 text-sm flex items-center gap-1">
                  ✓ Prompt saved successfully!
                </span>
              )}
            </div>
            <button
              onClick={savePrompt}
              disabled={isSavingPrompt}
              className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSavingPrompt ? (
                <>
                  <FiRefreshCw className="animate-spin h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>Save Prompt</>
              )}
            </button>
          </div>
        </div>

        {/* Chatbot Settings Section */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FiMessageCircle /> Chatbot Settings
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Manage your chatbot configuration and settings
          </p>
          <div className="flex gap-3 mt-4 justify-center">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
            >
              Edit Chatbot
            </button>
            <button
              onClick={deleteChatbot}
              disabled={isDeletingChatbot}
              className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeletingChatbot ? (
                <>
                  <FiRefreshCw className="animate-spin h-4 w-4" />
                  Deleting...
                </>
              ) : (
                <>Delete Chatbot</>
              )}
            </button>
          </div>
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

      {/* Emulator Panel */}
      <aside className="w-1/4 bg-gray-800 p-4 flex flex-col">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FiMessageCircle /> Chatbot Emulator
        </h2>

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

          {isLoading && (
            <div className="text-gray-400 text-center">Bot is typing...</div>
          )}
        </div>

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
            disabled={isLoading}
          >
            <FiSend /> Send
          </button>
        </div>
      </aside>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-1/2 max-h-screen overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              {selectedSource === "Document" ? (
                <FiFileText />
              ) : selectedSource === "Table" ? (
                <FiGrid />
              ) : (
                <FiGlobe />
              )}
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
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-gray-400 hover:text-gray-200"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>
            ) : selectedSource === "Table" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Database Type
                  </label>
                  <select
                    value={selectedDbType}
                    onChange={(e) => setSelectedDbType(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                  >
                    <option value="MySQL">MySQL</option>
                    <option value="MariaDB">MariaDB</option>
                    <option value="MSSQL">Microsoft SQL Server</option>
                    <option value="PostgreSQL">PostgreSQL</option>
                    <option value="CockroachDB">CockroachDB</option>
                    <option value="Oracle">Oracle</option>
                    <option value="Firebird">Firebird</option>
                    <option value="SQLite">SQLite</option>
                  </select>
                </div>

                {getRequiredFields(selectedDbType).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-2">
                      {getFieldLabel(field)}
                    </label>
                    <input
                      type={field === "password" ? "password" : "text"}
                      value={dbCredentials[field]}
                      onChange={(e) =>
                        handleCredentialChange(field, e.target.value)
                      }
                      className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                      placeholder={`Enter ${getFieldLabel(
                        field
                      ).toLowerCase()}`}
                    />
                  </div>
                ))}

                <div className="p-3 bg-gray-700 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">
                    Connection Info for {selectedDbType}:
                  </h3>
                  <div className="text-xs text-gray-400 space-y-1">
                    {selectedDbType === "SQLite" && (
                      <p>
                        • SQLite: Provide the path to your .db file and table
                        name
                      </p>
                    )}
                    {(selectedDbType === "MySQL" ||
                      selectedDbType === "MariaDB") && (
                      <p>
                        • MySQL/MariaDB: Requires host, user, password, database
                        name, and table name
                      </p>
                    )}
                    {selectedDbType === "MSSQL" && (
                      <p>
                        • MSSQL: Requires server, username, password, database
                        name, and table name
                      </p>
                    )}
                    {(selectedDbType === "PostgreSQL" ||
                      selectedDbType === "CockroachDB") && (
                      <p>
                        • PostgreSQL/CockroachDB: Requires host, user, password,
                        database name, and table name
                      </p>
                    )}
                    {selectedDbType === "Oracle" && (
                      <p>
                        • Oracle: Requires user, password, DSN (Data Source
                        Name), and table name
                      </p>
                    )}
                    {selectedDbType === "Firebird" && (
                      <p>
                        • Firebird: Requires host, user, password, database
                        name, and table name
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                    placeholder="Enter website URL (e.g., https://example.com)"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">
                    Website Scraping Info:
                  </h3>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>
                      • Enter a valid URL starting with http:// , https:// or
                      www
                    </p>
                    <p>
                      • The system will extract text content from all Webpages
                      of the website
                    </p>
                    <p>
                      • Scraped content will be added to your chatbot's
                      knowledge base
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-600 px-4 py-2 rounded-lg mr-2 hover:bg-gray-700 transition"
                onClick={() => {
                  setIsModalOpen(false);
                  setWebsiteUrl(""); // Reset website URL
                  if (selectedSource === "Table") {
                    setDbCredentials({
                      host: "",
                      user: "",
                      password: "",
                      database: "",
                      server: "",
                      username: "",
                      dsn: "",
                      db_path: "",
                      table_name: "",
                    });
                    setSelectedDbType("MySQL");
                  }
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={
                  (selectedSource === "Table" &&
                    getRequiredFields(selectedDbType).some(
                      (field) => !dbCredentials[field]
                    )) ||
                  (selectedSource === "Website" && !websiteUrl.trim()) ||
                  (selectedSource === "Document" && !file)
                }
              >
                {selectedSource === "Table"
                  ? "Connect & Import"
                  : selectedSource === "Website"
                  ? "Scrape Website"
                  : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Chatbot Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-1/2 max-h-screen overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiMessageCircle />
              Edit Chatbot
            </h2>

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Chatbot Name
                </label>
                <input
                  type="text"
                  value={chatbotData.name}
                  onChange={(e) => handleChatbotChange("name", e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                  placeholder="Enter chatbot name"
                />
              </div>

              {/* Domain Field */}
              <div>
                <label className="block text-sm font-medium mb-2">Domain</label>
                <input
                  type="text"
                  value={chatbotData.domain}
                  onChange={(e) =>
                    handleChatbotChange("domain", e.target.value)
                  }
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                  placeholder="Enter domain (e.g., customer support, sales)"
                />
              </div>

              {/* Company Name Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={chatbotData.company_name}
                  onChange={(e) =>
                    handleChatbotChange("company_name", e.target.value)
                  }
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                  placeholder="Enter company name"
                />
              </div>

              {/* Style Field */}
              <div>
                <label className="block text-sm font-medium mb-2">Style</label>
                <input
                  type="text"
                  value={chatbotData.style}
                  onChange={(e) => handleChatbotChange("style", e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                  placeholder="Enter chatbot style (e.g., formal, casual, friendly)"
                />
              </div>

              {/* Language Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Language
                </label>
                <select
                  value={chatbotData.language}
                  onChange={(e) =>
                    handleChatbotChange("language", e.target.value)
                  }
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                >
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Arabic">Arabic</option>
                </select>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end mt-6 gap-2">
              <button
                className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                onClick={() => {
                  setIsEditModalOpen(false);
                  // Reset form to original values
                  setChatbotData({
                    name: chatbot?.name || "",
                    domain: chatbot?.domain || "",
                    company_name: chatbot?.company_name || "",
                    style: chatbot?.style || "",
                    language: chatbot?.language || "English",
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={saveChatbotChanges}
                disabled={isSavingChatbot}
              >
                {isSavingChatbot ? (
                  <>
                    <FiRefreshCw className="animate-spin h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Studio;
