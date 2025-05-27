import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import BotForgePage from "./Pages/Studio";
import History from "./Pages/history";
import EditProfile from "./Pages/Profile";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/studio" element={<BotForgePage />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<EditProfile />} />

        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
