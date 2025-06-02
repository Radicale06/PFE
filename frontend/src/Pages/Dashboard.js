import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderChange from "../components/HeaderChange";
import fetchChatbots from "../Services/fetchChatbots";
import fetchdeployedChatbots from "../Services/fetchdeployedChatbots";
import ChatbotCreationModal from "../components/ChatbotCreationModal";
import CredentialsModel from "../components/CredenetialsModel";
import ChatbotActionModal from "../components/integrationModel";
import AnalyticsChart from "../components/AnalyticsChart"; // adjust the path if needed
import FloatingChatbotCreator from "../components/Chatbot_Agent"; // Import the floating chatbot creator
import APIExamplesModal from "../components/documentation";

import {
  BeakerIcon,
  LinkIcon,
  UserGroupIcon,
  CogIcon,
  HomeIcon,
  ChatAltIcon,
  PlusIcon,
} from "@heroicons/react/outline";

const Dashboard = () => {
  const location = useLocation();
  const [selectedChatbot, setSelectedChatbot] = useState(null);
  const [selectedDepChatbot, setSelectedDepChatbot] = useState(null);
  const [chatbots, setChatbots] = useState([]);
  const [Depchatbots, setDepchatbots] = useState([]);
  const name = location.state?.name;
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home"); // Track active section
  const [selectedAction, setSelectedAction] = useState(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showDocumentationModal, setshowDocumentationModal] = useState(false);
  // Start with chat assistant always visible
  const [showChatAssistant, setShowChatAssistant] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await fetchChatbots();
      setChatbots(data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const data = await fetchdeployedChatbots();
      setDepchatbots(data);
    })();
  }, []);

  // Refresh the chatbot list when a new one is created
  const refreshChatbots = async () => {
    const data = await fetchChatbots();
    setChatbots(data);
  };

  const handleChatbotCreated = async (newChatbot) => {
    // Refresh the chatbot list
    await refreshChatbots();
    // Toast or notification could be added here
  };

  const handleSidebarClick = (section) => {
    setActiveSection(section);
  };

  const handleChooseAction = (action) => {
    setSelectedAction(action);
    setShowModal(false);

    if (action === "conversational-history") {
      navigate("/history", {
        state: { selectedDepChatbot: selectedDepChatbot.id },
      });
    } else if (action === "see-credentials") {
      // Trigger the modal to open
      setShowCredentialsModal(true); // Show the credentials modal
    } else if (action === "documentation") {
      // Trigger the modal to open
      setshowDocumentationModal(true); // Show the credentials modal
    }
  };

  const handleCloseModal = () => {
    setShowCredentialsModal(false); // Close the modal
  };

  const handleDocCloseModal = () => {
    setshowDocumentationModal(false); // Close the modal
  };

  return (
    <div>
      {/* Header */}
      <HeaderChange name={name} />

      <div className="min-h-screen bg-gray-900 text-white flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 p-4 flex flex-col">
          <nav className="space-y-4">
            <a
              onClick={() => handleSidebarClick("home")}
              className={`flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 py-2 px-4 rounded-md ${
                activeSection === "home" ? "bg-blue-800 shadow-lg" : ""
              }`}
            >
              <HomeIcon className="h-6 w-6" />
              <span>Home</span>
            </a>
            <a
              onClick={() => handleSidebarClick("integrations")}
              className={`flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 py-2 px-4 rounded-md ${
                activeSection === "integrations" ? "bg-blue-800 shadow-lg" : ""
              }`}
            >
              <LinkIcon className="h-6 w-6" /> <span>Your Integrations</span>
            </a>
            <a
              onClick={() => handleSidebarClick("Analytics")}
              className={`flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 py-2 px-4 rounded-md ${
                activeSection === "Analytics" ? "bg-blue-800 shadow-lg" : ""
              }`}
            >
              <BeakerIcon className="h-6 w-6" />
              <span>Analytics</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Email Verification Banner */}
          <div className="bg-blue-600 text-white p-3 rounded-md text-center mb-4">
            Your email address is not verified. Email verification will be
            enforced soon.
            <a href="#" className="underline ml-1">
              Verify now
            </a>
          </div>

          {/* Workspace Header */}
          <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg"></div>
            <div>
              <h1 className="text-2xl font-bold">{name}'s Workspace</h1>
              <p className="text-gray-400">
                Workspace profile not set. To edit go to{" "}
                <a href="#" className="underline">
                  settings
                </a>
              </p>
            </div>
          </div>

          {/* Workspace Content */}
          {activeSection === "home" && (
            <div className="mt-6 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-center">
                My Chatbots
              </h3>
              {chatbots.length === 0 ? (
                <div className="text-center">
                  <p className="text-gray-400 mt-2">Workspace has no bots</p>
                  <p className="text-gray-500">
                    Your workspace has no bots. Get started by creating a new
                    bot
                  </p>
                  <div className="flex gap-4 justify-center mt-4">
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-green-500 hover:bg-green-300 text-white px-4 py-2 rounded"
                    >
                      Create Bot
                    </button>
                  </div>
                  {showModal && (
                    <ChatbotCreationModal
                      onClose={() => {
                        setShowModal(false);
                        window.location.reload();
                      }}
                    />
                  )}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {chatbots.map((bot) => (
                      <button
                        key={bot.id}
                        onClick={() => {
                          setSelectedChatbot(bot);
                          navigate("/Studio", { state: { bot } });
                        }}
                        className="bg-gray-700 p-4 rounded-lg shadow hover:bg-gray-600"
                      >
                        {bot.name}
                      </button>
                    ))}
                  </div>
                  {/* Actions buttons */}
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-green-500 hover:bg-green-300 text-white px-4 py-2 rounded"
                    >
                      Create Bot
                    </button>
                  </div>
                  {showModal && (
                    <ChatbotCreationModal onClose={() => setShowModal(false)} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Remove the create-bot section since we don't need it anymore */}

          {/* integrations */}
          {activeSection === "integrations" && (
            <div className="mt-6 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-center">
                Chatbots in Production
              </h3>
              {Depchatbots.length === 0 ? (
                <div className="text-center">
                  <p className="text-gray-400 mt-2">
                    Your workspace has no bots in Production Yet
                  </p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {Depchatbots.map((bot) => (
                      <button
                        key={bot.id}
                        onClick={() => {
                          setSelectedDepChatbot(bot);
                          setShowModal(true); // Show the modal
                        }}
                        className="bg-gray-700 p-4 rounded-lg shadow hover:bg-gray-600"
                      >
                        {bot.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {showModal && (
                <ChatbotActionModal
                  onClose={() => setShowModal(false)}
                  onChooseOption={handleChooseAction}
                />
              )}
              {showCredentialsModal && (
                <CredentialsModel
                  chatbotid={selectedDepChatbot.id}
                  onClose={handleCloseModal}
                />
              )}
              {showDocumentationModal && (
                <APIExamplesModal
                  chatbotid={selectedDepChatbot.id}
                  onClose={handleDocCloseModal}
                />
              )}
            </div>
          )}

          {/* Analytics */}
          {activeSection === "Analytics" && (
            <div className="mt-6">
              <AnalyticsChart />
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="w-64 p-4 text-gray-300">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-bold">
              View as: <span className="text-green-400">Member</span>
            </h3>
            <p className="text-sm mt-2">
              You are currently viewing {name}'s Workspace as a member.
            </p>
            <p className="text-xs mt-1">
              Admins can{" "}
              <a href="#" className="underline">
                edit this profile
              </a>{" "}
              and change public visibility settings.
            </p>
          </div>
        </aside>
      </div>

      {/* Floating chat bot creator - Always visible */}
      <FloatingChatbotCreator
        onChatbotCreated={handleChatbotCreated}
        onClose={() => setShowChatAssistant(false)}
      />
    </div>
  );
};

export default Dashboard;
