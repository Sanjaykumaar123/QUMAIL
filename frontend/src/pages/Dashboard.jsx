import { useState, useEffect } from 'react';
import { Activity, Key, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from '../services/api';
const data = [
    { name: '00:00', keys: 400, risk: 24 },
    { name: '04:00', keys: 300, risk: 13 },
    { name: '08:00', keys: 550, risk: 45 },
    { name: '12:00', keys: 278, risk: 39 },
    { name: '16:00', keys: 189, risk: 48 },
    { name: '20:00', keys: 239, risk: 38 },
    { name: '24:00', keys: 349, risk: 43 },
];

const StatCard = ({ title, value, icon: Icon, color, glow }) => (
    <motion.div
        whileHover={{ y: -5, boxShadow: `0 10px 30px -10px ${glow}` }}
        className="glass-card p-6 relative overflow-hidden group"
    >
        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 bg-${color} blur-2xl group-hover:opacity-30 transition-opacity duration-500`} />
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-400 font-mono text-sm tracking-wider uppercase mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white tracking-wider">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg bg-${color}/10 border border-${color}/20 text-${color} shadow-[0_0_15px_${glow}]`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [stats, setStats] = useState({
        remaining_keys: 4289,
        risk_meter: 12,
        secured_comms: 0,
        active_risks: 0,
        recent_logs: []
    });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            }
        };
        loadStats();

        const interval = setInterval(loadStats, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 uppercase">
                        Quantum Command
                    </h1>
                    <div className="flex space-x-4 mt-1">
                        <p className="text-neonCyan text-sm font-mono flex items-center">
                            <span className="w-2 h-2 rounded-full bg-neonCyan mr-2 animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
                            Secure Terminal Online • Node Hash: {Math.random().toString(16).slice(2, 10)}
                        </p>
                        <p className="text-gray-500 text-sm font-mono border-l border-white/10 pl-4 uppercase tracking-tighter">
                            SYSTEM TIME: {currentTime.toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Remaining Keys" value={stats.remaining_keys.toLocaleString()} icon={Key} color="neonCyan" glow="rgba(6,182,212,0.4)" />
                <StatCard title="Threat Score" value={`${stats.risk_meter}%`} icon={Activity} color="green-400" glow="rgba(74,222,128,0.4)" />
                <StatCard title="Secured Comms" value={stats.secured_comms.toLocaleString()} icon={Shield} color="electricPurple" glow="rgba(124,58,237,0.4)" />
                <StatCard title="Active Risks" value={stats.active_risks.toString()} icon={AlertTriangle} color="red-500" glow="rgba(239,68,68,0.4)" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="text-xl font-mono tracking-widest text-white mb-6 flex items-center uppercase">
                        <Activity className="w-5 h-5 mr-3 text-neonCyan" />
                        Network Utilization
                    </h3>
                    <div className="h-80 w-full font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
                                <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', borderRadius: '8px', boxShadow: '0 0 15px rgba(6,182,212,0.2)' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="stepAfter" dataKey="keys" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#020617' }} activeDot={{ r: 6, shadow: '0 0 10px #06b6d4' }} />
                                <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6 flex flex-col">
                    <h3 className="text-xl font-mono tracking-widest text-white mb-6 flex items-center uppercase">
                        <AlertTriangle className="w-5 h-5 mr-3 text-electricPurple" />
                        Audit Log
                    </h3>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {stats.recent_logs.length > 0 ? (
                            stats.recent_logs.map((log) => (
                                <div key={log.id} className="flex flex-col border-l-2 border-white/10 pl-4 py-1 relative group hover:border-neonCyan transition-colors">
                                    <div className="absolute w-2 h-2 rounded-full bg-white/20 -left-[5px] top-2 group-hover:bg-neonCyan group-hover:shadow-[0_0_8px_#06b6d4] transition-all" />
                                    <span className="text-[10px] text-gray-500 font-mono mb-1">{log.time}</span>
                                    <span className="text-xs font-mono font-bold text-neonCyan uppercase tracking-widest">{log.event}</span>
                                    <span className="text-[11px] text-gray-400 mt-1 italic">
                                        {log.description}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-600 font-mono text-xs italic">
                                Initializing security feed...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
