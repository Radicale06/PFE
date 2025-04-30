import React from "react";

const Pricing = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4 w-full">
      {/* Hobby Plan */}
      <div className="rounded-xl bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
        <h3 className="text-2xl font-semibold text-blue-600 mb-4">Hobby</h3>
        <p className="text-4xl font-bold text-gray-900 mb-6">
          $9 <span className="text-base text-gray-500">/month</span>
        </p>
        <p className="text-gray-600 mb-6">
          The perfect plan for individuals and small businesses starting with
          AI-powered chatbots.
        </p>
        <ul className="space-y-3 mb-6 text-sm text-gray-600">
          <li className="flex gap-x-3">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
            1 Active Chatbot
          </li>
          <li className="flex gap-x-3">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
            1 Integration (e.g., Website)
          </li>
          <li className="flex gap-x-3">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
            Basic Analytics
          </li>
          <li className="flex gap-x-3">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
            Standard Security Features
          </li>
        </ul>
        <button className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-red-500 transition-all duration-300">
          Get Started Today
        </button>
      </div>

      {/* Enterprise Plan */}
      <div className="rounded-xl bg-gray-900 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
        <h3 className="text-2xl font-semibold text-white mb-4">Enterprise</h3>
        <p className="text-4xl font-bold text-white mb-6">
          $29 <span className="text-base text-gray-400">/month</span>
        </p>
        <p className="text-gray-300 mb-6">
          Advanced plan with unlimited integrations, chatbot flexibility, and
          priority support.
        </p>
        <ul className="space-y-3 mb-6 text-sm text-gray-300">
          <li className="flex gap-x-3">
            <svg
              className="h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
            Unlimited Active Chatbots
          </li>
          <li className="flex gap-x-3">
            <svg
              className="h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
            Unlimited Integrations
          </li>
          <li className="flex gap-x-3">
            <svg
              className="h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
            Advanced Analytics
          </li>
          <li className="flex gap-x-3">
            <svg
              className="h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
            Premium Security Features
          </li>
        </ul>
        <button className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-red-500 transition-all duration-300">
          Get Started Today
        </button>
      </div>
    </div>
  );
};

export default Pricing;
