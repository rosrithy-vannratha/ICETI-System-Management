import React, { useState } from 'react';
import { UserRole } from '../types';
import { APP_ASSETS } from '../data/mockData';
import { Eye, EyeOff, User, Lock, HelpCircle, ArrowRight, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginScreenProps {
  onLogin: (role: UserRole, username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanUser = username.trim().toLowerCase();
      
      // Strict Admin check: Admin / pw: admin123
      if ((cleanUser === 'admin' || cleanUser === 'admin_demo') && password === 'admin123') {
        onLogin('admin', 'អ្នកគ្រប់គ្រង (Admin)');
      } else {
        setErrorMessage('ឈ្មោះអ្នកប្រើប្រាស់ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ!');
      }
    }, 400);
  };

  return (
    <div className="bg-[#e5eeff] dark:bg-[#0b1329] min-h-screen flex items-center justify-center relative overflow-hidden text-[#0b1c30] dark:text-[#e6edfc] p-4">
      {/* Ambient background glowing circles */}
      <div className="fixed -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-[#1e40af]/30 dark:bg-[#1e40af]/20 blur-[130px] pointer-events-none" />
      <div className="fixed -bottom-32 -right-32 w-[650px] h-[650px] rounded-full bg-[#86f2e4]/30 dark:bg-[#004d47]/30 blur-[150px] pointer-events-none" />

      {/* Main Card */}
      <motion.main
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px] z-10 relative"
      >
        <div className="bg-white dark:bg-[#131f3d] rounded-3xl shadow-[0px_10px_35px_rgba(0,40,142,0.12)] dark:shadow-[0px_10px_35px_rgba(0,0,0,0.5)] border border-[#c4c5d5]/60 dark:border-[#283958] p-7 sm:p-9 relative overflow-hidden backdrop-blur-md">
          {/* Header & Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-[#eff4ff] dark:bg-[#18284e] rounded-3xl flex items-center justify-center mb-4 shadow-xs border border-[#c4c5d5]/50 dark:border-[#283958] p-3 transition-transform hover:scale-105">
              <img
                src={APP_ASSETS.loginLogo}
                alt="src/assets/images/icetilogo.jpg"
                className="w-12 h-12 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00288e] dark:text-[#8da4ff] text-center tracking-tight mb-1">
              វិ.គរុកោសល្យភាសាចិន
            </h1>
            <p className="text-xs sm:text-sm text-[#444653] dark:text-[#9da9c7] text-center font-medium">
              ប្រព័ន្ធគ្រប់គ្រងនិស្សិត និងវត្តមាន
            </p>
          </div>

          {/* Admin Badge */}
          <div className="flex items-center justify-center gap-2 mb-6 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 rounded-2xl text-xs text-indigo-700 dark:text-indigo-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>គណនីគ្រប់គ្រងប្រព័ន្ធ (Admin Portal)</span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#0b1c30] dark:text-[#e6edfc] mb-1.5" htmlFor="username">
                ឈ្មោះអ្នកប្រើប្រាស់ (Username)
              </label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757684] group-focus-within:text-[#00288e] dark:group-focus-within:text-[#8da4ff] transition-colors">
                  <User className="w-5 h-5" />
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="input you username"
                  className="w-full bg-[#f8f9ff] dark:bg-[#18284e] border border-[#c4c5d5] dark:border-[#283958] rounded-2xl py-3 pl-11 pr-4 text-[#0b1c30] dark:text-white text-sm focus:outline-none focus:border-[#00288e] dark:focus:border-[#8da4ff] focus:ring-2 focus:ring-[#00288e]/20 transition-all placeholder-[#757684]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#0b1c30] dark:text-[#e6edfc] mb-1.5" htmlFor="password">
                ពាក្យសម្ងាត់ (Password)
              </label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757684] group-focus-within:text-[#00288e] dark:group-focus-within:text-[#8da4ff] transition-colors">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="input your password"
                  className="w-full bg-[#f8f9ff] dark:bg-[#18284e] border border-[#c4c5d5] dark:border-[#283958] rounded-2xl py-3 pl-11 pr-11 text-[#0b1c30] dark:text-white text-sm focus:outline-none focus:border-[#00288e] dark:focus:border-[#8da4ff] focus:ring-2 focus:ring-[#00288e]/20 transition-all placeholder-[#757684]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#0b1c30] dark:hover:text-white transition-colors p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                    rememberMe
                      ? 'bg-[#00288e] border-[#00288e] text-white'
                      : 'border-[#c4c5d5] bg-transparent'
                  }`}
                >
                  {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-xs text-[#444653] dark:text-[#9da9c7]">
                  ចងចាំខ្ញុំ
                </span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-semibold text-[#00288e] dark:text-[#8da4ff] hover:underline"
              >
                ភ្លេចពាក្យសម្ងាត់?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00288e] hover:bg-[#1e40af] text-white py-3.5 rounded-2xl font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>ចូលប្រើប្រាស់</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Help */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-[#444653] dark:text-[#9da9c7] hover:text-[#00288e] dark:hover:text-white transition-colors bg-white/70 dark:bg-[#131f3d]/70 backdrop-blur-sm py-2 px-4 rounded-full border border-[#c4c5d5]/40 dark:border-[#283958] shadow-xs"
          >
            <HelpCircle className="w-4 h-4 text-[#00288e] dark:text-[#8da4ff]" />
            <span>ព័ត៌មានជំនួយបច្ចេកទេស</span>
          </button>
        </div>
      </motion.main>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#131f3d] rounded-3xl p-6 max-w-sm w-full shadow-xl border border-[#c4c5d5] dark:border-[#283958]"
            >
              <h3 className="text-lg font-bold text-[#00288e] dark:text-[#8da4ff] mb-2">
                កំណត់ពាក្យសម្ងាត់ឡើងវិញ
              </h3>
              <p className="text-xs text-[#444653] dark:text-[#9da9c7] mb-4">
                សូមបញ្ចូលអ៊ីមែល ឬឈ្មោះគណនី Admin ដើម្បីទទួលការកំណត់ពាក្យសម្ងាត់ឡើងវិញ។
              </p>
              {resetEmailSent ? (
                <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-2xl text-xs mb-4">
                  ✓ តំណភ្ជាប់សម្រាប់ផ្លាស់ប្តូរពាក្យសម្ងាត់ត្រូវបានផ្ញើជូនរួចរាល់!
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Admin ឬ ros.rithyvannratha@gmail.com"
                  className="w-full bg-[#f8f9ff] dark:bg-[#18284e] border border-[#c4c5d5] dark:border-[#283958] rounded-2xl p-2.5 text-xs sm:text-sm mb-4"
                  defaultValue="ros.rithyvannratha@gmail.com"
                />
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetEmailSent(false);
                  }}
                  className="px-4 py-2 text-xs text-[#444653] dark:text-[#9da9c7] hover:bg-[#eff4ff] dark:hover:bg-[#18284e] rounded-xl font-semibold cursor-pointer"
                >
                  បិទ
                </button>
                {!resetEmailSent && (
                  <button
                    type="button"
                    onClick={() => setResetEmailSent(true)}
                    className="px-4 py-2 text-xs bg-[#00288e] text-white rounded-xl font-semibold hover:bg-[#1e40af] cursor-pointer"
                  >
                    ផ្ញើដំណភ្ជាប់
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#131f3d] rounded-3xl p-6 max-w-md w-full shadow-xl border border-[#c4c5d5] dark:border-[#283958]"
            >
              <h3 className="text-lg font-bold text-[#00288e] dark:text-[#8da4ff] mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                ជំនួយបច្ចេកទេស - វិ.គរុកោសល្យភាសាចិន
              </h3>
              <div className="text-xs sm:text-sm text-[#444653] dark:text-[#9da9c7] space-y-3 mb-5">
                <p>
                  <strong>វិទ្យាស្ថានគរុកោសល្យភាសាចិន</strong> - ប្រព័ន្ធគ្រប់គ្រងនិស្សិត និងកត់ត្រាវត្តមានសិក្សា។
                </p>
                <div className="bg-[#eff4ff] dark:bg-[#18284e] p-3.5 rounded-2xl text-xs space-y-1.5 border border-[#c4c5d5]/40 dark:border-[#283958] text-[#444653] dark:text-[#9da9c7]">
                  <p>
                    សម្រាប់ការគាំទ្រ ឬការស្នើសុំគណនីចូលប្រើប្រាស់ សូមទាក់ទងផ្នែកព័ត៌មានវិទ្យារបស់វិទ្យាស្ថាន។
                  </p>
                  <p className="font-semibold text-[#00288e] dark:text-[#8da4ff]">
                    អ៊ីមែល៖ ros.rithyvannratha@gmail.com | ទូរស័ព្ទ៖ 087 494 969
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 text-xs bg-[#00288e] text-white rounded-xl font-bold hover:bg-[#1e40af] cursor-pointer"
                >
                  យល់ព្រម
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

