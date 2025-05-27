import React, { useState, useEffect } from "react";
import fetchCredentials from "../Services/fetchCredentials";

const CredentialsModel = ({ chatbotid, onClose }) => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCredentials(chatbotid);
        setResult(data);
      } catch (err) {
        setError("Error fetching credentials");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-1/3">
        {result && (
          <>
            <h2 className="text-xl text-white mb-4">Credentials</h2>

            <div className="mb-3">
              <p className="text-sm text-gray-300">API URL:</p>
              <div className="flex items-center justify-between bg-gray-700 px-3 py-1 rounded">
                <p className="text-sm truncate">{result.url}</p>
                <button
                  onClick={() => handleCopy(result.url)}
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

export default CredentialsModel;
