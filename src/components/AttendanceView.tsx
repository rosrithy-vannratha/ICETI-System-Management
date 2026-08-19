import React, { useState, useEffect, useMemo } from 'react';
import { Student, ClassRoom, AttendanceStatus } from '../types';
import {
  Save,
  CheckCheck,
  Check,
  FileText,
  AlertTriangle,
  Clock,
  UserCheck,
  RotateCcw,
  Sparkles,
  Search,
  Calendar,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  Filter,
  Eye,
  X,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportDailyAttendanceToExcel, exportMonthlyAttendanceToExcel } from '../utils/exportUtils';
import { AttendanceWarningModal } from './AttendanceWarningModal';

interface AttendanceViewProps {
  students: Student[];
  classes: ClassRoom[];
  onSaveAttendance: (
    classId: string,
    date: string,
    records: Record<string, { status: AttendanceStatus; note?: string }>
  ) => void;
  savedAttendances: Record<string, Record<string, { status: AttendanceStatus; note?: string }>>;
  onOpenStudentModal?: (student: Student) => void;
}

type ViewMode = 'daily' | 'monthly' | 'yearly';

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  classes,
  onSaveAttendance,
  savedAttendances,
  onOpenStudentModal
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('c-12a');
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  
  // Date states
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-18');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 1-12
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2026-2027');

  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; note?: string }>
  >({});
  const [showToast, setShowToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeNoteStudent, setActiveNoteStudent] = useState<Student | null>(null);
  const [noteText, setNoteText] = useState('');
  const [filterAtRiskOnly, setFilterAtRiskOnly] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  // Filter students by selected class
  const classStudents = useMemo(
    () => students.filter((s) => s.classId === selectedClassId),
    [students, selectedClassId]
  );

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Key for daily local record lookups: `${selectedClassId}_${selectedDate}`
  const storageKey = `${selectedClassId}_${selectedDate}`;

  const studentAbsenceStats = useMemo(() => {
    // Calculate dynamically from savedAttendances for each student
    const result: Record<
      string,
      { absentCount: number; permissionCount: number; lateCount: number; datesMissed: string[] }
    > = {};

    students.forEach((s) => {
      let absent = 0;
      const dates: string[] = [];
      let permission = 0;
      let late = 0;

      // Count across all savedAttendances
      Object.entries(savedAttendances).forEach(([key, records]) => {
        if (key.startsWith(s.classId)) {
          const date = key.split('_')[1] || '';
          const rec = records[s.id];
          if (rec?.status === 'absent' && !dates.includes(date)) {
            absent += 1;
            dates.push(date);
          } else if (rec?.status === 'permission') {
            permission += 1;
          } else if (rec?.status === 'late') {
            late += 1;
          }
        }
      });

      result[s.id] = {
        absentCount: absent,
        permissionCount: permission,
        lateCount: late,
        datesMissed: dates
      };
    });

    return result;
  }, [students, savedAttendances]);

  // List of students with > 5 absences (or >= 5)
  const atRiskStudents = useMemo(() => {
    return students
      .filter((s) => {
        const stats = studentAbsenceStats[s.id];
        return stats && stats.absentCount >= 5;
      })
      .map((s) => ({
        student: s,
        absentCount: studentAbsenceStats[s.id].absentCount,
        permissionCount: studentAbsenceStats[s.id].permissionCount,
        lateCount: studentAbsenceStats[s.id].lateCount,
        datesMissed: studentAbsenceStats[s.id].datesMissed
      }));
  }, [students, studentAbsenceStats]);

  // Filtered class students list
  const filteredStudents = useMemo(() => {
    return classStudents.filter((s) => {
      const matchesSearch =
        s.fullNameKhmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.fullNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.chineseName && s.chineseName.toLowerCase().includes(searchTerm.toLowerCase()));

      const isAtRisk = (studentAbsenceStats[s.id]?.absentCount || 0) >= 5;
      const matchesRisk = !filterAtRiskOnly || isAtRisk;

      return matchesSearch && matchesRisk;
    });
  }, [classStudents, searchTerm, filterAtRiskOnly, studentAbsenceStats]);

  // Initialize or load attendance state
  useEffect(() => {
    if (savedAttendances[storageKey]) {
      setAttendanceMap(savedAttendances[storageKey]);
    } else {
      const initial: Record<string, { status: AttendanceStatus; note?: string }> = {};
      classStudents.forEach((student, index) => {
        if (index === 0) initial[student.id] = { status: 'present' };
        else if (index === 1) initial[student.id] = { status: 'absent' };
        else if (index === 2) initial[student.id] = { status: 'permission' };
        else initial[student.id] = { status: 'present' };
      });
      setAttendanceMap(initial);
    }
  }, [selectedClassId, selectedDate, savedAttendances, classStudents]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; note?: string }> = {};
    classStudents.forEach((student) => {
      updated[student.id] = {
        ...attendanceMap[student.id],
        status: 'present'
      };
    });
    setAttendanceMap(updated);
  };

  const handleResetAttendance = () => {
    const updated: Record<string, { status: AttendanceStatus; note?: string }> = {};
    classStudents.forEach((student) => {
      updated[student.id] = {
        ...attendanceMap[student.id],
        status: 'present'
      };
    });
    setAttendanceMap(updated);
  };

  const handleSave = () => {
    onSaveAttendance(selectedClassId, selectedDate, attendanceMap);
    setShowToast(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
      });
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const counts = {
    present: classStudents.filter((s) => attendanceMap[s.id]?.status === 'present').length,
    permission: classStudents.filter((s) => attendanceMap[s.id]?.status === 'permission').length,
    absent: classStudents.filter((s) => attendanceMap[s.id]?.status === 'absent').length,
    late: classStudents.filter((s) => attendanceMap[s.id]?.status === 'late').length
  };

  // Export handlers
  const handleExportDailyExcel = () => {
    exportDailyAttendanceToExcel(filteredStudents, attendanceMap, {
      date: selectedDate,
      className: selectedClass?.nameKhmer || 'ថ្នាក់រៀន',
      teacherName: selectedClass?.teacherName
    });
  };

  const daysInSelectedMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const handleExportMonthlyExcel = () => {
    exportMonthlyAttendanceToExcel(classStudents, {
      year: selectedYear,
      month: selectedMonth,
      daysInMonth: daysInSelectedMonth,
      className: selectedClass?.nameKhmer || 'ថ្នាក់រៀន',
      getStudentStatus: (studentId, day) => {
        const formattedDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const key = `${selectedClassId}_${formattedDate}`;
        const saved = savedAttendances[key]?.[studentId];
        if (saved) return saved;
        // Mock deterministic status
        const isSunOrSat = new Date(selectedYear, selectedMonth - 1, day).getDay() === 0;
        if (isSunOrSat) return { status: 'present' };
        if (day === 5 && studentId === 's-006') return { status: 'absent' };
        if (day === 9 && studentId === 's-006') return { status: 'absent' };
        if (day === 14 && studentId === 's-006') return { status: 'absent' };
        if (day === 18 && studentId === 's-006') return { status: 'absent' };
        if (day === 22 && studentId === 's-006') return { status: 'absent' };
        if (day === 25 && studentId === 's-006') return { status: 'absent' };
        return { status: 'present' };
      },
      getStudentStats: (studentId) => {
        const stats = studentAbsenceStats[studentId] || { absentCount: 0, permissionCount: 1, lateCount: 0 };
        const total = 22;
        const present = Math.max(0, total - stats.absentCount - stats.permissionCount);
        const rate = Math.round((present / total) * 100);
        return {
          present,
          absent: stats.absentCount,
          permission: stats.permissionCount,
          late: stats.lateCount,
          rate
        };
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const khmerMonths = [
    { value: 1, name: 'មករា (January)' },
    { value: 2, name: 'កុម្ភៈ (February)' },
    { value: 3, name: 'មីនា (March)' },
    { value: 4, name: 'មេសា (April)' },
    { value: 5, name: 'ឧសភា (May)' },
    { value: 6, name: 'មិថុនា (June)' },
    { value: 7, name: 'កក្កដា (July)' },
    { value: 8, name: 'សីហា (August)' },
    { value: 9, name: 'កញ្ញា (September)' },
    { value: 10, name: 'តុលា (October)' },
    { value: 11, name: 'វិច្ឆិកា (November)' },
    { value: 12, name: 'ធ្នូ (December)' }
  ];

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1400px] mx-auto pb-16">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 text-zinc-100 px-5 py-4 rounded-3xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-bounce">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Check className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">រក្សាទុកបានជោគជ័យ!</div>
            <div className="text-xs text-zinc-400">
              វត្តមានសម្រាប់ {selectedClass?.nameKhmer} ({selectedDate}) ត្រូវបានកត់ត្រាទុក។
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ HIGH PRIORITY ATTENDANCE WARNING ALERT BANNER (> 5 Absences) */}
      {atRiskStudents.length > 0 && (
        <div className="bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-amber-500/15 border-2 border-rose-500/40 dark:border-rose-500/50 p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-sm animate-pulse shrink-0">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-md">
                  ការប្រកាសអាសន្នវត្តមាន
                </span>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  អវត្តមានលើសពី ៥ ដង
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                មាននិស្សិតសរុប <span className="text-rose-600 dark:text-rose-400 underline">{atRiskStudents.length} នាក់</span> បានអវត្តមានលើសពី ៥ ដង (ហានិភ័យធ្លាក់វត្តមាន ឬដកសិទ្ធិប្រឡង)!
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                សូមពិនិត្យ និងចេញលិខិតជូនដំណឹងជាបន្ទាន់ទៅកាន់អាណាព្យាបាលសិស្ស។
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setFilterAtRiskOnly(!filterAtRiskOnly)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterAtRiskOnly
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{filterAtRiskOnly ? 'បង្ហាញទាំងអស់វិញ' : 'មើលសិស្សហានិភ័យ'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWarningModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ចេញលិខិតព្រមាន ({atRiskStudents.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Bento Header & Time Switcher (Daily / Monthly / Yearly) */}
      <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              ATTENDANCE MANAGEMENT
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              វិ.គរុកោសល្យភាសាចិន
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            កត់ត្រា និងពិនិត្យមើលវត្តមានសិស្ស
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            ពិនិត្យតាមដានវត្តមានតាម <strong>ថ្ងៃ ខែ ឆ្នាំ</strong> និងទាញយកជារបាយការណ៍ Excel / Print
          </p>
        </div>

        {/* View Mode Switcher Pill */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 self-start lg:self-center">
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            📅 តាមថ្ងៃ (Daily)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'monthly'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            📊 តាមខែ (Monthly)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('yearly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'yearly'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            🏛️ តាមឆ្នាំ (Yearly)
          </button>
        </div>
      </div>

      {/* Classroom & Time Filter Controls Bar */}
      <div className="bg-white dark:bg-[#121215] p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Class Select */}
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
              ថ្នាក់រៀន (CLASS)
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full sm:w-48 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500/30 outline-none cursor-pointer"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.nameKhmer}
                </option>
              ))}
            </select>
          </div>

          {/* Time Picker based on ViewMode */}
          {viewMode === 'daily' && (
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                កាលបរិច្ឆេទ (DATE)
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-44 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/30 outline-none"
              />
            </div>
          )}

          {viewMode === 'monthly' && (
            <>
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  ខែសិក្សា (MONTH)
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full sm:w-44 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/30 outline-none cursor-pointer"
                >
                  {khmerMonths.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  ឆ្នាំ (YEAR)
                </label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  min={2020}
                  max={2030}
                  className="w-28 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/30 outline-none"
                />
              </div>
            </>
          )}

          {viewMode === 'yearly' && (
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                ឆ្នាំសិក្សា (ACADEMIC YEAR)
              </label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="w-full sm:w-44 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/30 outline-none cursor-pointer"
              >
                <option value="2026-2027">2026 - 2027</option>
                <option value="2025-2026">2025 - 2026</option>
                <option value="2024-2025">2024 - 2025</option>
              </select>
            </div>
          )}

          {/* Search Box */}
          <div className="w-full sm:w-auto min-w-[200px]">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
              ស្វែងរកសិស្ស
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ឈ្មោះ ឬអត្តលេខ..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>
        </div>

        {/* Export & Download Buttons Group */}
        <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
          {viewMode === 'daily' ? (
            <button
              type="button"
              onClick={handleExportDailyExcel}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="ទាញយកជា Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ទាញយក Excel ថ្ងៃនេះ</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleExportMonthlyExcel}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="ទាញយកតារាងវត្តមានប្រចាំខែជា Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ទាញយក Excel ប្រចាំខែ</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="បោះពុម្ពបញ្ជីវត្តមាន"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ព (Print)</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Bento Bar (In Daily Mode) */}
      {viewMode === 'daily' && (
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-zinc-900 dark:bg-[#121215] p-4 sm:p-5 rounded-3xl border border-zinc-800 text-zinc-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center gap-2">
              <span className="text-[10px] uppercase text-zinc-400 font-bold">TOTAL</span>
              <span className="text-white font-bold">{classStudents.length} នាក់</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>វត្តមាន: {counts.present}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>មានច្បាប់: {counts.permission}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>ឥតច្បាប់: {counts.absent}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>យឺត: {counts.late}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleResetAttendance}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>កំណត់ឡើងវិញ</span>
            </button>

            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="bg-indigo-600 hover:bg-indigo-500 text-white transition-all px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 stroke-[2.5]" />
              <span>វត្តមានទាំងអស់</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 1: DAILY ATTENDANCE TABLE */}
      {viewMode === 'daily' && (
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sticky top-0 z-10">
            <div className="col-span-1">ល.រ (NO)</div>
            <div className="col-span-4">ឈ្មោះសិស្ស (STUDENT NAME)</div>
            <div className="col-span-2">អត្តលេខ (CODE)</div>
            <div className="col-span-5 text-center">ស្ថានភាពវត្តមានថ្ងៃនេះ</div>
          </div>

          {/* Student Rows */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 dark:text-zinc-500 text-sm">
                ពុំមានទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ។
              </div>
            ) : (
              filteredStudents.map((student, index) => {
                const currentStatus = attendanceMap[student.id]?.status || 'present';
                const note = attendanceMap[student.id]?.note;
                const isEven = index % 2 === 1;
                const absences = studentAbsenceStats[student.id]?.absentCount || 0;
                const isAtRisk = absences >= 5;

                return (
                  <div
                    key={student.id}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 items-center transition-colors ${
                      isAtRisk
                        ? 'bg-rose-50/30 dark:bg-rose-950/20'
                        : isEven
                        ? 'bg-zinc-50/40 dark:bg-zinc-900/30'
                        : 'bg-white dark:bg-[#121215]'
                    } hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50`}
                  >
                    {/* Serial No. */}
                    <div className="hidden md:block col-span-1 text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500">
                      #{String(index + 1).padStart(2, '0')}
                    </div>

                    {/* Student Avatar + Name */}
                    <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-3">
                      <div
                        onClick={() => onOpenStudentModal && onOpenStudentModal(student)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="relative">
                          <img
                            src={student.avatarUrl}
                            alt={student.fullNameKhmer}
                            className="w-10 h-10 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-xs group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          {isAtRisk && (
                            <span
                              className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-ping"
                              title="អវត្តមានលើស ៥ ដង"
                            />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {student.fullNameKhmer}
                            </span>
                            {student.chineseName && (
                              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md font-sans">
                                {student.chineseName}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="font-mono">{student.studentCode}</span>
                            {isAtRisk ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsWarningModalOpen(true);
                                }}
                                className="px-1.5 py-0.2 rounded-md bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs hover:bg-rose-500 cursor-pointer"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                <span>អវត្តមាន {absences} ដង (លើសកម្រិត)</span>
                              </button>
                            ) : (
                              student.major && (
                                <span className="text-[10px] text-indigo-500 font-medium hidden sm:inline">
                                  · {student.major}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Note badge */}
                      {note && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveNoteStudent(student);
                            setNoteText(note || '');
                          }}
                          className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-bold flex items-center gap-1 border border-amber-500/20 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>កំណត់ចំណាំ</span>
                        </button>
                      )}
                    </div>

                    {/* Student Code (Desktop) */}
                    <div className="hidden md:block col-span-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 font-mono text-[11px]">
                        {student.studentCode}
                      </span>
                    </div>

                    {/* Attendance Controls */}
                    <div className="md:col-span-5 flex flex-wrap md:flex-nowrap justify-center gap-1.5 sm:gap-2 mt-1 md:mt-0">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`flex-1 md:flex-none px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer text-center ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs scale-100 ring-2 ring-emerald-500/40'
                            : 'border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        វត្តមាន
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleStatusChange(student.id, 'permission');
                          if (!note) {
                            setActiveNoteStudent(student);
                            setNoteText('');
                          }
                        }}
                        className={`flex-1 md:flex-none px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer text-center ${
                          currentStatus === 'permission'
                            ? 'bg-indigo-600 text-white shadow-xs scale-100 ring-2 ring-indigo-500/40'
                            : 'border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        មានច្បាប់
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`flex-1 md:flex-none px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer text-center ${
                          currentStatus === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs scale-100 ring-2 ring-rose-500/40'
                            : 'border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        ឥតច្បាប់
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`flex-1 md:flex-none px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer text-center ${
                          currentStatus === 'late'
                            ? 'bg-amber-600 text-white shadow-xs scale-100 ring-2 ring-amber-500/40'
                            : 'border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        យឺត
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODE 2: MONTHLY MATRIX TABLE */}
      {viewMode === 'monthly' && (
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xs p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                តារាងវត្តមានប្រចាំខែ {khmerMonths.find((m) => m.value === selectedMonth)?.name} ឆ្នាំ {selectedYear}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                ថ្នាក់៖ <strong>{selectedClass?.nameKhmer}</strong> | សរុប {classStudents.length} នាក់
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg">✓ វត្តមាន</span>
              <span className="px-2 py-1 bg-rose-500/10 text-rose-600 rounded-lg">✗ ឥតច្បាប់</span>
              <span className="px-2 py-1 bg-indigo-500/10 text-indigo-600 rounded-lg">P មានច្បាប់</span>
              <span className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg">L យឺត</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                  <th className="p-3 sticky left-0 bg-zinc-50 dark:bg-zinc-900 z-10 w-10">ល.រ</th>
                  <th className="p-3 sticky left-10 bg-zinc-50 dark:bg-zinc-900 z-10 min-w-[160px]">ឈ្មោះសិស្ស</th>
                  {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((day) => (
                    <th key={day} className="p-2 text-center font-mono w-7">
                      {day}
                    </th>
                  ))}
                  <th className="p-3 text-center bg-emerald-500/5 text-emerald-600 font-bold">វត្តមាន</th>
                  <th className="p-3 text-center bg-rose-500/5 text-rose-600 font-bold">ឥតច្បាប់</th>
                  <th className="p-3 text-center bg-indigo-500/5 text-indigo-600 font-bold">ច្បាប់</th>
                  <th className="p-3 text-center font-bold">អត្រា%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {classStudents.map((s, idx) => {
                  const stats = studentAbsenceStats[s.id] || { absentCount: 0, permissionCount: 1, lateCount: 0 };
                  const total = 22;
                  const present = Math.max(0, total - stats.absentCount - stats.permissionCount);
                  const rate = Math.round((present / total) * 100);
                  const isAtRisk = stats.absentCount >= 5;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                        isAtRisk ? 'bg-rose-50/20 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="p-3 sticky left-0 bg-white dark:bg-[#121215] font-mono text-zinc-400">
                        {idx + 1}
                      </td>
                      <td className="p-3 sticky left-10 bg-white dark:bg-[#121215] font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{s.fullNameKhmer}</span>
                          {isAtRisk && (
                            <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded text-[9px] font-bold">
                              {'> 5'}
                            </span>
                          )}
                        </div>
                      </td>
                      {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((day) => {
                        const isSunday = new Date(selectedYear, selectedMonth - 1, day).getDay() === 0;
                        const isAbsentDay =
                          (day === 5 || day === 9 || day === 14 || day === 18 || day === 22 || day === 25) &&
                          s.id === 's-006';

                        return (
                          <td
                            key={day}
                            className={`p-1 text-center font-mono text-[11px] ${
                              isSunday
                                ? 'bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-400'
                                : isAbsentDay
                                ? 'bg-rose-500/20 text-rose-600 font-bold'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {isSunday ? '—' : isAbsentDay ? '✗' : '✓'}
                          </td>
                        );
                      })}
                      <td className="p-2 text-center font-bold text-emerald-600 font-mono">{present}</td>
                      <td className={`p-2 text-center font-bold font-mono ${stats.absentCount >= 5 ? 'text-rose-600 underline' : 'text-zinc-500'}`}>
                        {stats.absentCount}
                      </td>
                      <td className="p-2 text-center font-mono text-indigo-500">{stats.permissionCount}</td>
                      <td className="p-2 text-center font-bold font-mono text-zinc-900 dark:text-zinc-100">
                        {rate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 3: YEARLY ATTENDANCE SUMMARY */}
      {viewMode === 'yearly' && (
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                ស្ថិតិវត្តមានប្រចាំឆ្នាំសិក្សា {selectedAcademicYear}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                ថ្នាក់៖ <strong>{selectedClass?.nameKhmer}</strong> · សាស្ត្រាចារ្យ៖ {selectedClass?.teacherName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">មធ្យមភាគវត្តមានសរុប</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">94.2%</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">សិស្សវត្តមានទៀងទាត់ (100%)</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">18 នាក់</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
              <span className="text-[10px] font-bold text-rose-600 uppercase">សិស្សអវត្តមាន {'>'} 5 ដង</span>
              <div className="text-2xl font-black text-rose-600 mt-1">{atRiskStudents.length} នាក់</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">សរុបថ្ងៃសិក្សា</span>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">184 ថ្ងៃ</div>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {classStudents.map((s, idx) => {
              const stats = studentAbsenceStats[s.id] || { absentCount: 0, permissionCount: 0 };
              const rate = Math.max(70, 100 - stats.absentCount * 4);
              return (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-zinc-400 w-6">#{idx + 1}</span>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{s.fullNameKhmer} ({s.fullNameEn})</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{s.studentCode} · {s.major}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-rose-600">អវត្តមាន៖ {stats.absentCount} ដង</span>
                    <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-mono">{rate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Button Floating Area (Daily Mode) */}
      {viewMode === 'daily' && (
        <div className="flex justify-end items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-7 sm:px-9 py-3 sm:py-3.5 rounded-3xl font-bold text-sm sm:text-base shadow-lg hover:shadow-indigo-500/25 active:scale-95 transition-all duration-150 flex items-center gap-2.5 cursor-pointer"
          >
            <Save className="w-5 h-5 stroke-[2.2]" />
            <span>រក្សាទុកវត្តមាន</span>
          </button>
        </div>
      )}

      {/* Note / Reason Modal */}
      {activeNoteStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              មូលហេតុ ឬកំណត់ចំណាំវត្តមាន
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              សិស្ស៖ <strong className="text-zinc-900 dark:text-zinc-200">{activeNoteStudent.fullNameKhmer}</strong> ({activeNoteStudent.studentCode})
            </p>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="បញ្ចូលមូលហេតុ (ឧ. ឈឺក្បាល, ជាប់រវល់គ្រួសារ...)"
              className="w-full h-24 p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 mb-4 resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveNoteStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeNoteStudent) {
                    setAttendanceMap((prev) => ({
                      ...prev,
                      [activeNoteStudent.id]: {
                        ...prev[activeNoteStudent.id],
                        note: noteText.trim()
                      }
                    }));
                  }
                  setActiveNoteStudent(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 cursor-pointer"
              >
                រក្សាទុកចំណាំ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Warning & Action Modal */}
      <AttendanceWarningModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        atRiskStudents={atRiskStudents}
        onOpenStudentModal={onOpenStudentModal}
      />
    </div>
  );
};
