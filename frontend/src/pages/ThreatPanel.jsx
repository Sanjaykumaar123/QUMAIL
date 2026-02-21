import { Activity, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const data = [
    { subject: 'MITM Resistance', A: 120, fullMark: 150 },
    { subject: 'HNDL Score', A: 98, fullMark: 150 },
    { subject: 'QKD Entropy', A: 140, fullMark: 150 },
    { subject: 'PQC Strength', A: 150, fullMark: 150 },
    { subject: 'Node Health', A: 110, fullMark: 150 },
    { subject: 'Latency', A: 85, fullMark: 150 },
];

const ThreatPanel = () => {
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
                        Vulnerability Multi-vector
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
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
                        {[1, 2, 3].map(i => (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.2 }}
                                key={i}
                                className="p-4 rounded-lg bg-black/40 border border-white/5 relative overflow-hidden group hover:border-neonCyan transition-all"
                            >
                                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-neonCyan/20 to-transparent blur-xl rounded-full -translate-y-1/2 translate-x-1/2" />
                                <h4 className="font-bold text-white text-sm font-mono mb-2 tracking-wide flex justify-between">
                                    {i === 1 ? 'Harvest-Now Risk Detected' : i === 2 ? 'Node Epsilon Latency Spike' : 'Protocol Baseline Nominal'}
                                    <span className="text-xs text-gray-500">T-{i * 14}s</span>
                                </h4>
                                <p className="text-xs text-gray-400 font-mono leading-relaxed">
                                    {i === 1 ? 'Adversarial quantum compute node detected sniffing traffic on routing hop L7.' :
                                        i === 2 ? 'Slight delay during key exchange simulation. Fallback to secondary QKD path engaged automatically.' :
                                            'Overall encryption strength holding steady at 99.8% multi-vector threshold.'}
                                </p>
                                {i === 1 && (
                                    <button className="mt-3 text-[10px] uppercase font-bold tracking-widest border border-neonCyan text-neonCyan px-3 py-1 rounded bg-neonCyan/10 hover:bg-neonCyan hover:text-black transition-all shadow-[0_0_5px_rgba(6,182,212,0.4)]">
                                        Enforce Level 3
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThreatPanel;
