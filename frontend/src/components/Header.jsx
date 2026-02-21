import { Bell, User, Search, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
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

            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/30">
                    <motion.div
                        className="w-2 h-2 rounded-full bg-green-400"
                        animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-xs font-bold tracking-wide">SECURE SYNC</span>
                </div>

                <button className="relative p-2 rounded-full hover:bg-white/10 transition">
                    <Bell className="w-5 h-5 text-gray-400 hover:text-white" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"></span>
                </button>

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
