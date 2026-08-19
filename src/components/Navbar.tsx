import React, { useState, useRef } from 'react';
import { UserRole } from '../types';
import { APP_ASSETS } from '../data/mockData';
import {
  Search,
  Moon,
  Sun,
  Bell,
  Settings,
  Menu,
  X,
  ShieldCheck,
  GraduationCap,
  LogOut,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Camera,
  Upload,
  Cloud,
  HardDrive,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NavTab } from './Sidebar';
import { DriveSyncStatus } from '../types';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  userRole: UserRole;
  userName: string;
  adminAvatar?: string;
  onUpdateAdminAvatar?: (url: string) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenDriveSync?: () => void;
  driveSyncStatus?: DriveSyncStatus;
  onSelectTab?: (tab: NavTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  userRole,
  userName,
  adminAvatar,
  onUpdateAdminAvatar,
  onLogout,
  onOpenSettings,
  onOpenDriveSync,
  driveSyncStatus,
  searchQuery,
  onSearchChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const navFileInputRef = useRef<HTMLInputElement>(null);

  const displayAvatar = userRole === 'admin' ? (adminAvatar || APP_ASSETS.userAvatar) : APP_ASSETS.teacherAvatar;

  const handleNavAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateAdminAvatar) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onUpdateAdminAvatar(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const notifications = [
    {
      id: 'n-1',
      title: 'កត់ត្រាវត្តមានបានជោគជ័យ',
      description: 'ថ្នាក់គរុកោសល្យ ឆ្នាំទី ៤ ក បានកត់ត្រាវត្តមានថ្ងៃនេះរួចរាល់',
      time: '១០ នាទីមុន',
      type: 'success'
    },
    {
      id: 'n-2',
      title: 'សិស្សអវត្តមាន ៣ ថ្ងៃជាប់គ្នា',
      description: 'ពេជ្រ សំណាង (ថ្នាក់ភាសាចិន ឆ្នាំទី ៣) អវត្តមានលើស ២ ថ្ងៃ',
      time: '៣៥ នាទីមុន',
      type: 'warning'
    },
    {
      id: 'n-3',
      title: 'របាយការណ៍ប្រចាំខែតុលា',
      description: 'ស្ថិតិវត្តមានប្រចាំខែត្រូវបានបង្កើតរួចរាល់',
      time: '២ ម៉ោងមុន',
      type: 'info'
    }
  ];

  return (
    <header className="bg-white/80 dark:bg-[#0c0c0e]/90 backdrop-blur-xl sticky top-0 z-40 border-b border-zinc-200/80 dark:border-zinc-800/80 flex justify-between items-center w-full px-4 sm:px-6 md:px-8 py-3 transition-colors">
      {/* Left: Brand & Search */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <span>វិ.គរុកោសល្យភាសាចិន</span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              ប្រព័ន្ធគ្រប់គ្រង
            </span>
          </h2>
        </div>

        <div className="relative hidden lg:block">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ស្វែងរកសិស្ស ថ្នាក់ ឬកូដ..."
            className="pl-9 pr-4 py-1.5 bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 w-60 xl:w-72 transition-all placeholder-zinc-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Real-time Cloud Database Status Pill */}
        <div
          className="px-2.5 sm:px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs"
          title="ប្រព័ន្ធកំពុងដំណើរការលើ Live Firestore Cloud Database ផ្ទាល់"
        >
          <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden md:inline font-bold">Cloud Live</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        </div>

        {/* Google Drive Sync Indicator / Button */}
        {onOpenDriveSync && (
          <button
            type="button"
            onClick={onOpenDriveSync}
            className={`px-2.5 sm:px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer border ${
              driveSyncStatus?.isConnected
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'
            }`}
            title="Google Drive Database Sync & Backup"
          >
            <Cloud className={`w-3.5 h-3.5 ${driveSyncStatus?.isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
            <span className="hidden sm:inline">
              {driveSyncStatus?.isConnected ? 'Drive Synced' : 'Drive DB'}
            </span>
            {driveSyncStatus?.isConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            )}
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="p-2 sm:p-2.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
          title={darkMode ? 'ប្ដូរទៅ Light Mode' : 'ប្ដូរទៅ Dark Mode'}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 sm:p-2.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors relative cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            title="ការជូនដំណឹង (Notifications)"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full shadow-xs shadow-indigo-500 animate-pulse" />
            )}
          </button>

          {/* Notification Popover */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">ការជូនដំណឹង</h3>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setUnreadCount(0)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      សម្គាល់ថាបានអានទាំងអស់
                    </button>
                  )}
                </div>

                <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-start gap-3 border border-zinc-200/60 dark:border-zinc-700/50 cursor-pointer"
                    >
                      <div className="mt-0.5">
                        {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {n.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                        {n.type === 'info' && <Clock className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{n.title}</div>
                        <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">{n.description}</div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    បិទផ្ទាំង
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 sm:p-2.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
          title="ការកំណត់ (Settings)"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Avatar with dropdown */}
        <div className="relative ml-1">
          <input
            type="file"
            ref={navFileInputRef}
            onChange={handleNavAvatarUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="w-9 h-9 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xs overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500/40 transition-all flex items-center justify-center"
            aria-label="User profile menu"
          >
            <img
              src={displayAvatar}
              alt="រូបភាពគណនីអ្នកប្រើប្រាស់"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-3 z-50"
              >
                <div className="flex items-center gap-3 p-2.5 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="relative group shrink-0">
                    <img
                      src={displayAvatar}
                      alt="User"
                      className="w-10 h-10 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700"
                      referrerPolicy="no-referrer"
                    />
                    {userRole === 'admin' && (
                      <button
                        type="button"
                        onClick={() => navFileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="ប្តូររូបថត Admin"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{userName}</h4>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                      {userRole === 'admin' ? 'SYSTEM ADMIN' : 'CLASS TEACHER'}
                    </p>
                  </div>
                </div>

                <div className="py-2 space-y-1 text-xs">
                  {userRole === 'admin' && (
                    <button
                      type="button"
                      onClick={() => navFileInputRef.current?.click()}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 text-left font-bold transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-indigo-500" />
                      <span>ប្តូររូបថត Admin (Upload)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-left font-medium transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>ព័ត៌មានគណនី & ការកំណត់</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-left font-medium transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ចាកចេញ (Sign Out)</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
