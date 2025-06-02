import React, { useState, useEffect } from "react";
import fetchCredentials from "../Services/fetchCredentials";

const APIExamplesModal = ({ chatbotid, onClose }) => {
  const [activeTab, setActiveTab] = useState("python");
  const [TOKEN, setTOKEN] = useState("");
  const [API_URL, setAPI_URL] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCredentials(chatbotid);
        setAPI_URL(data.url);
        setTOKEN(data.token);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Simple integration examples
  const getCodeExample = (framework) => {
    const examples = {
      python: `import requests
import uuid
API_URL = "${API_URL}"
TOKEN = "${TOKEN}"
data = {
    "message": "Hello, can you help in ...?",
    "session_id": "123e4567-e89b-12d3-a456-426614174000", # Session ID is mandatory
    "token": TOKEN
}

response = requests.post(API_URL, json=data)
print(response.json())`,

      javascript: `API_URL = "${API_URL}"
TOKEN = "${TOKEN}"
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Hello, can you help in ...?",
      session_id: "123e4567-e89b-12d3-a456-426614174000", // Session ID is mandatory
      token: TOKEN
    })
  });

  const result = await response.json();`,
    };

    return examples[framework] || "";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
      <div className="bg-gray-800 rounded-lg w-3/4 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-lg text-white font-bold">API Examples</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* API Credentials */}
        <div className="p-4 border-b border-gray-500">
          <div className="mb-2">
            <p className="text-xs text-gray-300">URL:</p>
            <div className="flex items-center bg-gray-700 px-2 py-1 rounded text-xs">
              <code className="text-green-400 truncate flex-1">{API_URL}</code>
              <button
                onClick={() => handleCopy(API_URL)}
                className="ml-1 bg-gray-600 px-1 rounded hover:bg-gray-500"
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-300">Token:</p>
            <div className="flex items-center bg-gray-700 px-2 py-1 rounded text-xs">
              <code className="text-yellow-400 truncate flex-1">{TOKEN}</code>
              <button
                onClick={() => handleCopy(TOKEN)}
                className="ml-1 bg-gray-600 px-1 rounded hover:bg-gray-500"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab("python")}
              className={`px-3 py-2 text-xs font-medium ${
                activeTab === "python"
                  ? "text-blue-400 border-b border-blue-400 bg-gray-700"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              🐍 Python
            </button>
            <button
              onClick={() => setActiveTab("javascript")}
              className={`px-3 py-2 text-xs font-medium ${
                activeTab === "javascript"
                  ? "text-blue-400 border-b border-blue-400 bg-gray-700"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              🟨 JS
            </button>
          </div>
        </div>

        {/* Code Example */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-white">
              {activeTab === "python" ? "Python" : "JavaScript"}
            </h3>
            <button
              onClick={() => handleCopy(getCodeExample(activeTab))}
              className="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
          <div className="bg-gray-900 rounded p-2 max-h-32 overflow-auto">
            <pre className="text-xs text-gray-100">
              <code>{getCodeExample(activeTab)}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-3 border-t border-gray-700">
          <button
            className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default APIExamplesModal;
