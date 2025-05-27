import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Pricing from "../components/Pricing";
import {
  FaRocket,
  FaRobot,
  FaChartBar,
  FaGlobe,
  FaPuzzlePiece,
  FaLock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="font-sans bg-white text-black">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-blue-600 py-24 relative">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-white mb-6">
            Build Smarter Chatbots in Minutes
          </h1>
          <p className="text-xl text-white mb-8">
            Automate customer interactions effortlessly with our AI-powered
            chatbot generator.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => {
                navigate("/login");
              }}
              className="bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-gray-200 transition"
            >
              Try for Free
            </button>
            <button className="bg-transparent text-white px-8 py-3 rounded-md border-2 border-white hover:bg-white hover:text-blue-600 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section id="trending" className="py-16 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-blue-600 mb-8">
            Trending Chatbots
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-100 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-black">
                E-commerce Assistant
              </h3>
              <p className="text-gray-600">
                Automate customer support for your online store and boost sales.
              </p>
            </div>
            <div className="p-8 bg-gray-100 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-black">
                Customer Support Bot
              </h3>
              <p className="text-gray-600">
                Answer customer queries 24/7 without hassle.
              </p>
            </div>
            <div className="p-8 bg-gray-100 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-black">
                Lead Generation Bot
              </h3>
              <p className="text-gray-600">
                Capture more leads with personalized interactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-extrabold text-blue-600 mb-8">
            Choose the Right Plan for You
          </h2>
          <p className="text-lg mb-12 text-gray-600">
            Select a plan that suits your business needs and get started today.
          </p>

          {/* This is the key container - controls width and centering */}
          <div className="max-w-6xl mx-auto">
            <Pricing />
          </div>
        </div>
      </section>
      {/* why Section */}
      <section id="why" className="py-16 bg-gray-50">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-extrabold text-blue-600 mb-8">
            Why BotForge?
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-12">
            BotForge isn’t just a chatbot builder — it’s your AI-powered
            assistant to elevate customer engagement, streamline operations, and
            save time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-md text-left">
              <FaRocket className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                Fast & Easy Setup
              </h3>
              <p className="text-gray-600">
                Build your chatbot in minutes with our intuitive, no-code
                platform — no technical skills required.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-left">
              <FaRobot className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                AI-Powered Conversations
              </h3>
              <p className="text-gray-600">
                Deliver human-like, context-aware responses powered by advanced
                AI and machine learning models.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-left">
              <FaChartBar className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                Analytics & Insights
              </h3>
              <p className="text-gray-600">
                Track performance, user behavior, and engagement metrics in real
                time with detailed dashboards.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-left">
              <FaGlobe className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                Multilingual Capabilities
              </h3>
              <p className="text-gray-600">
                Speak your users' language — literally. Support for multiple
                languages to engage a global audience.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-left">
              <FaPuzzlePiece className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                Custom Integrations
              </h3>
              <p className="text-gray-600">
                Connect your chatbot to CRMs, websites, messaging apps, or
                internal tools for seamless automation.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-left">
              <FaLock className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                Secure & Scalable
              </h3>
              <p className="text-gray-600">
                Built with enterprise-grade security and infrastructure that
                grows with your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-blue-600 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-100 rounded-lg shadow-lg">
              <h3 className="font-semibold text-2xl mb-4 text-black">
                What is a chatbot?
              </h3>
              <p className="text-gray-600">
                A chatbot is an AI-powered software designed to simulate human
                conversations.
              </p>
            </div>
            <div className="p-8 bg-gray-100 rounded-lg shadow-lg">
              <h3 className="font-semibold text-2xl mb-4 text-black">
                How do I deploy my chatbot?
              </h3>
              <p className="text-gray-600">
                You can deploy your chatbot to your website or social media in
                just a few simple steps.
              </p>
            </div>
            <div className="p-8 bg-gray-100 rounded-lg shadow-lg">
              <h3 className="font-semibold text-2xl mb-4 text-black">
                Can I customize my chatbot?
              </h3>
              <p className="text-gray-600">
                Yes, you can easily customize your chatbot's appearance and
                responses to match your brand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
