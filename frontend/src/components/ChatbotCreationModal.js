import React, { useState } from "react";
import createChatbot from "../Services/CreateChatbot";

const ChatbotCreationModal = ({ onClose }) => {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [language, setLanguage] = useState("");
  const [style, setStyle] = useState("");

  const languageOptions = ["English", "French", "Arabic"];
  const styleOptions = ["Formal", "Friendly", "Professional"];

  const handleCreateChatbot = async () => {
    const chatbotData = {
      name,
      domain,
      language,
      style,
    };

    await createChatbot(chatbotData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[500px]">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Create New Chatbot
        </h3>
        <div className="grid grid-cols-2 gap-4 text-white">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 bg-gray-700 rounded-md w-full"
          />
          <input
            type="text"
            placeholder="Domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="p-2 bg-gray-700 rounded-md w-full"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-2 bg-gray-700 rounded-md w-full"
          >
            <option value="">Select Language</option>
            {languageOptions.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="p-2 bg-gray-700 rounded-md w-full"
          >
            <option value="">Select Style</option>
            {styleOptions.map((styl) => (
              <option key={styl} value={styl}>
                {styl}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded-md text-white hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleCreateChatbot();
              onClose();
            }}
            className="bg-green-500 px-4 py-2 rounded-md text-white hover:bg-green-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotCreationModal;
