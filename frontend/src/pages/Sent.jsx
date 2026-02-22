import { useState, useEffect } from 'react';
import { Send, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSentItems } from '../services/api';

const Sent = () => {
    const [sentItems, setSentItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSent = async () => {
        try {
            const data = await getSentItems();
            setSentItems(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch sent items", err);
        }
    };

    useEffect(() => {
        fetchSent();
        const interval = setInterval(fetchSent, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 flex items-center uppercase">
                        <Send className="mr-3 w-8 h-8 text-electricPurple" />
                        Sent Dispatches
                    </h1>
                    <p className="text-electricPurple text-sm font-mono mt-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-electricPurple mr-2 animate-pulse shadow-[0_0_8px_#a855f7]"></span>
                        Transmission History • Encrypted Records Only
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-20 font-mono text-gray-500 animate-pulse">
                        ACCESSING SECURE ARCHIVES...
                    </div>
                ) : sentItems.length > 0 ? (
                    sentItems.map((item, index) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={item.id}
                            className="glass-card p-5 group hover:border-electricPurple/50 transition-all border-l-4 border-l-electricPurple/30"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-1">
                                        <h3 className="text-lg font-bold text-white font-mono group-hover:text-neonCyan transition-colors">
                                            {item.subject}
                                        </h3>
                                        <span className="text-[10px] bg-electricPurple/20 text-electricPurple px-2 py-0.5 rounded border border-electricPurple/30 flex items-center font-bold uppercase tracking-tighter">
                                            <ShieldCheck className="w-3 h-3 mr-1" />
                                            Quantum Secured
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 font-mono">
                                        To: <span className="text-neonCyan/80">{item.recipient}</span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <span className={`text-[11px] font-mono px-3 py-1 rounded border ${item.security_level === 3 ? 'text-electricPurple border-electricPurple/50 bg-electricPurple/5' :
                                                item.security_level === 2 ? 'text-neonCyan border-neonCyan/50 bg-neonCyan/5' :
                                                    'text-gray-400 border-gray-600 bg-gray-800/50'
                                            }`}>
                                            Level {item.security_level} — {item.algorithm}
                                        </span>
                                        <div className="flex items-center mt-2 text-[10px] text-green-400 font-mono uppercase tracking-widest">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            {item.status}
                                        </div>
                                    </div>

                                    <div className="border-l border-white/10 pl-4 flex flex-col items-end justify-center min-w-[80px]">
                                        <div className="flex items-center text-gray-500 text-xs font-mono">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {new Date(item.created_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                        <span className="text-[10px] text-gray-600 font-mono mt-1">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="glass-card p-20 text-center flex flex-col items-center justify-center space-y-4">
                        <Send className="w-16 h-16 text-gray-700 opacity-20" />
                        <p className="text-gray-500 font-mono italic">No dispatches found in the secure log.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sent;
