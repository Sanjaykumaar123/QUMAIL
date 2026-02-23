import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Compose from './pages/Compose';
import ThreatPanel from './pages/ThreatPanel';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('qumail_token'));

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        </Routes>
      ) : (
        <div className="flex h-screen w-full bg-background overflow-hidden text-white font-sans">
          <Sidebar />
          <div className="flex-1 flex flex-col relative z-10 w-full ml-64 overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/compose" element={<Compose />} />
                <Route path="/threats" element={<ThreatPanel />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
