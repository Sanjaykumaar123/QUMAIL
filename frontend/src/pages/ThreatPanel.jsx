import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from '../services/api';

const defaultData = [
    { subject: 'MITM Resistance', A: 120, fullMark: 150 },
    { subject: 'HNDL Score', A: 98, fullMark: 150 },
    { subject: 'QKD Entropy', A: 140, fullMark: 150 },
    { subject: 'PQC Strength', A: 150, fullMark: 150 },
    { subject: 'Node Health', A: 110, fullMark: 150 },
    { subject: 'Latency', A: 85, fullMark: 150 },
];

const ThreatPanel = () => {
    const [logs, setLogs] = useState([]);
    const [threatScore, setThreatScore] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDashboardStats();
                setLogs(data.audit_logs || []);
                setThreatScore(data.threat_score || 0);
            } catch (err) {
                console.error("Failed to fetch threat data", err);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 4000);
        return () => clearInterval(interval);
    }, []);

    const dynamicData = defaultData.map(d => ({
        ...d,
        A: Math.min(150, Math.max(50, d.A - (threatScore > 50 ? (threatScore - 50) : 0) + (Math.random() * 10 - 5)))
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-red-400 flex items-center">
                        <ShieldAlert className="mr-3 w-8 h-8 text-red-500" />
                        THREAT RADAR
                    </h1>
                    <p className="text-red-500/80 text-sm font-mono mt-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse shadow-[0_0_10px_#ef4444]"></span>
                        Active Surveillance Mode
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 h-[400px] flex flex-col justify-center items-center relative border border-white/5 border-t-red-500/30">
                    <div className="absolute inset-0 bg-red-500/5 blur-3xl rounded-full" />
                    <h3 className="font-mono text-gray-300 mb-4 tracking-widest uppercase self-start w-full border-b border-white/10 pb-4 flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-neonCyan" />
                        Vulnerability Multi-vector (Risk: {threatScore}%)
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dynamicData}>
                            <PolarGrid stroke="#ef444430" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} className="hidden" />
                            <Radar name="QuMail" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card p-6 border border-white/5 border-t-electricPurple/30 flex flex-col">
                    <h3 className="font-mono text-gray-300 mb-4 tracking-widest uppercase pb-4 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center">
                            <Cpu className="w-4 h-4 mr-2 text-electricPurple" />
                            AI Security Copilot
                        </div>
                        <span className="bg-electricPurple/20 text-electricPurple text-[10px] px-2 py-0.5 rounded font-bold shadow-[0_0_10px_rgba(124,58,237,0.3)] border border-electricPurple/50">Online</span>
                    </h3>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                        {logs.length > 0 ? logs.map((log, index) => (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={log.id}
                                className="p-4 rounded-lg bg-black/40 border border-white/5 relative overflow-hidden group hover:border-electricPurple transition-all"
                            >
                                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-electricPurple/20 to-transparent blur-xl rounded-full -translate-y-1/2 translate-x-1/2" />
                                <h4 className="font-bold text-white text-sm font-mono mb-2 tracking-wide flex justify-between">
                                    {log.event.replace(/_/g, ' ')}
                                    <span className="text-[10px] text-gray-500 bg-gray-900 px-2 py-0.5 rounded">
                                        {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </h4>
                                <p className="text-xs text-gray-400 font-mono leading-relaxed">
                                    {log.description}
                                </p>
                            </motion.div>
                        )) : (
                            <div className="p-4 text-center text-gray-500 font-mono text-sm border border-dashed border-white/10 rounded-lg">
                                Intercepting Logs... No recent threats detected.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThreatPanel;
