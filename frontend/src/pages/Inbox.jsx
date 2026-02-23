import { useState, useEffect } from 'react';
import { Mail, Unlock, ShieldAlert, FileWarning, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInbox } from '../services/api';

const Inbox = () => {
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [decrypting, setDecrypting] = useState(false);
    const [emails, setEmails] = useState([]);

    useEffect(() => {
        const loadEmails = async () => {
            try {
                const data = await getInbox();
                const formattedData = data.map(item => ({
                    ...item,
                    level: item.security_level,
                    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setEmails(formattedData);
            } catch (err) {
                console.error("Failed to fetch inbox", err);
            }
        };
        loadEmails();
        const interval = setInterval(loadEmails, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSelect = (email) => {
        setSelectedEmail(email);
        setDecrypting(email.level > 1);
        if (email.level > 1) {
            setTimeout(() => setDecrypting(false), 2000); // Simulate KMS fetch & decrypt
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 flex items-center">
                    <Mail className="mr-3 w-8 h-8 text-neonCyan" />
                    SECURE INBOX
                </h1>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden pb-4">
                {/* Email List */}
                <div className="w-1/3 glass-card overflow-y-auto custom-scrollbar flex flex-col pt-4">
                    <div className="px-6 mb-4 flex justify-between items-center pb-2 border-b border-white/10">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Inbox Feed</span>
                        <span className="text-xs bg-neonCyan/20 text-neonCyan px-2 py-0.5 rounded border border-neonCyan/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]">QKD Sync: ON</span>
                    </div>

                    <div className="flex-1 space-y-2 px-4 pb-4">
                        {emails.map((email) => (
                            <div
                                key={email.id}
                                onClick={() => handleSelect(email)}
                                className={`p-4 rounded-lg cursor-pointer border-l-4 transition-all group relative overflow-hidden ${selectedEmail?.id === email.id ? 'bg-white/10 border-neonCyan' : 'bg-black/30 border-transparent hover:bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                {!email.read && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neonCyan animate-pulse shadow-[0_0_8px_#06b6d4]"></div>}

                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-sm font-bold truncate pr-4 ${!email.read ? 'text-white' : 'text-gray-300'} group-hover:text-neonCyan transition`}>{email.sender}</span>
                                    <span className="text-xs text-gray-500 font-mono shrink-0">{email.time}</span>
                                </div>

                                <p className="text-sm text-gray-400 truncate mb-3">{email.subject}</p>

                                <div className="flex items-center space-x-2">
                                    <div className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center
                    ${email.level === 3 ? 'text-electricPurple border-electricPurple/50 bg-electricPurple/10' :
                                            email.level === 2 ? 'text-neonCyan border-neonCyan/50 bg-neonCyan/10' :
                                                'text-gray-400 border-gray-600 bg-gray-800'}`}
                                    >
                                        Level {email.level}
                                    </div>
                                    {email.level > 1 && <ShieldAlert className="w-3 h-3 text-red-400/80" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Email Content Viewer */}
                <div className="flex-1 glass-card relative overflow-hidden flex flex-col">
                    {selectedEmail ? (
                        <div className="p-8 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
                                <div>
                                    <h2 className="text-2xl font-bold font-mono tracking-wide text-white mb-2">{selectedEmail.subject}</h2>
                                    <div className="flex items-center space-x-4 text-sm font-mono text-gray-400">
                                        <span className="text-neonCyan">{selectedEmail.sender}</span>
                                        <span>•</span>
                                        <span>{selectedEmail.time}</span>
                                    </div>
                                </div>

                                <div className={`px-4 py-2 rounded-lg border shadow-lg flex flex-col items-center justify-center
                  ${selectedEmail.level === 3 ? 'border-electricPurple shadow-[0_0_15px_rgba(124,58,237,0.3)] bg-electricPurple/5' :
                                        selectedEmail.level === 2 ? 'border-neonCyan shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-neonCyan/5' :
                                            'border-gray-600 bg-gray-800/50 text-gray-400'}`}
                                >
                                    <span className="text-[10px] uppercase tracking-widest font-bold mb-1 opacity-80">Security Protocol</span>
                                    <span className="font-mono text-lg">{selectedEmail.level === 3 ? 'PQC-Kyber512' : selectedEmail.level === 2 ? 'Quantum-AES' : 'OTP'}</span>
                                </div>
                            </div>

                            <div className="flex-1 relative">
                                {decrypting ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg z-10 border border-white/5">
                                        <Key className="w-12 h-12 text-neonCyan mb-4 animate-[spin_3s_linear_infinite]" />
                                        <h3 className="text-lg font-mono font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neonCyan to-electricPurple mb-2">
                                            FETCHING QKD KEY MATERIAL
                                        </h3>
                                        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 2, ease: "linear" }}
                                                className="h-full bg-neonCyan shadow-[0_0_10px_#06b6d4]"
                                            />
                                        </div>
                                        <p className="text-xs font-mono text-gray-500 mt-4 text-center">
                                            Payload Detected: qumail_secure_payload = true<br />
                                            Authenticating with KM Server...<br />
                                            Executing Post-Quantum Decryption Algorithm...
                                        </p>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full flex flex-col"
                                    >
                                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded mb-6 flex flex-col space-y-2 text-sm font-mono tracking-wide shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                                            <div className="flex items-center">
                                                <Unlock className="w-4 h-4 mr-3 shrink-0" />
                                                <span>Payload successfully decrypted</span>
                                            </div>
                                            <div className="pl-7 text-xs text-green-400/70">
                                                <span>Key ID: {selectedEmail.key_id}</span>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-black/40 border border-white/5 rounded-lg flex-1 overflow-y-auto custom-scrollbar font-mono text-gray-200 leading-relaxed whitespace-pre-wrap">
                                            {selectedEmail.body}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                            <Mail className="w-20 h-20 opacity-20" />
                            <p className="font-mono tracking-widest uppercase">Select an intercept to decrypt</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inbox;
