import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Menu from "./Menu";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/menu/:id" element={<Menu />} />
      </Routes>
    </Router>
  );
}

export default App;
