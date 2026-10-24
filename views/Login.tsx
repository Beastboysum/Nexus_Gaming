import React, { useState } from 'react';
import { 
  Loader2, 
  Zap, 
  Hexagon, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck,
  Gamepad2
} from 'lucide-react';
import { playCategorizedAudio, SoundEffectEngine } from '../services/audioManager';
import { AuthService } from '../services/firebase';
import { updateCurrentUser } from '../services/serverService';
import { User } from '../types';

interface LoginProps {
  onLogin: (user?: User) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
];

export const LoginView: React.FC<LoginProps> = ({ onLogin }) => {
  // Mode: 'login' | 'register' | 'username_prompt'
  const [mode, setMode] = useState<'login' | 'register' | 'username_prompt'>('login');
  const [isExiting, setIsExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailNotFoundError, setEmailNotFoundError] = useState(false);

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Pending user info waiting for username choice
  const [pendingUid, setPendingUid] = useState<string>('');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [pendingProvider, setPendingProvider] = useState<string>('google');
  const [chosenUsername, setChosenUsername] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(PRESET_AVATARS[0]);
  const [usernameChecking, setUsernameChecking] = useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Switch between Login and Register tabs
  const handleSwitchMode = (newMode: 'login' | 'register') => {
    SoundEffectEngine.play('button-click');
    setMode(newMode);
    setErrorMsg(null);
    setEmailNotFoundError(false);
  };

  // Warp exit transition
  const triggerSuccessExit = (userProfile: User) => {
    setIsExiting(true);
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-plasma-gun-power-up-1679.mp3', 'system', 0.5);
    setTimeout(() => {
      onLogin(userProfile);
    }, 1100);
  };

  // 1. Social Logins (Google & Facebook)
  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setEmailNotFoundError(false);
    setIsLoading(true);
    SoundEffectEngine.play('button-click');

    try {
      const res = await AuthService.loginWithGoogle();
      const user = res.user;

      if (res.isNewUser || !res.existingProfile?.username) {
        // New user or missing username: ask them what username they want!
        setPendingUid(user.uid);
        setPendingEmail(user.email || '');
        setPendingProvider('google.com');
        const defaultName = user.displayName?.replace(/\s+/g, '_').toLowerCase() || user.email?.split('@')[0] || 'nexus_gamer';
        setChosenUsername(defaultName.slice(0, 20));
        if (user.photoURL) {
          setSelectedAvatar(user.photoURL);
        }
        setMode('username_prompt');
        setIsLoading(false);
      } else {
        // Existing user with username: proceed to login
        updateCurrentUser(res.existingProfile);
        setIsLoading(false);
        triggerSuccessExit(res.existingProfile);
      }
    } catch (err: any) {
      setIsLoading(false);
      console.error('Google Auth Error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign in popup was closed. Please try again.');
      } else {
        setErrorMsg(err?.message || 'Failed to authenticate with Google.');
      }
    }
  };

  const handleFacebookAuth = async () => {
    setErrorMsg(null);
    setEmailNotFoundError(false);
    setIsLoading(true);
    SoundEffectEngine.play('button-click');

    try {
      const res = await AuthService.loginWithFacebook();
      const user = res.user;

      if (res.isNewUser || !res.existingProfile?.username) {
        // Ask what username they want!
        setPendingUid(user.uid);
        setPendingEmail(user.email || '');
        setPendingProvider('facebook.com');
        const defaultName = user.displayName?.replace(/\s+/g, '_').toLowerCase() || 'gamer_fb';
        setChosenUsername(defaultName.slice(0, 20));
        if (user.photoURL) {
          setSelectedAvatar(user.photoURL);
        }
        setMode('username_prompt');
        setIsLoading(false);
      } else {
        updateCurrentUser(res.existingProfile);
        setIsLoading(false);
        triggerSuccessExit(res.existingProfile);
      }
    } catch (err: any) {
      setIsLoading(false);
      console.error('Facebook Auth Error:', err);
      if (err?.code === 'auth/operation-not-supported-in-this-environment' || err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/configuration-not-found') {
        setErrorMsg('Facebook provider is not enabled in Firebase Console. You can sign in using Google or Email.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign in popup was closed. Please try again.');
      } else {
        setErrorMsg(err?.message || 'Failed to authenticate with Facebook.');
      }
    }
  };

  // 2. Email & Password Login with Server Crosscheck
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEmailNotFoundError(false);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    // --- SPECIAL CASE: SIGN-IN BYPASS PROTOCOL ---
    // Can ONLY be bypassed by this exact special case:
    // Email: "beast2008" (or beast2008@nexus.gg / beast2008@gmail.com)
    // Password: "20081030"
    // Bypasses the verification system without requiring Google or Facebook sign-in.
    // ONLY this particular case can bypass; rest all have to follow the normal protocol.
    const isSpecialBypass = (
      cleanEmail === 'beast2008' || 
      cleanEmail === 'beast2008@nexus.gg' || 
      cleanEmail === 'beast2008@gmail.com'
    ) && password === '20081030';

    if (isSpecialBypass) {
      setIsLoading(true);
      SoundEffectEngine.play('streak-burst');
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-magical-glitter-sparkle-2629.mp3', 'system', 0.7);

      // Dedicated Beast2008 VIP Account with exclusive gaming badge
      const bypassProfile: User = {
        id: 'vip-beast2008',
        username: 'Beast2008',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=200&auto=format&fit=crop',
        status: 'online',
        email: 'beast2008@nexus.vip',
        provider: 'bypass_vip',
        createdAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('nexus_is_logged_in', 'true');
        localStorage.setItem('nexus_bypass_session', 'true');
        localStorage.setItem('nexus_equipped_badge', 'badge-5'); // Exclusive VIP gaming badge
        localStorage.setItem('nexus_current_user_profile', JSON.stringify(bypassProfile));
      } catch (_) {}

      updateCurrentUser(bypassProfile);
      setIsLoading(false);
      triggerSuccessExit(bypassProfile);
      return;
    }

    // --- NORMAL PROTOCOL FOR ALL OTHER USERS ---
    // Must be a valid email format
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    SoundEffectEngine.play('button-click');

    try {
      // REQUIREMENT: "when someone login wiht email and passwrods corsscheck in the server if there is the email or not"
      const emailExists = await AuthService.checkEmailExistsInServer(cleanEmail);

      if (!emailExists) {
        setIsLoading(false);
        setEmailNotFoundError(true);
        setErrorMsg(`No account found on the server with email "${cleanEmail}".`);
        return;
      }

      // Email exists! Attempt sign in
      const res = await AuthService.loginWithEmail(cleanEmail, password);
      
      if (!res.profile || !res.profile.username) {
        // If profile missing username, prompt for it
        setPendingUid(res.user.uid);
        setPendingEmail(cleanEmail);
        setPendingProvider('password');
        setChosenUsername(cleanEmail.split('@')[0].slice(0, 20));
        setMode('username_prompt');
        setIsLoading(false);
        return;
      }

      updateCurrentUser(res.profile);
      setIsLoading(false);
      triggerSuccessExit(res.profile);
    } catch (err: any) {
      setIsLoading(false);
      console.error('Email login error:', err);
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        setEmailNotFoundError(true);
        setErrorMsg(`No account found on the server with email "${cleanEmail}".`);
      } else if (err?.code === 'auth/wrong-password') {
        setErrorMsg('Incorrect password. Please verify your password and try again.');
      } else if (err?.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg(err?.message || 'Login failed. Please check your credentials.');
      }
    }
  };

  // 3. Email & Password Registration
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEmailNotFoundError(false);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter an email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    SoundEffectEngine.play('button-click');

    try {
      // Check if email already registered on server
      const alreadyRegistered = await AuthService.checkEmailExistsInServer(cleanEmail);
      if (alreadyRegistered) {
        setIsLoading(false);
        setErrorMsg(`An account with email "${cleanEmail}" already exists. Please log in.`);
        return;
      }

      // Create Firebase Auth user
      const user = await AuthService.registerWithEmail(cleanEmail, password);

      // Successfully registered credentials: now ask what username they want!
      setPendingUid(user.uid);
      setPendingEmail(cleanEmail);
      setPendingProvider('password');
      setChosenUsername(cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || 'gamer');
      setMode('username_prompt');
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      console.error('Register error:', err);
      if (err?.code === 'auth/email-already-in-use') {
        setErrorMsg(`An account with "${cleanEmail}" already exists. Please log in instead.`);
      } else if (err?.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg(err?.message || 'Registration failed. Please try again.');
      }
    }
  };

  // 4. Username Selection Submission (Gamer Tag Prompt)
  const handleConfirmUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);

    const cleanTag = chosenUsername.trim();
    if (!cleanTag || cleanTag.length < 2) {
      setUsernameError('Username must be at least 2 characters long.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanTag)) {
      setUsernameError('Username can only contain letters, numbers, underscores, and dashes.');
      return;
    }

    setUsernameChecking(true);
    SoundEffectEngine.play('button-click');

    try {
      // Save profile to Firestore and local state
      const savedUser = await AuthService.saveUserProfile(pendingUid, {
        username: cleanTag,
        email: pendingEmail,
        avatar: selectedAvatar,
        provider: pendingProvider,
      });

      updateCurrentUser(savedUser);
      setUsernameChecking(false);
      triggerSuccessExit(savedUser);
    } catch (err: any) {
      setUsernameChecking(false);
      setUsernameError(err?.message || 'Failed to save username. Please try another tag.');
    }
  };

  return (
    <div className={`h-[100dvh] max-h-[100dvh] w-full bg-slate-50 dark:bg-[#0c0d12] transition-all duration-[1100ms] overflow-y-auto overscroll-contain custom-scrollbar relative ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Background Ambience */}
      <div className={`fixed inset-0 transition-opacity duration-1000 ${isExiting ? 'opacity-0' : 'opacity-100'} pointer-events-none`}>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/15 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* Adaptive Centering Viewport - Never clips logo, smoothly scrolls when compact */}
      <div className="min-h-full w-full flex flex-col items-center justify-start sm:justify-center px-2.5 xs:px-4 sm:px-6 py-3 xs:py-5 sm:py-8 relative z-10">
        <div className="w-full max-w-[340px] xs:max-w-[380px] sm:max-w-md flex flex-col items-center shrink-0">
        
        {/* NEXUS LOGO - Fluid adaptive sizing according to screen and device */}
        <div className={`relative flex flex-col items-center justify-center mb-2 xs:mb-3 sm:mb-4 md:mb-5 transition-transform duration-[1100ms] cubic-bezier(0.7, 0, 0.3, 1) origin-center shrink-0
            ${isExiting ? 'scale-[60] z-50' : 'scale-100 z-20 hover:scale-105'}`}>
          
          <div className={`relative transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 blur-xl opacity-50 animate-pulse"></div>
            <div className="relative flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#1e1f24] to-[#0f1014] rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl mb-1 xs:mb-1.5 sm:mb-2.5">
              <Hexagon className="text-purple-500 animate-spin-slow w-5.5 h-5.5 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9" strokeWidth={1.5} />
              <Zap className="text-white absolute fill-white w-2.5 h-2.5 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center gap-0.5 sm:gap-1">
            <span>NE</span>
            <span className={`transition-opacity duration-[800ms] delay-200 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>X</span>
            <span>US</span>
          </h1>
          <p className={`text-[8.5px] xs:text-[9.5px] sm:text-xs font-bold text-purple-400 tracking-[0.22em] xs:tracking-[0.28em] sm:tracking-[0.4em] uppercase mt-0.5 sm:mt-1 transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            Gaming Platform
          </p>
        </div>
        
        {/* CARD CONTAINER - Fluid padding and dimensions */}
        <div className={`w-full bg-white/90 dark:bg-[#15161e]/90 backdrop-blur-2xl rounded-2xl xs:rounded-3xl sm:rounded-[2rem] shadow-2xl p-3 xs:p-4.5 sm:p-6 md:p-7 border border-white/20 dark:border-white/10 transition-all duration-500 
            ${isExiting ? 'opacity-0 translate-y-20 scale-90 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'}`}>

          {/* ========================================================= */}
          {/* STEP 3: USERNAME & GAMER TAG SELECTION PROMPT             */}
          {/* ========================================================= */}
          {mode === 'username_prompt' && (
            <div className="space-y-2.5 xs:space-y-3.5 sm:space-y-5 animate-fadeIn">
              <div className="text-center space-y-0.5 sm:space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] xs:text-[10px] sm:text-xs font-bold mb-0.5">
                  <Sparkles size={11} className="shrink-0" />
                  <span>Final Step: Choose Your Identity</span>
                </div>
                <h2 className="text-base xs:text-lg sm:text-2xl font-black text-slate-800 dark:text-white">
                  What username do you want?
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] xs:text-[11px] sm:text-xs">
                  Your unique gamer tag will appear in voice channels, servers, and leaderboards.
                </p>
              </div>

              {/* Avatar Selector Preview */}
              <div className="flex flex-col items-center justify-center gap-1 pt-0.5">
                <div className="relative">
                  <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-xl xs:rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-purple-500/50 shadow-xl shadow-purple-500/20 bg-black/40">
                    <img src={selectedAvatar} alt="Chosen Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-0.5 sm:p-1 bg-purple-600 rounded-md sm:rounded-xl text-white shadow">
                    <Gamepad2 size={10} className="sm:w-3 sm:h-3" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase">Avatar:</span>
                  <div className="flex items-center gap-1">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg overflow-hidden border transition-all ${
                          selectedAvatar === av ? 'border-purple-400 scale-110 ring-2 ring-purple-500/50' : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={av} alt="Avatar Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Username Input Form */}
              <form onSubmit={handleConfirmUsername} className="space-y-2.5 xs:space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <label className="text-[9.5px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center justify-between">
                    <span>Gamer Tag / Username</span>
                    <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] font-mono text-purple-400">{chosenUsername.length}/20</span>
                  </label>
                  
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-black text-xs sm:text-sm">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={20}
                      value={chosenUsername}
                      onChange={(e) => {
                        setChosenUsername(e.target.value);
                        setUsernameError(null);
                      }}
                      placeholder="e.g. shadow_sniper"
                      className="w-full h-9 xs:h-10 sm:h-12 pl-7 xs:pl-8 sm:pl-9 pr-3 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-black/40 border-2 border-white/10 focus:border-purple-500 outline-none text-slate-800 dark:text-white font-bold text-xs sm:text-sm transition-all"
                    />
                  </div>

                  {usernameError && (
                    <p className="text-[10px] xs:text-[11px] sm:text-xs text-rose-400 font-bold flex items-center gap-1 mt-0.5 ml-1">
                      <AlertCircle size={12} />
                      <span>{usernameError}</span>
                    </p>
                  )}
                </div>

                {/* Suggestions Quick Chips */}
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <span className="text-[8.5px] xs:text-[9.5px] text-slate-500 font-bold">Suggestions:</span>
                  {['ValkyrieAce', 'PhantomX', 'CyberStrike', 'NexusClutch'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setChosenUsername(tag)}
                      className="text-[8.5px] xs:text-[9.5px] px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={usernameChecking || !chosenUsername.trim()}
                  className="w-full h-10 xs:h-11 sm:h-13 sm:h-14 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {usernameChecking ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span className="text-xs sm:text-sm font-black tracking-wider uppercase">Enter Nexus Platform</span>
                      <ArrowRight size={15} className="shrink-0" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1 & 2: LOGIN OR REGISTER SCREEN                      */}
          {/* ========================================================= */}
          {mode !== 'username_prompt' && (
            <div className="space-y-2.5 xs:space-y-3 sm:space-y-4">
              
              {/* Header with Switcher Tabs */}
              <div className="flex items-center p-1 rounded-xl sm:rounded-2xl bg-black/30 border border-white/5 mb-0.5 xs:mb-1 sm:mb-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className={`flex-1 py-1 xs:py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] xs:text-[11px] sm:text-xs font-black transition-all ${
                    mode === 'login'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  className={`flex-1 py-1 xs:py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] xs:text-[11px] sm:text-xs font-black transition-all ${
                    mode === 'register'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              <div className="text-center space-y-0.5">
                <h2 className="text-sm xs:text-base sm:text-xl font-black text-slate-800 dark:text-white">
                  {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] xs:text-[11px] sm:text-xs">
                  {mode === 'login' 
                    ? 'Login with credentials or social accounts' 
                    : 'Choose Google, Facebook, or Email to register'}
                </p>
              </div>

              {/* Error Banner with Server Crosscheck Feedback */}
              {errorMsg && (
                <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-[10px] xs:text-[11px] sm:text-xs font-medium space-y-1 animate-fadeIn ${
                  emailNotFoundError
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-start gap-1.5 xs:gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <p className="flex-1">{errorMsg}</p>
                  </div>

                  {/* Quick Action when email was not found during login */}
                  {emailNotFoundError && mode === 'login' && (
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('register');
                          setErrorMsg(null);
                          setEmailNotFoundError(false);
                        }}
                        className="text-[10px] xs:text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-all shadow"
                      >
                        <span>Register with "{email}" now</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SOCIAL LOGIN BUTTONS (Google & Facebook) */}
              <div className="space-y-1.5 xs:space-y-2">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full h-8.5 xs:h-9.5 sm:h-11 md:h-12 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1a1c26] hover:bg-slate-100 dark:hover:bg-[#202230] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold text-[10px] xs:text-[11px] sm:text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm hover:shadow"
                >
                  {/* Google SVG G Icon */}
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{mode === 'register' ? 'Register with Google' : 'Sign in with Google'}</span>
                </button>

                {/* Facebook Button */}
                <button
                  type="button"
                  onClick={handleFacebookAuth}
                  disabled={isLoading}
                  className="w-full h-8.5 xs:h-9.5 sm:h-11 md:h-12 rounded-xl sm:rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] dark:text-[#5ba1fc] font-bold text-[10px] xs:text-[11px] sm:text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                  {/* Facebook SVG Logo */}
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>{mode === 'register' ? 'Register with Facebook' : 'Sign in with Facebook'}</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2 xs:gap-3 py-0.5">
                <div className="flex-1 h-[1px] bg-slate-200 dark:bg-white/10" />
                <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {mode === 'register' ? 'or register with email' : 'or email login'}
                </span>
                <div className="flex-1 h-[1px] bg-slate-200 dark:bg-white/10" />
              </div>

              {/* Email Form */}
              <form 
                noValidate
                onSubmit={mode === 'register' ? handleEmailRegister : handleEmailLogin} 
                className="space-y-2 xs:space-y-2.5 sm:space-y-3"
              >
                <div className="space-y-0.5 xs:space-y-1">
                  <label className="text-[9.5px] xs:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      inputMode="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg(null);
                        setEmailNotFoundError(false);
                      }}
                      placeholder="gamer@nexus.com or account ID"
                      className="w-full h-8.5 xs:h-9.5 sm:h-11 pl-8.5 pr-3 sm:pl-10 sm:pr-4 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-black/30 border-2 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-black/60 outline-none transition-all font-medium text-xs sm:text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-0.5 xs:space-y-1">
                  <label className="text-[9.5px] xs:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="••••••••"
                      className="w-full h-8.5 xs:h-9.5 sm:h-11 pl-8.5 pr-3 sm:pl-10 sm:pr-4 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-black/30 border-2 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-black/60 outline-none transition-all font-medium text-xs sm:text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="space-y-0.5 xs:space-y-1 animate-fadeIn">
                    <label className="text-[9.5px] xs:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setErrorMsg(null);
                        }}
                        placeholder="••••••••"
                        className="w-full h-8.5 xs:h-9.5 sm:h-11 pl-8.5 pr-3 sm:pl-10 sm:pr-4 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-black/30 border-2 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-black/60 outline-none transition-all font-medium text-xs sm:text-sm text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-9.5 xs:h-10.5 sm:h-13 mt-1.5 sm:mt-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] text-white font-black rounded-xl sm:rounded-2xl shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : mode === 'register' ? (
                    <>
                      <span className="text-xs sm:text-sm font-black tracking-wide">Continue to Choose Username</span>
                      <ArrowRight size={15} className="shrink-0" />
                    </>
                  ) : (
                    <>
                      <span className="text-xs sm:text-sm font-black tracking-wider uppercase">Enter Nexus</span>
                      <Zap size={16} fill="white" className="shrink-0" />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle Mode footer */}
              <div className="text-center pt-1.5 xs:pt-2 border-t border-slate-200 dark:border-white/5">
                {mode === 'login' ? (
                  <p className="text-[11px] xs:text-xs text-slate-400">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('register')}
                      className="text-purple-400 font-bold hover:underline"
                    >
                      Register
                    </button>
                  </p>
                ) : (
                  <p className="text-[11px] xs:text-xs text-slate-400">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('login')}
                      className="text-purple-400 font-bold hover:underline"
                    >
                      Log in here
                    </button>
                  </p>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
      
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};