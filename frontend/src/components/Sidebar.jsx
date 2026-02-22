import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, Send, PenTool, ShieldAlert, LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const location = useLocation();

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Inbox', path: '/inbox', icon: Inbox },
        { name: 'Sent Items', path: '/sent', icon: Send },
        { name: 'Compose', path: '/compose', icon: PenTool },
        { name: 'Threat Radar', path: '/threats', icon: ShieldAlert },
    ];

    return (
        <div className="w-64 h-full fixed top-0 left-0 bg-surface/90 backdrop-blur-md border-r border-white/10 p-5 flex flex-col z-20">
            <div className="flex items-center space-x-3 mb-10">
                <div className="relative">
                    <Shield className="w-10 h-10 text-neonCyan" />
                    <motion.div
                        className="absolute inset-0 border-2 rounded-full border-neonCyan"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
                <h1 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neonCyan to-electricPurple">
                    QUMAIL
                </h1>
            </div>

            <nav className="flex-1 space-y-4">
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link key={link.name} to={link.path}>
                            <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden group ${isActive ? 'bg-white/10 text-neonCyan' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                {isActive && (
                                    <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-neonCyan shadow-[0_0_10px_#06b6d4]" />
                                )}
                                <link.icon className={`w-5 h-5 ${isActive ? 'text-neonCyan drop-shadow-[0_0_8px_#06b6d4]' : ''}`} />
                                <span className="font-medium">{link.name}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <button
                onClick={() => {
                    localStorage.removeItem('qumail_token');
                    localStorage.removeItem('qumail_agent');
                    window.location.href = '/';
                }}
                className="flex items-center space-x-3 text-gray-400 hover:text-red-400 px-4 py-3 rounded-lg hover:bg-red-400/10 transition-colors mt-auto"
            >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Disconnect</span>
            </button>
        </div>
    );
};

export default Sidebar;
