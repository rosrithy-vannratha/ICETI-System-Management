import React from 'react';
import { UserRole } from '../types';
import { APP_ASSETS } from '../data/mockData';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  BarChart3,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Award,
  Layers
} from 'lucide-react';

export type NavTab = 'dashboard' | 'students' | 'teachers' | 'classes' | 'majors' | 'terms' | 'attendance' | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  userName: string;
  adminAvatar?: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  userName,
  adminAvatar,
  onLogout
}) => {
  const displayAvatar = userRole === 'admin' ? (adminAvatar || APP_ASSETS.userAvatar) : APP_ASSETS.teacherAvatar;
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      labelKhmer: 'ផ្ទាំងគ្រប់គ្រង',
      icon: LayoutDashboard,
      roles: ['admin', 'teacher']
    },
    {
      id: 'students' as NavTab,
      labelKhmer: 'សិស្ស',
      icon: Users,
      roles: ['admin', 'teacher']
    },
    {
      id: 'teachers' as NavTab,
      labelKhmer: 'គ្រូបង្រៀន',
      icon: GraduationCap,
      roles: ['admin', 'teacher']
    },
    {
      id: 'classes' as NavTab,
      labelKhmer: 'ថ្នាក់រៀន',
      icon: BookOpen,
      roles: ['admin', 'teacher']
    },
    {
      id: 'majors' as NavTab,
      labelKhmer: 'ជំនាញសិក្សា',
      icon: Award,
      roles: ['admin', 'teacher']
    },
    {
      id: 'terms' as NavTab,
      labelKhmer: 'វគ្គ & ជំនាន់',
      icon: Layers,
      roles: ['admin', 'teacher']
    },
    {
      id: 'attendance' as NavTab,
      labelKhmer: 'វត្តមាន',
      icon: CalendarCheck,
      roles: ['admin', 'teacher']
    },
    {
      id: 'reports' as NavTab,
      labelKhmer: 'របាយការណ៍',
      icon: BarChart3,
      roles: ['admin', 'teacher']
    }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-[260px] h-screen fixed left-0 top-0 bg-white/80 dark:bg-[#0c0c0e]/95 backdrop-blur-xl border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex-col py-6 z-50 select-none">
        {/* Brand Header */}
        <div className="px-5 pb-5 mb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-1.5 border border-zinc-200 dark:border-zinc-800 shadow-xs relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <img
              src={APP_ASSETS.schoolLogo}
              alt="School Logo"
              className="w-full h-full object-contain rounded-xl relative z-10"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
                វិ.គរុកោសល្យ<span className="text-indigo-600 dark:text-indigo-400">ភាសាចិន</span>
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-0.5">
              ប្រព័ន្ធគ្រប់គ្រងនិស្សិត & វត្តមាន
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <ul className="flex flex-col gap-1.5 px-3 flex-grow">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-150 cursor-pointer group relative ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-800/90 dark:text-zinc-100 dark:border dark:border-zinc-700 shadow-sm font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-indigo-600 dark:bg-indigo-500/20 text-white dark:text-indigo-300'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.labelKhmer}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-xs shadow-indigo-400" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* User Card & Logout */}
        <div className="p-3 mx-3 bg-zinc-50 dark:bg-zinc-900/90 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none opacity-50" />
          <div className="flex items-center gap-2.5 mb-2.5 relative z-10">
            <img
              src={displayAvatar}
              alt="User Avatar"
              className="w-8 h-8 rounded-xl object-cover border border-zinc-300 dark:border-zinc-700 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {userName}
              </p>
              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                {userRole === 'admin' ? 'ADMINISTRATOR' : 'TEACHER / គ្រូ'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/50 dark:border-rose-900/40 transition-colors relative z-10 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ចាកចេញ (Logout)</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-lg border-t border-zinc-200/80 dark:border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-zinc-700' : ''
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] font-medium leading-tight mt-0.5">{item.labelKhmer}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
