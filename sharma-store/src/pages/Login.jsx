import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Mail, Lock, Eye, EyeOff, User, Loader2, CheckCircle, Smartphone, MessageSquare, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import Logo from '../components/common/Logo';

const Login = () => {
    const { loginWithEmail, signupWithEmail, googleSignIn, resetPassword, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    // Mode: 'email' or 'phone'
    const [authMethod, setAuthMethod] = useState('email');
    const [isLogin, setIsLogin] = useState(true);

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    // Phone Auth
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [confirmObj, setConfirmObj] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    useEffect(() => {
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        };
    }, [authMethod]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccessMessage('');
    };

    const mapAuthError = (err) => {
        const errorCode = err.code || err.message || "";
        if (errorCode.includes('auth/user-not-found') || errorCode.includes('auth/invalid-login-credentials')) return "Invalid email or password.";
        if (errorCode.includes('auth/wrong-password')) return "Incorrect password.";
        if (errorCode.includes('auth/email-already-in-use')) return "Email already registered.";
        if (errorCode.includes('auth/weak-password')) return "Password must be at least 6 characters.";
        if (errorCode.includes('auth/popup-closed-by-user')) return "Sign-in cancelled.";
        return `Unable to sign in. (${errorCode})`;
    };

    // --- Phone Logic ---
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => { },
                'expired-callback': () => setError('Recaptcha expired. Please try again.')
            });
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        if (cleanNumber.length !== 10) {
            setError("Please enter a valid 10-digit mobile number.");
            setLoading(false);
            return;
        }
        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(auth, `+91${cleanNumber}`, appVerifier);
            window.confirmationResult = confirmationResult;
            setConfirmObj(confirmationResult);
            setOtpSent(true);
            setSuccessMessage(`OTP sent to +91 ${cleanNumber}`);
        } catch {
            setError("Failed to send OTP. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await confirmObj.confirm(otp);
            navigate('/');
        } catch {
            setError("Incorrect OTP.");
        } finally {
            setLoading(false);
        }
    };

    // --- Email Logic ---
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = isLogin
                ? await loginWithEmail(formData.email, formData.password)
                : await signupWithEmail(formData.email, formData.password, formData.fullName);

            if (res.success) navigate('/');
            else setError(mapAuthError(res.error));
        } catch {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // --- Google Logic ---
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await googleSignIn();
            if (res.success) navigate('/');
            else setError(mapAuthError(res.error));
        } catch (e) {
            setError("Google sign-in failed.");
        } finally {
            setLoading(false);
        }
    };

    // --- Reset Password Logic ---
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!resetEmail) {
            setError("Please enter your email to reset password.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await resetPassword(resetEmail);
            if (res.success) {
                setSuccessMessage("Password reset email sent. Check your inbox.");
                setShowForgotPassword(false);
            } else {
                setError(mapAuthError(res.error));
            }
        } catch {
            setError("Failed to send reset email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans bg-white">
            {/* Left Side - Brand Visual (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative flex-col justify-center items-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-600/20 to-indigo-900/40"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"></div>

                {/* Brand Visual */}
                <div className="relative z-10 p-12 text-center max-w-xl mx-auto">
                    <div className="mb-8 flex justify-center transform hover:scale-105 transition-transform duration-500">
                        <Logo variant="icon" size="2xl" color="white" />
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight mb-6 font-['Outfit'] drop-shadow-sm">
                        Sharma Store
                    </h1>
                    <p className="text-slate-300 text-lg leading-relaxed font-medium">
                        Fueling your creativity with premium stationery. <br className="hidden xl:block" />
                        Join our community of creators today.
                    </p>

                    {/* Testimonial / Social Proof */}
                    <div className="mt-12 flex items-center justify-center gap-2 text-white/60 text-sm font-bold uppercase tracking-widest">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[8px] overflow-hidden">
                                    <User size={12} className="text-slate-400" />
                                </div>
                            ))}
                        </div>
                        <span className="ml-2">Trusted by 10k+ Creators</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Sharma Store.
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="w-full lg:w-1/2 flex flex-col justify-start items-center p-6 pt-32 sm:pt-40 lg:p-12 lg:pt-36 bg-white relative">
                {/* Mobile Background Pattern */}
                <div className="absolute inset-0 lg:hidden opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="max-w-[420px] w-full space-y-8 relative z-10">
                    {/* Header */}
                    <div className="text-center lg:text-left">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <Logo variant="full" size="xl" />
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 tracking-tight font-['Outfit']">
                            {showForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
                        </h2>
                        <p className="mt-3 text-slate-500 font-medium text-base">
                            {showForgotPassword
                                ? 'Enter your email to receive reset instructions.'
                                : (!isLogin && 'Join us to unlock exclusive deals and rewards.')
                            }
                        </p>
                    </div>

                    {/* Google Sign In */}
                    {!showForgotPassword && (
                        /* Auth Method Toggle */
                        <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200 mb-6">
                            {['email', 'phone'].map((method) => (
                                <button
                                    key={method}
                                    onClick={() => { setAuthMethod(method); setError(''); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${authMethod === method
                                        ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {method === 'email' ? <Mail size={18} /> : <Smartphone size={18} />}
                                    <span className="capitalize">{method}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Messages */}
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="shrink-0 mt-0.5" size={18} /> <span>{error}</span>
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-4 bg-green-50 text-green-700 text-sm font-medium rounded-xl flex items-start gap-3 border border-green-100 animate-in fade-in slide-in-from-top-1">
                            <CheckCircle className="shrink-0 mt-0.5" size={18} /> <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Form Section */}
                    {showForgotPassword ? (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Registered Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-300"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowForgotPassword(false); setError(''); setSuccessMessage(''); }}
                                    className="w-full h-12 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            {authMethod === 'email' ? (
                                <form onSubmit={handleEmailSubmit} className="space-y-5">
                                    {!isLogin && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    required
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-300"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-300"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
                                            {isLogin && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowForgotPassword(true); setError(''); setSuccessMessage(''); }}
                                                    className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                                                >
                                                    Forgot?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-300"
                                                placeholder="••••••••"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-700 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : (
                                            <>
                                                {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-6">
                                    {!otpSent ? (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Mobile Number</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 font-black">+91</div>
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={e => setPhoneNumber(e.target.value)}
                                                    className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xl text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-300 tracking-wide"
                                                    placeholder="98765 43210"
                                                />
                                                <div id="recaptcha-container" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Enter OTP</label>
                                            <div className="relative group">
                                                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    value={otp}
                                                    onChange={e => setOtp(e.target.value)}
                                                    maxLength={6}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-2xl text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-300 tracking-[0.5em] text-center"
                                                    placeholder="••••••"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-700 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : (
                                            <>
                                                {otpSent ? 'Verify & Login' : 'Send Code'} <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-wider text-xs">Or continue with</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-200 rounded-xl shadow-sm text-slate-700 font-bold bg-white hover:bg-slate-50 transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 group"
                            >
                                <svg className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" viewBox="0 0 24 24">
                                    <path d="M12.0003 20.45c4.656 0 8.556-3.235 9.967-7.616l-2.614-2.02c-1.127 2.656-3.75 4.536-6.853 4.536-4.067 0-7.365-2.766-8.59-6.49l-2.69 2.083c2.146 6.36 8.216 10.96 15.28 10.96z" fill="#34A853" />
                                    <path d="M3.41 13.914c-.64-1.92-.64-4.04 0-5.96l2.69 2.084c-.21.58-.33 1.19-.33 1.83s.12 1.25.33 1.83l-2.69 2.084z" fill="#FBBC05" />
                                    <path d="M12.0003 8.64c2.19 0 4.15.82 5.67 2.17l3.66-3.66c-2.45-2.3-5.77-3.66-9.33-3.66-7.065 0-13.134 4.6-15.28 10.96l2.69 2.083c1.225-3.724 4.523-6.49 8.59-6.49z" fill="#EA4335" />
                                    <path d="M23.5 12.07c0-.68-.06-1.34-.17-1.97H12v3.74h6.45c-.28 1.48-1.1 2.74-2.33 3.58l2.613 2.02c3.08-2.84 4.86-7.02 4.07-11.83z" fill="#4285F4" />
                                </svg>
                                <span className="whitespace-nowrap">Continue with Google</span>
                            </button>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={toggleMode}
                                    className="text-slate-600 font-bold hover:text-slate-900 transition-colors text-sm"
                                >
                                    {isLogin ? (
                                        <>
                                            New to Sharma Store? <span className="text-orange-600 hover:underline">Create an account</span>
                                        </>
                                    ) : (
                                        <>
                                            Already have an account? <span className="text-orange-600 hover:underline">Sign in</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
