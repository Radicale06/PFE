// AnalyticsChart.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart,
  BarChart,
  AreaChart,
  Line,
  Bar,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Cookies from "js-cookie";
import dayjs from "dayjs";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const AnalyticsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("line");
  const [daysFilter, setDaysFilter] = useState(7);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = Cookies.get("access_token");
      try {
        const response = await fetch(`${API_BASE_URL}/api/analytics/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch analytics");

        const raw = await response.json();

        const cutoffDate = dayjs().subtract(daysFilter, "day");

        const filtered = raw.filter(({ date }) =>
          dayjs(date).isAfter(cutoffDate)
        );

        const chatbotSet = new Set(filtered.map((entry) => entry.chatbot));
        const chatbotList = Array.from(chatbotSet);

        // Create full date range
        const allDates = [];
        for (let i = 0; i <= daysFilter; i++) {
          allDates.push(dayjs().subtract(i, "day").format("YYYY-MM-DD"));
        }

        const grouped = {};
        chatbotList.forEach((chatbot) => {
          allDates.forEach((date) => {
            const key = `${date}`;
            if (!grouped[key]) grouped[key] = { date: key };
            grouped[key][chatbot] = 0;
          });
        });

        filtered.forEach(({ chatbot, date, interactions }) => {
          const formattedDate = dayjs(date).format("YYYY-MM-DD");
          grouped[formattedDate][chatbot] += interactions;
        });

        const finalData = Object.values(grouped).sort(
          (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
        );
        setData(finalData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [daysFilter]);

  const allChatbots = [
    ...new Set(data.flatMap((d) => Object.keys(d).filter((k) => k !== "date"))),
  ];

  const renderChart = () => {
    const chartProps = {
      data,
      margin: { top: 20, right: 40, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{ backgroundColor: "#222", borderColor: "#555" }}
            />
            <Legend />
            {allChatbots.map((bot, index) => (
              <Bar
                key={bot}
                dataKey={bot}
                fill={`hsl(${(index * 60) % 360}, 70%, 60%)`}
              />
            ))}
          </BarChart>
        );
      case "area":
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{ backgroundColor: "#222", borderColor: "#555" }}
            />
            <Legend />
            {allChatbots.map((bot, index) => (
              <Area
                key={bot}
                type="monotone"
                dataKey={bot}
                stroke={`hsl(${(index * 60) % 360}, 70%, 60%)`}
                fill={`hsl(${(index * 60) % 360}, 70%, 60%)`}
              />
            ))}
          </AreaChart>
        );
      default:
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{ backgroundColor: "#222", borderColor: "#555" }}
            />
            <Legend />
            {allChatbots.map((bot, index) => (
              <Line
                key={bot}
                type="monotone"
                dataKey={bot}
                stroke={`hsl(${(index * 60) % 360}, 70%, 60%)`}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className="w-full bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">
          Interaction Trends
        </h2>
        <div className="space-x-2">
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(Number(e.target.value))}
            className="bg-gray-700 text-white px-3 py-1 rounded"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>

          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded"
          >
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="area">Area</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="w-full h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;
