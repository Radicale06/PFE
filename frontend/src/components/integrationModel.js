// ChatbotActionModal.js
import React from "react";

const ChatbotActionModal = ({ onClose, onChooseOption }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-1/3">
        <h3 className="text-xl text-white font-semibold mb-4">
          Select an Option
        </h3>
        <div className="space-y-4">
          <button
            onClick={() => onChooseOption("conversational-history")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500"
          >
            Conversational History
          </button>
          <button
            onClick={() => onChooseOption("see-credentials")}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-500"
          >
            See Credentials
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ChatbotActionModal;
