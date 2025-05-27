import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import fetchHistoryData from "../Services/fetchHistory"; // Import the fetchHistoryData function

const History = () => {
  const location = useLocation();
  const [historyData, setHistoryData] = useState([]); // Store the fetched history data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract the chatbot_id from the location state (assuming the chatbot_id is stored there)
  const chatbot_id = location.state?.selectedDepChatbot;

  useEffect(() => {
    if (!chatbot_id) {
      setError("Chatbot ID is missing.");
      setLoading(false);
      return;
    }

    // Fetch the history data for the specific chatbot
    const fetchHistory = async () => {
      try {
        const data = await fetchHistoryData(chatbot_id);
        setHistoryData(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [chatbot_id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner-border animate-spin border-4 border-t-4 border-blue-600 rounded-full w-16 h-16"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-4">
        <p>{error}</p>
      </div>
    );
  }
  const downloadCSV = () => {
    if (!historyData.length) return;

    const header = Object.keys(historyData[0]).join(",");
    const rows = historyData.map((row) =>
      Object.values(row)
        .map(String)
        .map((val) => `"${val.replace(/"/g, '""')}"`)
        .join(",")
    );

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "chatbot_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col ">
      <div className="max-w-8xl mx-auto p-2 bg-gray-800 rounded-lg shadow-lg w-full mt-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white text-center w-full">
            Conversational History
          </h1>

          <div className="absolute right-6">
            <button
              onClick={downloadCSV}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-500 transition"
            >
              Download CSV
            </button>
          </div>
        </div>
        {historyData.length === 0 ? (
          <div className="text-center text-gray-400 mt-2">
            <p>No history available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-700 p-4 rounded-lg shadow-md">
            <table className="min-w-full bg-gray-800 text-white">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">TimeStamp</th>
                  <th className="px-6 py-4 text-left">Question</th>
                  <th className="px-6 py-4 text-left">Response</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((historyItem) => (
                  <tr
                    key={historyItem.id}
                    className="hover:bg-gray-600 transition-colors"
                  >
                    <td className="px-6 py-4">{historyItem.id}</td>
                    <td className="px-6 py-4">{historyItem.TimeStamp}</td>
                    <td className="px-6 py-4">{historyItem.question}</td>
                    <td className="px-6 py-4">{historyItem.response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
