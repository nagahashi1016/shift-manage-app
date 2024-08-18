import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import ShiftInput from './components/ShiftInput';
import ShiftResult from './components/ShiftResult';
import Login from './components/Login';
import Register from './components/Register';
import AdminLogin from './components/AdminLogin'; 
import AdminHome from './components/AdminHome';
import AdminShiftResult from './components/AdminShiftResult';
import AdminSettings from './components/AdminSettings';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shift-input" element={<ShiftInput />} />
        <Route path="/shift-result" element={<ShiftResult />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} /> 
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/admin-shift-result" element={<AdminShiftResult />} />
        <Route path="/admin-settings" element={<AdminSettings />} />
      </Routes>
    </Router>
  );
};

export default App;
