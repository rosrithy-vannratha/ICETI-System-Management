import React, { useState, useEffect, useMemo } from 'react';
import {
  UsersRound,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileSpreadsheet,
  Save,
  CheckCheck,
  RotateCcw,
  Sparkles,
  UserCheck,
  Filter,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { AttendanceStatus, ClassRoom, TeacherAttendanceRecord } from '../types';
import { teacherAttendanceDatabase } from '../service/database';

interface TeacherAttendanceViewProps {
  classes: ClassRoom[];
  recordedBy?: string;
}

interface TeacherInfo {
  id: string;
  nameKhmer: string;
  nameEn?: string;
  nameChinese?: string;
  subjectKhmer: string;
  phone?: string;
  assignedClass?: string;
}

const DEFAULT_TEACHERS: TeacherInfo[] = [
  { id: 't-1', nameKhmer: 'លោកគ្រូ សុខ ចាន់ថា', nameEn: 'Sok Chantha', nameChinese: '苏占塔', subjectKhmer: 'គរុកោសល្យទូទៅ', phone: '012 345 678', assignedClass: 'គរុកោសល្យ ឆ្នាំទី ៤ - ក' },
  { id: 't-2', nameKhmer: 'អ្នកគ្រូ គង់ សុភាព', nameEn: 'Kong Sopheap', nameChinese: '孔素萍', subjectKhmer: 'វេយ្យាករណ៍ចិនកម្រិតខ្ពស់', phone: '098 765 432', assignedClass: 'គរុកោសល្យ ឆ្នាំទី ៤ - ខ' },
  { id: 't-3', nameKhmer: 'លោកគ្រូ ហេង ពិសិដ្ឋ', nameEn: 'Heng Piseth', nameChinese: '王必胜', subjectKhmer: 'វិធីសាស្ត្របង្រៀនភាសាចិន', phone: '088 123 456', assignedClass: 'ភាសាចិនពាណិជ្ជកម្ម ឆ្នាំទី ៣' },
  { id: 't-4', nameKhmer: 'អ្នកគ្រូ លី គឹមលាង', nameEn: 'Ly Kimleang', nameChinese: '李金莲', subjectKhmer: 'អក្សរសិល្ប៍ និងវប្បធម៌ចិន', phone: '017 889 900', assignedClass: 'បកប្រែភាសាចិន ឆ្នាំទី ២' },
  { id: 't-5', nameKhmer: 'លោកគ្រូ ចេង វ៉ាន់នី', nameEn: 'Cheng Vanny', nameChinese: '郑万尼', subjectKhmer: 'សូរសព្ទ និងសូរសំឡេងចិន', phone: '010 445 566', assignedClass: 'គរុកោសល្យ ឆ្នាំទី ១ - ក' },
  { id: 't-6', nameKhmer: 'អ្នកគ្រូ ជា ម៉ារីណា', nameEn: 'Chea Marina', nameChinese: '谢玛丽', subjectKhmer: 'ការស្តាប់ និងសន្ទនាភាសាចិន', phone: '077 334 455', assignedClass: 'គរុកោសល្យ ឆ្នាំទី ១ - ខ' },
  { id: 't-7', nameKhmer: 'លោកគ្រូ វ៉ាង ជានវៃ (Wang Jianwei)', nameEn: 'Wang Jianwei', nameChinese: '王建伟', subjectKhmer: 'គ្រូជំនាញភាសាចិនជនជាតិចិន', phone: '096 112 233' },
  { id: 't-8', nameKhmer: 'អ្នកគ្រូ ចាង ស៊ាវហ័រ (Zhang Xiaohua)', nameEn: 'Zhang Xiaohua', nameChinese: '张小华', subjectKhmer: 'គ្រូជំនាញគរុកោសល្យជនជាតិចិន', phone: '097 556 677' }
];

export const TeacherAttendanceView: React.FC<TeacherAttendanceViewProps> = ({
  classes,
  recordedBy = 'Admin'
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-18');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Storage key for caching teacher attendance
  const storageKey = `teacher_attendance_${selectedDate}`;

  // Local attendance records state
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, TeacherAttendanceRecord>>(() => {
    try {
      const saved = localStorage.getItem('teacher_attendance_2026-08-18');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default initial records: All present
    const init: Record<string, TeacherAttendanceRecord> = {};
    DEFAULT_TEACHERS.forEach(t => {
      init[t.id] = {
        teacherName: t.nameKhmer,
        attendanceDate: '2026-08-18',
        status: 'present',
        checkIn: '07:30',
        checkOut: '17:00',
        note: '',
        recordedBy
      };
    });
    return init;
  });

  // Load from local storage or server when date changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setAttendanceRecords(JSON.parse(saved));
        return;
      }
    } catch {
      // ignore
    }

    // Default template for new date
    const init: Record<string, TeacherAttendanceRecord> = {};
    DEFAULT_TEACHERS.forEach(t => {
      init[t.id] = {
        teacherName: t.nameKhmer,
        attendanceDate: selectedDate,
        status: 'present',
        checkIn: '07:30',
        checkOut: '17:00',
        note: '',
        recordedBy
      };
    });
    setAttendanceRecords(init);
  }, [selectedDate, storageKey, recordedBy]);

  const handleStatusChange = (teacherId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => {
      const current = prev[teacherId] || {
        teacherName: DEFAULT_TEACHERS.find(t => t.id === teacherId)?.nameKhmer || '',
        attendanceDate: selectedDate,
        status: 'present',
        checkIn: '07:30',
        checkOut: '17:00',
        recordedBy
      };
      return {
        ...prev,
        [teacherId]: {
          ...current,
          status,
          attendanceDate: selectedDate
        }
      };
    });
  };

  const handleNoteChange = (teacherId: string, note: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        note
      }
    }));
  };

  const handleTimeChange = (teacherId: string, field: 'checkIn' | 'checkOut', val: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        [field]: val
      }
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setAttendanceRecords(prev => {
      const updated: Record<string, TeacherAttendanceRecord> = {};
      DEFAULT_TEACHERS.forEach(t => {
        const existing = prev[t.id];
        updated[t.id] = {
          teacherName: t.nameKhmer,
          attendanceDate: selectedDate,
          status,
          checkIn: existing?.checkIn || (status === 'present' ? '07:30' : ''),
          checkOut: existing?.checkOut || (status === 'present' ? '17:00' : ''),
          note: existing?.note || '',
          recordedBy
        };
      });
      return updated;
    });

    if (status === 'present') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.85 }
        });
      } catch {
        // safe ignore
      }
    }
  };

  const handleSave = async () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(attendanceRecords));
      // Also try saving via database service if reachable
      const recordsList: TeacherAttendanceRecord[] = Object.values(attendanceRecords);
      try {
        await teacherAttendanceDatabase.save(selectedDate, recordsList);
      } catch {
        // ignore service failure and rely on local storage
      }

      setToastMessage('បានរក្សាទុកវត្តមានលោកគ្រូ-អ្នកគ្រូដោយជោគជ័យ!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } catch (e) {
      setToastMessage('មានបញ្ហាក្នុងការរក្សាទុក!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return DEFAULT_TEACHERS.filter(teacher => {
      const record = attendanceRecords[teacher.id];
      const currentStatus = record?.status || 'present';

      // Status filter
      if (statusFilter !== 'all' && currentStatus !== statusFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchNameKhmer = teacher.nameKhmer.toLowerCase().includes(q);
        const matchNameEn = teacher.nameEn?.toLowerCase().includes(q) || false;
        const matchChinese = teacher.nameChinese?.toLowerCase().includes(q) || false;
        const matchSubject = teacher.subjectKhmer.toLowerCase().includes(q);
        return matchNameKhmer || matchNameEn || matchChinese || matchSubject;
      }

      return true;
    });
  }, [attendanceRecords, statusFilter, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    let present = 0;
    let permission = 0;
    let absent = 0;
    let late = 0;

    DEFAULT_TEACHERS.forEach(t => {
      const s = attendanceRecords[t.id]?.status || 'present';
      if (s === 'present') present++;
      else if (s === 'permission') permission++;
      else if (s === 'absent') absent++;
      else if (s === 'late') late++;
    });

    const total = DEFAULT_TEACHERS.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { total, present, permission, absent, late, rate };
  }, [attendanceRecords]);

  // Export to simple CSV
  const handleExportCSV = () => {
    const headers = ['ល.រ', 'ឈ្មោះខ្មែរ', 'ឈ្មោះឡាតាំង', 'ឈ្មោះចិន', 'មុខវិជ្ជា', 'កាលបរិច្ឆេទ', 'ស្ថានភាព', 'ម៉ោងចូល', 'ម៉ោងចេញ', 'សម្គាល់'];
    const statusKhmer: Record<AttendanceStatus, string> = {
      present: 'វត្តមាន',
      permission: 'ច្បាប់',
      absent: 'អវត្តមាន',
      late: 'យឺត'
    };

    const rows = DEFAULT_TEACHERS.map((t, idx) => {
      const rec = attendanceRecords[t.id];
      const st = rec?.status || 'present';
      return [
        idx + 1,
        `"${t.nameKhmer}"`,
        `"${t.nameEn || ''}"`,
        `"${t.nameChinese || ''}"`,
        `"${t.subjectKhmer}"`,
        selectedDate,
        `"${statusKhmer[st]}"`,
        rec?.checkIn || '',
        rec?.checkOut || '',
        `"${rec?.note || ''}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Teacher_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="teacher-attendance-workspace">
      {/* Toast Notification */}
      {showToast && (
        <div
          id="teacher-attendance-toast"
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl bg-zinc-900 px-5 py-4 text-white shadow-2xl transition-all dark:bg-white dark:text-zinc-900"
        >
          <Sparkles className="h-5 w-5 text-amber-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <UsersRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                កត់ត្រាវត្តមានលោកគ្រូ-អ្នកគ្រូ
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                វិទ្យាស្ថានគរុកោសល្យភាសាចិន • កត់ត្រា និងតាមដានវត្តមានប្រចាំថ្ងៃ
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <input
              id="teacher-attendance-date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium text-zinc-900 outline-none dark:text-white text-xs sm:text-sm"
            />
          </div>

          {/* Export Button */}
          <button
            id="export-teacher-attendance-btn"
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <Download className="h-4 w-4 text-zinc-500" />
            ទាញយក Excel (CSV)
          </button>

          {/* Save Button */}
          <button
            id="save-teacher-attendance-btn"
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Save className="h-4 w-4" />
            រក្សាទុកទិន្នន័យ
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">គ្រូបង្រៀនសរុប</p>
          <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">{stats.total} នាក់</p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-950 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">វត្តមាន</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">{stats.present}</p>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs dark:border-amber-950 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">សុំច្បាប់</p>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-700 dark:text-amber-400">{stats.permission}</p>
        </div>

        <div className="rounded-3xl border border-rose-100 bg-rose-50/50 p-4 shadow-xs dark:border-rose-950 dark:bg-rose-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-rose-700 dark:text-rose-400">អវត្តមាន</p>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-700 dark:text-rose-400">{stats.absent}</p>
        </div>

        <div className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-xs dark:border-indigo-950 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">មកយឺត</p>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-indigo-700 dark:text-indigo-400">{stats.late}</p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-zinc-900 p-4 text-white shadow-xs dark:border-zinc-800 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-400">អត្រាវត្តមាន</p>
          <p className="mt-2 text-2xl font-black text-emerald-400">{stats.rate}%</p>
        </div>
      </div>

      {/* Quick Action & Filters Bar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            id="search-teachers-input"
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះគ្រូ ឬមុខវិជ្ជា..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs text-zinc-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${statusFilter === 'all' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'}`}
          >
            ទាំងអស់ ({DEFAULT_TEACHERS.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('present')}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${statusFilter === 'present' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'}`}
          >
            វត្តមាន ({stats.present})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('permission')}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${statusFilter === 'permission' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400'}`}
          >
            ច្បាប់ ({stats.permission})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('absent')}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${statusFilter === 'absent' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400'}`}
          >
            អវត្តមាន ({stats.absent})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('late')}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${statusFilter === 'late' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400'}`}
          >
            យឺត ({stats.late})
          </button>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2 border-t border-zinc-100 pt-2 sm:border-t-0 sm:border-l sm:pl-3 sm:pt-0 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => handleMarkAll('present')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
            title="ដាក់វត្តមានទាំងអស់"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            វត្តមានទាំងអស់
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('permission')}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            title="កំណត់ឡើងវិញ"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            កំណត់ឡើងវិញ
          </button>
        </div>
      </div>

      {/* Teachers Attendance Table */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50/75 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-4 w-12 text-center">ល.រ</th>
                <th className="px-5 py-4">ព័ត៌មានគ្រូបង្រៀន</th>
                <th className="px-5 py-4">មុខវិជ្ជា / បន្ទុក</th>
                <th className="px-5 py-4 text-center">ស្ថានភាពវត្តមាន</th>
                <th className="px-5 py-4">ម៉ោងចូល - ចេញ</th>
                <th className="px-5 py-4">កំណត់ចំណាំ / សម្គាល់</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
              {filteredTeachers.map((teacher, index) => {
                const record = attendanceRecords[teacher.id] || {
                  teacherName: teacher.nameKhmer,
                  attendanceDate: selectedDate,
                  status: 'present',
                  checkIn: '07:30',
                  checkOut: '17:00',
                  note: '',
                  recordedBy
                };

                return (
                  <tr
                    key={teacher.id}
                    className="transition hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-5 py-4 text-center text-xs font-bold text-zinc-400">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                          {teacher.nameKhmer.charAt( teacher.nameKhmer.startsWith('លោកគ្រូ ') ? 8 : (teacher.nameKhmer.startsWith('អ្នកគ្រូ ') ? 8 : 0) ) || 'គ'}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">
                            {teacher.nameKhmer}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            {teacher.nameChinese && (
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                {teacher.nameChinese}
                              </span>
                            )}
                            {teacher.phone && (
                              <span>• {teacher.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-xl bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {teacher.subjectKhmer}
                      </span>
                      {teacher.assignedClass && (
                        <p className="mt-1 text-[11px] text-zinc-400">
                          {teacher.assignedClass}
                        </p>
                      )}
                    </td>

                    {/* Status Toggle Buttons */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(teacher.id, 'present')}
                          className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                            record.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          វត្តមាន
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(teacher.id, 'permission')}
                          className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                            record.status === 'permission'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-amber-50 hover:text-amber-700 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          ច្បាប់
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(teacher.id, 'absent')}
                          className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                            record.status === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-rose-50 hover:text-rose-700 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          អវត្តមាន
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(teacher.id, 'late')}
                          className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                            record.status === 'late'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          យឺត
                        </button>
                      </div>
                    </td>

                    {/* Check In / Out */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          value={record.checkIn || ''}
                          onChange={(e) => handleTimeChange(teacher.id, 'checkIn', e.target.value)}
                          className="rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-800 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                        />
                        <span className="text-zinc-400">-</span>
                        <input
                          type="time"
                          value={record.checkOut || ''}
                          onChange={(e) => handleTimeChange(teacher.id, 'checkOut', e.target.value)}
                          className="rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-800 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                        />
                      </div>
                    </td>

                    {/* Note */}
                    <td className="px-5 py-4">
                      <input
                        type="text"
                        placeholder="មូលហេតុ ឬសម្គាល់..."
                        value={record.note || ''}
                        onChange={(e) => handleNoteChange(teacher.id, e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                      />
                    </td>
                  </tr>
                );
              })}

              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    មិនមានទិន្នន័យលោកគ្រូ-អ្នកគ្រូតាមការស្វែងរកនោះទេ។
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
