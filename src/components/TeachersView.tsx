import React, { useState, useMemo } from 'react';
import { Teacher, ClassRoom } from '../types';
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  BookOpen,
  CalendarCheck,
  Award,
  Filter,
  LayoutGrid,
  List,
  Download,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

interface TeachersViewProps {
  teachers: Teacher[];
  classes: ClassRoom[];
  onAddTeacher: () => void;
  onImportExcel?: () => void;
  onEditTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onNavigateToAttendance?: () => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  teachers,
  classes,
  onAddTeacher,
  onImportExcel,
  onEditTeacher,
  onDeleteTeacher,
  onNavigateToAttendance
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'leave' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [selectedTeacherForDetail, setSelectedTeacherForDetail] = useState<Teacher | null>(null);

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.fullNameKhmer.toLowerCase().includes(q) ||
        (t.fullNameEn && t.fullNameEn.toLowerCase().includes(q)) ||
        (t.chineseName && t.chineseName.toLowerCase().includes(q)) ||
        t.teacherCode.toLowerCase().includes(q) ||
        t.specialization.toLowerCase().includes(q) ||
        (t.phone && t.phone.includes(q));

      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [teachers, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = teachers.length;
    const active = teachers.filter((t) => t.status === 'active').length;
    const onLeave = teachers.filter((t) => t.status === 'leave').length;
    const mastersOrHigher = teachers.filter(
      (t) => t.degreeKhmer.includes('អនុបណ្ឌិត') || t.degreeKhmer.includes('បណ្ឌិត')
    ).length;
    return { total, active, onLeave, mastersOrHigher };
  }, [teachers]);

  const handleExportExcel = () => {
    const exportData = filteredTeachers.map((t, idx) => ({
      'ល.រ': idx + 1,
      'អត្តលេខ': t.teacherCode,
      'ឈ្មោះខ្មែរ': t.fullNameKhmer,
      'ឈ្មោះឡាតាំង': t.fullNameEn || '',
      'ឈ្មោះចិន': t.chineseName || '',
      'ភេទ': t.gender === 'M' ? 'ប្រុស' : 'ស្រី',
      'លេខទូរស័ព្ទ': t.phone || '',
      'អ៊ីមែល': t.email || '',
      'កម្រិតសញ្ញាបត្រ': t.degreeKhmer,
      'ឯកទេសបង្រៀន': t.specialization,
      'ស្ថានភាព': t.status === 'active' ? 'កំពុងបង្រៀន' : t.status === 'leave' ? 'សុំច្បាប់' : 'ផ្អាក',
      'ថ្ងៃចូលបម្រើការ': t.joinDate || '',
      'អាសយដ្ឋាន': t.address || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'បញ្ជីគ្រូបង្រៀន');
    XLSX.writeFile(wb, `CPI_Teachers_List_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getAssignedClassNames = (classIds?: string[]) => {
    if (!classIds || classIds.length === 0) return [];
    return classIds
      .map((id) => classes.find((c) => c.id === id)?.nameKhmer)
      .filter(Boolean) as string[];
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                គ្រប់គ្រងគ្រូបង្រៀន (Teachers)
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                បញ្ជីសាស្រ្តាចារ្យ និងគ្រូបង្រៀន វិទ្យាស្ថានគរុកោសល្យភាសាចិន
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {onImportExcel && (
            <button
              type="button"
              onClick={onImportExcel}
              className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Import Excel"
            >
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <span>នាំចូល Excel</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export Excel"
          >
            <Download className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          {onNavigateToAttendance && (
            <button
              type="button"
              onClick={onNavigateToAttendance}
              className="px-3.5 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>វត្តមានគ្រូ</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAddTeacher}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>បន្ថែមគ្រូបង្រៀន (Add Teacher)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/40 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">គ្រូបង្រៀនសរុប</p>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {stats.total} <span className="text-xs font-semibold text-zinc-400">នាក់</span>
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">កំពុងបង្រៀន (Active)</p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.active} <span className="text-xs font-semibold text-zinc-400">នាក់</span>
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/40 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">សុំច្បាប់ (On Leave)</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.onLeave} <span className="text-xs font-semibold text-zinc-400">នាក់</span>
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/40 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">អនុបណ្ឌិត & បណ្ឌិត</p>
            <h3 className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
              {stats.mastersOrHigher} <span className="text-xs font-semibold text-zinc-400">រូប</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកឈ្មោះ អត្តលេខ ឬឯកទេស..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-zinc-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              ទាំងអស់ ({teachers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              កំពុងបង្រៀន
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('leave')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'leave'
                  ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              សុំច្បាប់
            </button>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500'
              }`}
              title="Grid Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Teachers Content */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-12 text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-200 dark:border-indigo-800/50">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            រកមិនឃើញគ្រូបង្រៀននោះឡើយ
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-sm mx-auto">
            សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬបន្ថែមគ្រូបង្រៀនថ្មីទៅក្នុងប្រព័ន្ធ
          </p>
          <button
            type="button"
            onClick={onAddTeacher}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>បន្ថែមគ្រូបង្រៀនឥឡូវនេះ</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => {
            const assignedNames = getAssignedClassNames(teacher.assignedClasses);
            return (
              <motion.div
                key={teacher.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={teacher.fullNameKhmer}
                          className="w-13 h-13 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-xs group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                            teacher.status === 'active'
                              ? 'bg-emerald-500'
                              : teacher.status === 'leave'
                              ? 'bg-amber-500'
                              : 'bg-zinc-400'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            {teacher.teacherCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              teacher.status === 'active'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : teacher.status === 'leave'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                          >
                            {teacher.status === 'active' ? 'កំពុងបង្រៀន' : teacher.status === 'leave' ? 'សុំច្បាប់' : 'ផ្អាក'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                          {teacher.gender === 'M' ? 'លោកគ្រូ ' : 'អ្នកគ្រូ '}
                          {teacher.fullNameKhmer}
                        </h4>
                        {(teacher.chineseName || teacher.fullNameEn) && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {teacher.chineseName} {teacher.fullNameEn ? `(${teacher.fullNameEn})` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTeacherForDetail(teacher)}
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="មើលព័ត៌មានលម្អិត"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Specialization & Degree */}
                  <div className="space-y-2 mb-3.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{teacher.degreeKhmer}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{teacher.specialization}</span>
                    </div>

                    {/* Assigned Classes */}
                    {assignedNames.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] text-zinc-400 font-medium">ថ្នាក់៖</span>
                        {assignedNames.map((name, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contacts */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl px-3 border border-zinc-100 dark:border-zinc-800 mb-3.5">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 truncate">
                      <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{teacher.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 truncate">
                      <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{teacher.email || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => onEditTeacher(teacher)}
                    className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-indigo-600 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>កែប្រែ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherToDelete(teacher)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>លុប</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <th className="py-3.5 px-4">អត្តលេខ</th>
                  <th className="py-3.5 px-4">ឈ្មោះគ្រូបង្រៀន</th>
                  <th className="py-3.5 px-4">ឈ្មោះចិន / ឡាតាំង</th>
                  <th className="py-3.5 px-4">កម្រិតសញ្ញាបត្រ</th>
                  <th className="py-3.5 px-4">ឯកទេស</th>
                  <th className="py-3.5 px-4">ថ្នាក់បង្រៀន</th>
                  <th className="py-3.5 px-4">ទូរស័ព្ទ</th>
                  <th className="py-3.5 px-4">ស្ថានភាព</th>
                  <th className="py-3.5 px-4 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {filteredTeachers.map((teacher) => {
                  const assignedNames = getAssignedClassNames(teacher.assignedClasses);
                  return (
                    <tr
                      key={teacher.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-zinc-600 dark:text-zinc-300">
                        {teacher.teacherCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={teacher.fullNameKhmer}
                            className="w-8 h-8 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {teacher.fullNameKhmer}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-500">
                        {teacher.chineseName || teacher.fullNameEn || '-'}
                      </td>
                      <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 font-medium">
                        {teacher.degreeKhmer}
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                        {teacher.specialization}
                      </td>
                      <td className="py-3 px-4">
                        {assignedNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedNames.map((name, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                        {teacher.phone || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            teacher.status === 'active'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : teacher.status === 'leave'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          {teacher.status === 'active' ? 'កំពុងបង្រៀន' : teacher.status === 'leave' ? 'សុំច្បាប់' : 'ផ្អាក'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEditTeacher(teacher)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="កែប្រែ"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTeacherToDelete(teacher)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="លុប"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {teacherToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  តើអ្នកប្រាកដជាចង់លុបគ្រូបង្រៀននេះមែនទេ?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  អ្នកនឹងលុបលោកគ្រូ/អ្នកគ្រូ{' '}
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {teacherToDelete.fullNameKhmer} ({teacherToDelete.teacherCode})
                  </span>{' '}
                  ចេញពីប្រព័ន្ធ។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTeacherToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-bold text-zinc-700 dark:text-zinc-300"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteTeacher(teacherToDelete.id);
                    setTeacherToDelete(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-500/20"
                >
                  លុបចេញ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Teacher Detail Modal */}
      <AnimatePresence>
        {selectedTeacherForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <img
                  src={selectedTeacherForDetail.avatarUrl}
                  alt={selectedTeacherForDetail.fullNameKhmer}
                  className="w-18 h-18 rounded-2xl object-cover border-2 border-indigo-500/30"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    {selectedTeacherForDetail.teacherCode}
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                    {selectedTeacherForDetail.gender === 'M' ? 'លោកគ្រូ ' : 'អ្នកគ្រូ '}
                    {selectedTeacherForDetail.fullNameKhmer}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {selectedTeacherForDetail.chineseName} {selectedTeacherForDetail.fullNameEn ? `• ${selectedTeacherForDetail.fullNameEn}` : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-zinc-500">កម្រិតសញ្ញាបត្រ៖</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {selectedTeacherForDetail.degreeKhmer}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-zinc-500">ឯកទេសបង្រៀន៖</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {selectedTeacherForDetail.specialization}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-zinc-500">លេខទូរស័ព្ទ៖</span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {selectedTeacherForDetail.phone || 'មិនមាន'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-zinc-500">អ៊ីមែល៖</span>
                  <span className="font-mono text-zinc-800 dark:text-zinc-200">
                    {selectedTeacherForDetail.email || 'មិនមាន'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-zinc-500">ថ្ងៃចូលបម្រើការ៖</span>
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {selectedTeacherForDetail.joinDate || 'មិនបានបញ្ជាក់'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-zinc-500">អាសយដ្ឋាន៖</span>
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {selectedTeacherForDetail.address || 'មិនមាន'}
                  </span>
                </div>
                {selectedTeacherForDetail.notes && (
                  <div className="pt-2 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-2xl">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">កំណត់សម្គាល់៖ </span>
                    {selectedTeacherForDetail.notes}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTeacherForDetail(null)}
                  className="px-5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                >
                  បិទផ្ទាំង
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
