import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Classes from './pages/Classes';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import StudentLedger from './pages/StudentLedger';
import Stats from './pages/Stats';
import BlockchainView from './pages/BlockchainView';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/students" element={<Students />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/blockchain-view" element={<BlockchainView />} />
        <Route path="/student-ledger/:chainId" element={<StudentLedger />} />
      </Routes>
    </Router>
  );
}

export default App;