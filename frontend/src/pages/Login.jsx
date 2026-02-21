import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Lock, Mail, ShieldAlert, LogIn, UserPlus } from 'lucide-react';
import { login as apiLogin, registerUser, googleLogin } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const apiCall = isRegister ? registerUser : apiLogin;
            const data = await apiCall({ email, password });
            if (data.access_token) {
                localStorage.setItem('qumail_token', data.access_token);
                localStorage.setItem('qumail_agent', email);
                onLogin();
            }
        } catch (err) {
            console.error(isRegister ? "Registration failed" : "Login failed", err);
            setError(err.response?.data?.detail || (isRegister ? "Registration failed" : "Login failed"));
        }
        setLoading(false);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const data = await googleLogin({
                credential: credentialResponse.credential
            });
            if (data.access_token) {
                const decoded = jwtDecode(credentialResponse.credential);
                localStorage.setItem('qumail_token', data.access_token);
                localStorage.setItem('qumail_agent', decoded.email);
                onLogin();
            }
        } catch (err) {
            console.error("Google login failed", err);
            setError("Google authentication failed");
        }
        setLoading(false);
    };

    return (
        <div className="flex w-full h-screen items-center justify-center bg-background relative overflow-hidden text-white font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface via-background to-black pointer-events-none" />

            <div className="absolute w-[800px] h-[800px] bg-electricPurple/10 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen" />

            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="glass-card md:w-[450px] p-10 relative z-10 before:absolute before:-inset-1 before:-z-10 before:bg-gradient-to-r before:from-neonCyan before:to-electricPurple before:blur-lg before:opacity-20 before:rounded-2xl"
            >
                <div className="text-center mb-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-t-2 border-r-2 border-neonCyan mx-auto p-1 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center mb-4 bg-surface"
                    >
                        <ShieldAlert className="text-neonCyan w-8 h-8 drop-shadow-[0_0_8px_#06b6d4]" />
                    </motion.div>
                    <h2 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neonCyan to-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] uppercase">
                        {isRegister ? "Register Agent" : "Agent Login"}
                    </h2>
                    <p className="text-gray-400 text-sm mt-2 tracking-wide font-mono italic">
                        {isRegister ? "Initialize new secure node..." : "Quantum decryption bridge active..."}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg mb-4 text-center font-mono"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-neonCyan tracking-widest uppercase">Agent Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-neonCyan transition" />
                            <input
                                type="email"
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neonCyan focus:shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all"
                                placeholder="commander@qumail.local"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-neonCyan tracking-widest uppercase">Decryption Key</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-electricPurple transition" />
                            <input
                                type="password"
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-electricPurple focus:shadow-[0_0_10px_rgba(124,58,237,0.5)] transition-all"
                                placeholder="••••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-electricPurple hover:bg-purple-600 border border-electricPurple text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_20px_rgba(124,58,237,0.6)] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 mt-6 overflow-hidden relative group"
                        disabled={loading}
                    >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
                        {loading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                        ) : (
                            <>
                                {isRegister ? <UserPlus className="w-5 h-5" /> : <Fingerprint className="w-5 h-5" />}
                                <span className="tracking-widest uppercase font-mono relative z-10">
                                    {isRegister ? "Initialize Node" : "Authenticate"}
                                </span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center space-y-4">
                    <div className="w-full flex items-center space-x-4">
                        <div className="h-[1px] bg-white/10 flex-1"></div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Secure Auth Gateway</span>
                        <div className="h-[1px] bg-white/10 flex-1"></div>
                    </div>

                    <div className="w-full flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError("Google login failed")}
                            theme="filled_black"
                            width="100%"
                            shape="pill"
                        />
                    </div>

                    <button
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        className="text-xs text-gray-400 hover:text-neonCyan transition-all font-mono tracking-widest uppercase"
                    >
                        {isRegister ? "Already an agent? Login" : "New Operative? Register Node"}
                    </button>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 text-center text-xs text-gray-500 font-mono flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-neonCyan animate-pulse shadow-[0_0_8px_#06b6d4]"></div>
                    <span>KM Simulator Active • QKD Linked</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
