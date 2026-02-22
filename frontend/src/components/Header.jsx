import { useState, useEffect } from 'react';
import { Bell, User, Search, Fingerprint, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardStats } from '../services/api';

const Header = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unread, setUnread] = useState(0);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await getDashboardStats();
                if (data.recent_logs) {
                    setNotifications(data.recent_logs);
                    setUnread(Math.min(data.recent_logs.length, 3)); // Mocking recent unread logic
                }
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between z-10 sticky top-0">
            <div className="flex bg-background border border-white/5 rounded-full px-4 py-2 w-96 items-center shadow-inner group focus-within:border-neonCyan focus-within:shadow-[0_0_10px_#06b6d4] transition-all">
                <Search className="w-5 h-5 text-gray-500 group-focus-within:text-neonCyan mr-2" />
                <input
                    type="text"
                    placeholder="Search encrypted comms..."
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-500"
                />
            </div>

            <div className="flex items-center space-x-6 relative">
                <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/30">
                    <motion.div
                        className="w-2 h-2 rounded-full bg-green-400"
                        animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-xs font-bold tracking-wide">SECURE SYNC</span>
                </div>

                <div className="relative">
                    <button
                        onClick={() => { setShowDropdown(!showDropdown); setUnread(0); }}
                        className="relative p-2 rounded-full hover:bg-white/10 transition"
                    >
                        <Bell className="w-5 h-5 text-gray-400 hover:text-white" />
                        {unread > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"></span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-80 glass-card border border-white/10 rounded-xl overflow-hidden shadow-2xl py-2 z-50"
                            >
                                <div className="px-4 py-2 border-b border-white/10 bg-black/50">
                                    <h3 className="text-xs font-mono text-gray-400 tracking-widest uppercase">System Logs</h3>
                                </div>
                                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                    {notifications.length > 0 ? notifications.map((log) => (
                                        <div key={log.id} className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition flex items-start space-x-3">
                                            <Activity className="w-4 h-4 text-neonCyan mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm text-white font-mono leading-tight mb-1">{log.event.replace(/_/g, ' ')}</p>
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{log.description}</p>
                                                <span className="text-[10px] text-gray-600 block mt-1">{log.time}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-4 text-center text-gray-500 text-xs font-mono">
                                            No recent notifications.
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center space-x-3 pl-4 border-l border-white/10 cursor-pointer group">
                    <div className="text-right flex flex-col items-end">
                        <span className="text-sm font-bold text-gray-200 group-hover:text-neonCyan transition">Commander</span>
                        <span className="text-xs text-electricPurple font-mono tracking-widest">{localStorage.getItem('qumail_agent') || 'GUEST'}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neonCyan to-electricPurple flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                        <Fingerprint className="text-white w-6 h-6" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
