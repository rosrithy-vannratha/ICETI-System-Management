import React from 'react';
import { Student, ClassRoom, UserRole } from '../types';
import { NavTab } from './Sidebar';
import {
  Users,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  Plus,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  students: Student[];
  classes: ClassRoom[];
  userRole: UserRole;
  userName: string;
  onNavigate: (tab: NavTab) => void;
  onOpenAddStudent: () => void;
  onOpenImportExcel?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  classes,
  userRole,
  userName,
  onNavigate,
  onOpenAddStudent,
  onOpenImportExcel
}) => {
  const totalStudents = students.length;
  const totalClasses = classes.length;

  const quickStats = [
    {
      id: 'stat-total-students',
      labelKhmer: 'សិស្សសរុបក្នុងសាលា',
      sublabel: 'ENROLLED STUDENTS',
      value: `${totalStudents}`,
      unit: 'នាក់',
      badge: '+4 ឆមាសនេះ',
      icon: Users,
      accent: 'indigo'
    },
    {
      id: 'stat-active-classes',
      labelKhmer: 'ថ្នាក់រៀនសកម្ម',
      sublabel: 'ACTIVE CLASSROOMS',
      value: `${totalClasses}`,
      unit: 'ថ្នាក់',
      badge: 'កម្រិត ១០-១២',
      icon: BookOpen,
      accent: 'emerald'
    },
    {
      id: 'stat-attendance-rate',
      labelKhmer: 'អត្រាវត្តមានថ្ងៃនេះ',
      sublabel: 'TODAY ATTENDANCE',
      value: '94.5',
      unit: '%',
      badge: '+2.1% ធៀបម្សិលមិញ',
      icon: TrendingUp,
      accent: 'teal'
    },
    {
      id: 'stat-absent-today',
      labelKhmer: 'សិស្សអវត្តមានថ្ងៃនេះ',
      sublabel: 'ABSENTEE COUNT',
      value: '12',
      unit: 'នាក់',
      badge: 'មានច្បាប់ ៨ / ឥតច្បាប់ ៤',
      icon: AlertCircle,
      accent: 'rose'
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1440px] mx-auto pb-16">
      {/* Top Bento Row: Hero Banner & Quick Metric */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Bento Hero Card (Spans 2 cols on desktop) */}
        <div className="lg:col-span-2 bg-zinc-900 dark:bg-[#121215] text-zinc-100 rounded-3xl p-7 sm:p-8 border border-zinc-800 shadow-xl relative overflow-hidden flex flex-col justify-between group">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-indigo-500/15 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800/80 border border-zinc-700/80 rounded-full text-[10px] font-bold tracking-widest text-zinc-300 uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SYSTEM / ACADEMIC OVERVIEW</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold">
                ឆ្នាំសិក្សា ២០២៦-២០២៧
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              សូមស្វាគមន៍, {userName}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl font-normal leading-relaxed">
              ទិដ្ឋភាពទូទៅនៃដំណើរការសិក្សា ស្ថិតិអវត្តមាន និងការកត់ត្រាវត្តមានសិស្សប្រចាំថ្ងៃនៅវិទ្យាស្ថានគរុកោសល្យភាសាចិន។
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-6 border-t border-zinc-800 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('attendance')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>កត់ត្រាវត្តមានឥឡូវនេះ</span>
              </button>
              {userRole === 'admin' && (
                <>
                  <button
                    type="button"
                    onClick={onOpenAddStudent}
                    className="px-4 py-2.5 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>បន្ថែមសិស្សថ្មី</span>
                  </button>
                  {onOpenImportExcel && (
                    <button
                      type="button"
                      onClick={onOpenImportExcel}
                      className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>នាំចូល Excel</span>
                    </button>
                  )}
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors group/link cursor-pointer"
            >
              <span>ពិនិត្យរបាយការណ៍សរុប</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Secondary Bento Feature Tile: Live Rate Card */}
        <div className="bg-white dark:bg-[#121215] rounded-3xl p-7 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              REAL-TIME ATTENDANCE
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                94.5%
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                ↑ +2.1%
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              សិស្សមានវត្តមានសរុប ៩៨ នាក់ លើសិស្សសរុប ១០៤ នាក់
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: '94.5%' }}
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400 dark:text-zinc-500 mt-2 font-medium">
              <span>អប្បបរមាគោលដៅ៖ 90%</span>
              <span className="text-emerald-500 font-bold">លើសគោលដៅ (+4.5%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid: 4 Quick KPI Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              whileHover={{ y: -3 }}
              className="bg-white dark:bg-[#121215] p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between relative group overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block">
                    {stat.sublabel}
                  </span>
                  <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                    {stat.labelKhmer}
                  </h4>
                </div>
                <div
                  className={`p-2.5 rounded-2xl transition-colors ${
                    stat.accent === 'indigo'
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                      : stat.accent === 'emerald'
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                      : stat.accent === 'teal'
                      ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20'
                      : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.unit}
                  </span>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.badge}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bento Grid: Classroom Attendance Matrix */}
      <div className="bg-white dark:bg-[#121215] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block mb-1">
              CLASSROOMS STATUS MATRIX
            </span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              ស្ថានភាពវត្តមានតាមថ្នាក់រៀនថ្ងៃនេះ
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              ជ្រើសរើសថ្នាក់ដើម្បីកត់ត្រាវត្តមាន ឬពិនិត្យព័ត៌មានលម្អិត
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('classes')}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>មើលគ្រប់ថ្នាក់</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls, idx) => {
            const rates = [96, 92, 95, 94, 91, 98];
            const rate = rates[idx % rates.length];
            return (
              <div
                key={cls.id}
                onClick={() => onNavigate('attendance')}
                className="p-5 rounded-3xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cls.nameKhmer}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{cls.teacherName}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                    {rate}%
                  </span>
                </div>

                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden my-3">
                  <div
                    style={{ width: `${rate}%` }}
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/60">
                  <span>សិស្សសរុប៖ <strong className="text-zinc-700 dark:text-zinc-200">{cls.totalStudents}</strong> នាក់</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    កត់ត្រា <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
