import React, { useState } from "react";

const DeployModal = ({ onClose, onConfirm }) => {
  const [result, setResult] = useState(null); // for API response
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    const res = await onConfirm(); // this will return api_url, token, etc.
    setResult(res);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-1/3">
        {!result ? (
          <>
            <h2 className="text-xl font-semibold mb-4 text-white">Confirm</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to deploy this chatbot? Once deployed, you
              will receive an API URL and token.
            </p>
            <div className="flex justify-end">
              <button
                className="bg-gray-600 px-4 py-2 rounded-lg mr-2 hover:bg-gray-700 transition"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Deploying..." : "Confirm Deploy"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4 text-green-400">
              ✅Successfully
            </h2>

            <div className="mb-3">
              <p className="text-sm text-gray-300">Chatbot Name:</p>
              <p className="font-mono text-white">{result.chatbot_name}</p>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-300">API URL:</p>
              <div className="flex items-center justify-between bg-gray-700 px-3 py-1 rounded">
                <p className="text-sm truncate">{result.api_url}</p>
                <button
                  onClick={() => handleCopy(result.api_url)}
                  className="ml-2 text-xs bg-gray-600 px-2 py-1 rounded hover:bg-gray-500"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-300">Token:</p>
              <div className="flex items-center justify-between bg-gray-700 px-3 py-1 rounded">
                <p className="text-sm truncate">{result.token}</p>
                <button
                  onClick={() => handleCopy(result.token)}
                  className="ml-2 text-xs bg-gray-600 px-2 py-1 rounded hover:bg-gray-500"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeployModal;
