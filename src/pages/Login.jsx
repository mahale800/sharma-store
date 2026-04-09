import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Mail, Lock, Eye, EyeOff, User, Loader2, CheckCircle, Smartphone, MessageSquare, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import Logo from '../components/common/Logo';
import Button from '../components/Button';

const Login = () => {
    const { loginWithEmail, signupWithEmail, loginWithGoogle, resetPassword, currentUser } = useAuth();
    const navigate = useNavigate();

    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const previousState = location.state?.from?.state || {};

    useEffect(() => {
        if (currentUser) {
            navigate(from, { state: previousState, replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, navigate, from]);

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
        confirmPassword: '',
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
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
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

    // eslint-disable-next-line no-unused-vars
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
            // Navigation handled by useEffect
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

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

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
            const res = await loginWithGoogle();
            if (res.success) {
                // Navigation handled by useEffect
            }
            else setError(mapAuthError(res.error));
        } catch {
            setError("Google sign-in failed.");
        } finally {
            setLoading(false);
        }
    };

    // --- Reset Password Logic ---
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!resetEmail) {
            setError("Please enter a valid email.");
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
        <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-slate-50 relative">
            {/* Back Button */}
            {/* Back Button */}
            <button
                onClick={() => {
                    // Smart Back: If previous state exists, go back. Otherwise go Home.
                    if (location.key !== "default" && window.history.state && window.history.state.idx > 0) {
                        navigate(-1);
                    } else {
                        navigate('/');
                    }
                }}
                className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center hover:scale-105 transition-all text-slate-700 hover:text-orange-600"
                aria-label="Go back or Home"
            >
                <ArrowLeft size={20} />
            </button>

            {/* Left Side - Brand Visual */}
            <div className="w-full lg:w-1/2 lg:min-h-screen bg-slate-900 relative flex flex-col justify-center items-center overflow-hidden py-12 lg:py-0">
                {/* Background Effects */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-600/20 to-indigo-900/40"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"></div>

                {/* Brand Visual */}
                <div className="relative z-10 px-6 lg:p-12 text-center max-w-xl mx-auto">
                    <div className="mb-6 lg:mb-8 flex justify-center transform hover:scale-105 transition-transform duration-500">
                        <Logo variant="icon" size="2xl" color="white" />
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-4 lg:mb-6 font-['Outfit'] drop-shadow-sm">
                        Sharma Store
                    </h1>
                    <p className="text-slate-300 text-base lg:text-lg leading-relaxed font-medium max-w-sm lg:max-w-none mx-auto">
                        Fueling your creativity with premium stationery. <br className="hidden xl:block" />
                        Join our community today.
                    </p>

                    {/* Testimonial / Social Proof */}
                    <div className="mt-8 lg:mt-12 flex flex-col items-center gap-4">
                        <div className="flex items-center justify-center gap-2 text-white/80 text-sm font-bold uppercase tracking-widest">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[8px] overflow-hidden">
                                        <User size={12} className="text-slate-400" />
                                    </div>
                                ))}
                            </div>
                            <span className="ml-2">Trusted by 10k+ Users</span>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex gap-6 mt-4 opacity-60">
                            {[
                                { icon: Lock, text: "Secure Login" },
                                { icon: CheckCircle, text: "Fast Checkout" },
                                { icon: User, text: "Verified Reviews" }
                            ].map((badge, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-1 group cursor-default">
                                    <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                                        <badge.icon size={16} className="text-white" />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-white tracking-wider">{badge.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-8 text-slate-500 text-xs font-bold uppercase tracking-widest hidden lg:block">
                    &copy; {new Date().getFullYear()} Sharma Store.
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 bg-white relative shadow-2xl lg:shadow-none z-20 -mt-6 lg:mt-0 rounded-t-3xl lg:rounded-none">
                {/* Mobile Background Pattern */}
                <div className="absolute inset-0 lg:hidden opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="max-w-[420px] w-full space-y-8 relative z-10 pt-4 lg:pt-0">
                    {/* Header */}
                    <div className="text-center lg:text-left">

                        <h2 className="text-3xl font-black text-slate-900 tracking-tight font-['Outfit']">
                            {showForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
                        </h2>
                        <p className="mt-2 text-slate-500 font-medium text-base">
                            {showForgotPassword
                                ? 'Enter your email to receive reset instructions.'
                                : (!isLogin ? 'Join us to unlock exclusive deals and rewards.' : 'Please enter your details to sign in.')
                            }
                        </p>
                    </div>

                    {/* Google Sign In */}
                    {!showForgotPassword && (
                        <div className="space-y-6">
                            {/* Auth Method Toggle */}
                            <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200">
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
                        </div>
                    )}

                    {/* Messages */}
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl flex items-start gap-3 border border-red-100 animate-in">
                            <AlertCircle className="shrink-0 mt-0.5" size={18} /> <span>{error}</span>
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-4 bg-green-50 text-green-700 text-sm font-medium rounded-xl flex items-start gap-3 border border-green-100 animate-in">
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
                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    className="w-full h-12 shadow-lg shadow-orange-500/30"
                                >
                                    Send Reset Link
                                </Button>
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
                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    {!isLogin && (
                                        <div className="space-y-1.5 animate-in">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    required
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    autoComplete="name"
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
                                                autoComplete="email"
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
                                                autoComplete={isLogin ? "current-password" : "new-password"}
                                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-300"
                                                placeholder="••••••••"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {!isLogin && (
                                        <div className="space-y-1.5 animate-in">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Confirm Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    required
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    autoComplete="new-password"
                                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-300"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        isLoading={loading}
                                        className="w-full h-12 shadow-lg shadow-orange-500/30 mt-4 gap-2"
                                    >
                                        {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} />
                                    </Button>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    {!otpSent ? (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Mobile Number</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 font-black">+91</div>
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={e => setPhoneNumber(e.target.value)}
                                                    autoComplete="tel"
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
                                                    autoComplete="one-time-code"
                                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-2xl text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-300 tracking-[0.5em] text-center"
                                                    placeholder="••••••"
                                                    autoFocus
                                                />
                                            </div>
                                            <Button
                                                onClick={handleVerifyOtp}
                                                isLoading={loading}
                                                className="w-full h-12 shadow-lg shadow-orange-500/30 mt-4 gap-2"
                                            >
                                                Verify OTP <ArrowRight size={20} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
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
                                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-200 rounded-xl shadow-sm text-slate-700 font-bold bg-white hover:bg-slate-50 transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 group active:scale-[0.98]"
                            >
                                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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
        </div >
    );
};

export default Login;
