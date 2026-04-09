'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiEye, FiEyeOff, FiAlertCircle, FiMail, FiCheckCircle } from 'react-icons/fi';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setIsSuccess(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-[#191919] p-8 md:p-10 rounded-2xl border border-[#2d2d2d] shadow-2xl">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center space-y-6 py-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-blue-600/10 p-5 rounded-full border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.15)] flex items-center justify-center">
              <FiMail className="w-10 h-10 text-blue-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Verify your email</h2>
              <p className="text-sm text-[#a3a3a3] leading-relaxed">
                We've sent a verification link to <span className="text-white font-medium">{email}</span>. 
                Please check your inbox and click the link to confirm your account.
              </p>
            </div>
            
            <div className="bg-[#111111] border border-[#2d2d2d] p-5 rounded-xl w-full text-left space-y-4 shadow-inner">
               <div className="flex items-center space-x-3">
                 <div className="w-6 h-6 rounded-full bg-[#191919] border border-[#2d2d2d] flex items-center justify-center shrink-0">
                   <span className="text-xs font-bold text-blue-500">1</span>
                 </div>
                 <span className="text-sm text-[#d4d4d4] font-medium">Open your email app</span>
               </div>
               <div className="flex items-center space-x-3">
                 <div className="w-6 h-6 rounded-full bg-[#191919] border border-[#2d2d2d] flex items-center justify-center shrink-0">
                   <span className="text-xs font-bold text-blue-500">2</span>
                 </div>
                 <span className="text-sm text-[#d4d4d4] font-medium">Click the confirmation link</span>
               </div>
               <div className="flex items-center space-x-3">
                 <div className="w-6 h-6 rounded-full bg-[#191919] border border-[#2d2d2d] flex items-center justify-center shrink-0">
                   <span className="text-xs font-bold text-blue-500">3</span>
                 </div>
                 <span className="text-sm text-[#d4d4d4] font-medium">Return here to sign in</span>
               </div>
            </div>

            <Link href="/auth/signin" className="w-full mt-6 group relative flex justify-center py-3.5 px-4 border border-[#2d2d2d] text-sm font-semibold rounded-xl text-white bg-[#111111] hover:bg-[#1a1a1a] focus:outline-none transition-all active:scale-[0.98]">
              Continue to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
                Create your account
              </h2>
              <p className="mt-3 text-center text-sm text-[#a3a3a3]">
                Or{' '}
                <Link href="/auth/signin" className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                  sign in to your existing account
                </Link>
              </p>
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-start space-x-3">
                <FiAlertCircle className="text-red-400 mt-0.5 shrink-0" size={18} />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 bg-[#111111] border border-[#2d2d2d] placeholder-[#525252] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 bg-[#111111] border border-[#2d2d2d] placeholder-[#525252] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none relative block w-full pl-4 pr-12 py-3 bg-[#111111] border border-[#2d2d2d] placeholder-[#525252] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#737373] hover:text-[#a3a3a3] transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-[#a3a3a3] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none relative block w-full pl-4 pr-12 py-3 bg-[#111111] border border-[#2d2d2d] placeholder-[#525252] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#737373] hover:text-[#a3a3a3] transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-blue-900/50 text-sm font-semibold rounded-lg text-blue-50 bg-[#2563eb] hover:bg-[#1d4ed8] focus:outline-none transition-colors shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
            
            <div className="text-center text-xs text-[#737373] mt-6">
              <p>By creating an account, you agree to our <a href="#" className="font-semibold text-blue-500 hover:text-blue-400">Terms of Service</a> and <a href="#" className="font-semibold text-blue-500 hover:text-blue-400">Privacy Policy</a>.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
