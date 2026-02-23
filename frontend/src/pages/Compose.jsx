import { useState } from 'react';
import { Send, ShieldAlert, CheckCircle, Cpu, Shield, AlertTriangle, Key, Server, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAIRecommendation, sendEncryptedEmail } from '../services/api';
const securityLevels = [
    { id: 1, name: 'OTP', desc: 'XOR Encryption (Level 1)', color: 'text-gray-400', border: 'border-gray-600', bg: 'bg-gray-800' },
    { id: 2, name: 'Quantum AES', desc: 'AES-256-GCM (Level 2)', color: 'text-neonCyan', border: 'border-neonCyan', bg: 'bg-neonCyan/10', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]' },
    { id: 3, name: 'PQC Kyber512', desc: 'Post-Quantum Crypto (Level 3)', color: 'text-electricPurple', border: 'border-electricPurple', bg: 'bg-electricPurple/10', glow: 'shadow-[0_0_15px_rgba(124,58,237,0.4)]' },
];

const Compose = () => {
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [level, setLevel] = useState(2);
    const [analyzing, setAnalyzing] = useState(false);
    const [suggestion, setSuggestion] = useState(null);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [sendStep, setSendStep] = useState(0);

    const analyzeContent = async () => {
        if (!body) return;
        setAnalyzing(true);
        try {
            const result = await fetchAIRecommendation(body, recipient);
            setSuggestion(result.recommended_level);
        } catch (e) {
            console.error("Analysis failed", e);
        }
        setAnalyzing(false);
    };

    const handleSend = async () => {
        setSending(true);
        setSendStep(1); // Compose -> Encryption Engine

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setSendStep(2); // Encryption Engine -> KM Fetch

            await new Promise(resolve => setTimeout(resolve, 800));
            setSendStep(3); // KM Fetch -> API / SMTP Dispatch

            await sendEncryptedEmail({
                recipient,
                subject,
                body,
                security_level: level
            });

            setSendStep(4); // Dispatched
            setSent(true);
            setTimeout(() => {
                setSent(false);
                setSending(false);
                setSendStep(0);
                setRecipient('');
                setSubject('');
                setBody('');
                setSuggestion(null);
            }, 3000);
        } catch (e) {
            console.error("Failed to send", e);
            setSending(false);
            setSendStep(0);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 flex items-center">
                    <Send className="mr-3 w-8 h-8 text-neonCyan" />
                    SECURE DISPATCH
                </h1>
            </div>

            <div className="glass-card p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neonCyan/5 rounded-full blur-3xl" />

                <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-gray-400 tracking-widest uppercase">Target Node / Recipient</label>
                            <input
                                type="email"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neonCyan focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all font-mono"
                                placeholder="agent@node.local"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-gray-400 tracking-widest uppercase">Subject Tracker</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neonCyan focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all font-mono"
                                placeholder="Operation Alpha"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-mono text-gray-400 tracking-widest uppercase">Encrypted Payload</label>
                            <button
                                onClick={analyzeContent}
                                disabled={analyzing || !body}
                                className="text-xs font-mono text-neonCyan hover:text-white border border-neonCyan/30 hover:border-neonCyan px-3 py-1 rounded bg-neonCyan/5 hover:bg-neonCyan/20 transition-all shadow-[0_0_5px_rgba(6,182,212,0.2)] disabled:opacity-50 flex items-center"
                            >
                                {analyzing ? <Cpu className="w-3 h-3 mr-2 animate-spin" /> : <ShieldAlert className="w-3 h-3 mr-2" />}
                                AI Threat Analysis
                            </button>
                        </div>
                        <textarea
                            value={body}
                            onChange={(e) => { setBody(e.target.value); setSuggestion(null); }}
                            className="w-full h-48 bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neonCyan focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all font-mono resize-none custom-scrollbar"
                            placeholder="Enter strictly confidential data here..."
                        />
                    </div>

                    <AnimatePresence>
                        {suggestion && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4 flex items-start space-x-3 text-sm shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                            >
                                <AlertTriangle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-purple-300 tracking-wider">AI Copilot Recommendation</h4>
                                    <p className="text-purple-200/80 mt-1">
                                        Highly sensitive keywords detected. Upgrading to <strong className="text-white">Level {suggestion} Security</strong> is strongly advised to prevent harvest-now-decrypt-later attacks.
                                    </p>
                                    <button
                                        onClick={() => setLevel(suggestion)}
                                        className="mt-3 text-xs bg-purple-500 hover:bg-purple-400 text-white px-3 py-1.5 rounded font-mono font-bold tracking-wider shadow-[0_0_10px_rgba(124,58,237,0.5)] transition"
                                    >
                                        APPLY LEVEL {suggestion} NOW
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="pt-4 border-t border-white/10">
                        <label className="text-xs font-mono text-gray-400 tracking-widest uppercase mb-4 block">Select Encryption Protocol</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                            {securityLevels.map(sl => (
                                <div
                                    key={sl.id}
                                    onClick={() => setLevel(sl.id)}
                                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 relative group overflow-hidden ${level === sl.id ? `${sl.border} ${sl.bg} ${sl.glow}` : 'border-white/10 bg-black/40 hover:border-white/30'}`}
                                >
                                    <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl rounded-full ${level === sl.id ? sl.bg : 'opacity-0'} transition-all duration-500`}></div>
                                    <div className="flex justify-between items-center relative z-10">
                                        <span className={`font-bold text-lg ${level === sl.id ? sl.color : 'text-gray-400'}`}>Lvl {sl.id}</span>
                                        {level === sl.id && <Shield className={`w-5 h-5 ${sl.color}`} />}
                                    </div>
                                    <p className={`text-xs mt-2 relative z-10 ${level === sl.id ? 'text-white' : 'text-gray-500'}`}>{sl.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence>
                        {sending && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pt-4 pb-2 border-t border-white/10 overflow-hidden"
                            >
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${sendStep >= 1 ? 'border-neonCyan bg-neonCyan/20 shadow-[0_0_15px_#06b6d4]' : 'border-gray-600 bg-gray-800'}`}>
                                            <ShieldAlert className={`w-5 h-5 ${sendStep >= 1 ? 'text-neonCyan' : 'text-gray-500'}`} />
                                        </div>
                                        <span className={`text-[10px] mt-2 font-mono uppercase tracking-widest ${sendStep >= 1 ? 'text-neonCyan' : 'text-gray-500'}`}>Encrypt Engine</span>
                                    </div>

                                    <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${sendStep >= 2 ? 'bg-neonCyan shadow-[0_0_8px_#06b6d4]' : 'bg-gray-700'}`}></div>

                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${sendStep >= 2 ? 'border-electricPurple bg-electricPurple/20 shadow-[0_0_15px_#7c3aed]' : 'border-gray-600 bg-gray-800'}`}>
                                            <Key className={`w-5 h-5 ${sendStep >= 2 ? 'text-electricPurple' : 'text-gray-500'}`} />
                                        </div>
                                        <span className={`text-[10px] mt-2 font-mono uppercase tracking-widest ${sendStep >= 2 ? 'text-electricPurple' : 'text-gray-500'}`}>QKD Server</span>
                                    </div>

                                    <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${sendStep >= 3 ? 'bg-electricPurple shadow-[0_0_8px_#7c3aed]' : 'bg-gray-700'}`}></div>

                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${sendStep >= 3 ? 'border-blue-400 bg-blue-400/20 shadow-[0_0_15px_#60a5fa]' : 'border-gray-600 bg-gray-800'}`}>
                                            <Server className={`w-5 h-5 ${sendStep >= 3 ? 'text-blue-400' : 'text-gray-500'}`} />
                                        </div>
                                        <span className={`text-[10px] mt-2 font-mono uppercase tracking-widest ${sendStep >= 3 ? 'text-blue-400' : 'text-gray-500'}`}>SMTP Gateway</span>
                                    </div>

                                    <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${sendStep >= 4 ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-gray-700'}`}></div>

                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${sendStep >= 4 ? 'border-green-400 bg-green-400/20 shadow-[0_0_15px_#4ade80]' : 'border-gray-600 bg-gray-800'}`}>
                                            <Mail className={`w-5 h-5 ${sendStep >= 4 ? 'text-green-400' : 'text-gray-500'}`} />
                                        </div>
                                        <span className={`text-[10px] mt-2 font-mono uppercase tracking-widest ${sendStep >= 4 ? 'text-green-400' : 'text-gray-500'}`}>Secure Inbox</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="pt-6 flex flex-col items-end">
                        <AnimatePresence>
                            {sent && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="mb-3 text-[10px] font-mono text-green-400 bg-green-500/10 px-3 py-1 rounded border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                                >
                                    QUANTUM TUNNEL ESTABLISHED: Ciphertext dispatched to Gmail.
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <button
                            onClick={handleSend}
                            disabled={!recipient || !body || sending || sent}
                            className={`px-8 py-3 rounded-lg font-bold font-mono tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center ${sent ? 'bg-green-500 text-white shadow-green-500/50' : 'bg-neonCyan hover:bg-cyan-400 text-black'}`}
                        >
                            {sending ? (
                                <><Cpu className="w-5 h-5 mr-3 animate-spin" /> ENCRYPTING...</>
                            ) : sent ? (
                                <><CheckCircle className="w-5 h-5 mr-3" /> DISPATCHED</>
                            ) : (
                                <><Send className="w-5 h-5 mr-3" /> INITIATE DISPATCH</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Compose;
