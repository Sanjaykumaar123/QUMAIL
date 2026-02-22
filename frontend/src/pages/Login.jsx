import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Lock, Mail, ShieldAlert, Key } from 'lucide-react';
import { sendOtp, verifyOtp, googleLogin } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            await sendOtp(email);
            setSuccessMsg('Verification code sent! Check your email.');
            setStep(2);
        } catch (err) {
            console.error("Failed to send OTP", err);
            setError(err.response?.data?.detail || "Failed to send Verification Code");
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            const data = await verifyOtp(email, otp);
            if (data.access_token) {
                localStorage.setItem('qumail_token', data.access_token);
                localStorage.setItem('qumail_agent', data.email);
                onLogin();
            }
        } catch (err) {
            console.error("Verification failed", err);
            setError(err.response?.data?.detail || "Invalid Verification Code");
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
                        QU MAIL
                    </h2>
                    <p className="text-gray-400 text-sm mt-2 tracking-wide font-mono italic">
                        Quantum Secure Mail Protocol
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg mb-4 text-center font-mono"
                        >
                            {error}
                        </motion.div>
                    )}
                    {successMsg && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-green-500/10 border border-green-500/50 text-green-400 text-xs p-3 rounded-lg mb-4 text-center font-mono"
                        >
                            {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col items-center space-y-6 mb-2">
                    <p className="text-gray-400 text-[10px] uppercase font-mono tracking-widest text-center mb-2">
                        Authorized Personnel Only
                    </p>
                    <div className="w-full flex justify-center scale-110">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError("Google login failed")}
                            theme="filled_black"
                            width="280px"
                            shape="pill"
                            text="continue_with"
                        />
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 text-center text-xs text-gray-500 font-mono flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-neonCyan animate-pulse shadow-[0_0_8px_#06b6d4]"></div>
                    <span>Secure Identity Gateway</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
