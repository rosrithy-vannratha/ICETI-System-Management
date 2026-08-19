import React, { useState, useMemo } from 'react';
import { Student, ClassRoom, Major } from '../types';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  Grid,
  List,
  UserCheck,
  GraduationCap,
  Layers,
  Clock,
  BookOpen,
  Award,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckSquare,
  Square,
  MinusSquare,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadStudentTemplate } from '../utils/exportUtils';
import {
  getStudentFilterOptions,
  matchesStudentDirectoryFilters
} from '../utils/studentFilters';

interface StudentsViewProps {
  students: Student[];
  classes: ClassRoom[];
  majors?: Major[];
  onOpenStudentModal: (student: Student) => void;
  onOpenAddStudent: () => void;
  onOpenImportExcel: () => void;
  onDeleteStudent?: (id: string) => Promise<void> | void;
  onDeleteMultipleStudents?: (ids: string[]) => Promise<void> | void;
  onDeleteAllStudents?: () => Promise<void> | void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  classes,
  majors = [],
  onOpenStudentModal,
  onOpenAddStudent,
  onOpenImportExcel,
  onDeleteStudent,
  onDeleteMultipleStudents,
  onDeleteAllStudents
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('all');
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Checkbox selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Deletion modals state
  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
  const [confirmDeleteSelectedOpen, setConfirmDeleteSelectedOpen] = useState(false);
  const [studentToDeleteSingle, setStudentToDeleteSingle] = useState<Student | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const majorOptions = useMemo(
    () => getStudentFilterOptions(
      majors.map((major) => major.nameKhmer),
      students.map((student) => student.major)
    ),
    [majors, students]
  );

  const yearOptions = useMemo(
    () => getStudentFilterOptions(
      ['ឆ្នាំទី ១', 'ឆ្នាំទី ២', 'ឆ្នាំទី ៣', 'ឆ្នាំទី ៤'],
      students.map((student) => student.yearLevel)
    ),
    [students]
  );

  const shiftOptions = useMemo(
    () => getStudentFilterOptions(
      ['វេនព្រឹក', 'វេនរសៀល', 'វេនយប់', 'វេនចុងសប្តាហ៍'],
      students.map((student) => student.shift)
    ),
    [students]
  );

  const filteredStudents = useMemo(() => {
    return students.filter((student) => matchesStudentDirectoryFilters(student, {
      searchTerm,
      major: selectedMajor,
      yearLevel: selectedYear,
      shift: selectedShift
    }));
  }, [students, searchTerm, selectedMajor, selectedShift, selectedYear]);

  const hasActiveFilters = searchTerm.trim() !== ''
    || selectedMajor !== 'all'
    || selectedYear !== 'all'
    || selectedShift !== 'all';

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedMajor('all');
    setSelectedYear('all');
    setSelectedShift('all');
  };

  // Handle selection toggling
  const handleToggleSelectAll = () => {
    const visibleIds = filteredStudents.map((s) => s.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

    if (allVisibleSelected) {
      // Unselect all visible
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select all visible
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmDeleteAll = async () => {
    try {
      if (onDeleteAllStudents) {
        await onDeleteAllStudents();
      }
      setSelectedIds([]);
      setConfirmDeleteAllOpen(false);
      setDeleteError('');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'មិនអាចលុបទិន្នន័យបានទេ។');
    }
  };

  const handleConfirmDeleteSelected = async () => {
    try {
      if (onDeleteMultipleStudents && selectedIds.length > 0) {
        await onDeleteMultipleStudents(selectedIds);
      }
      setSelectedIds([]);
      setConfirmDeleteSelectedOpen(false);
      setDeleteError('');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'មិនអាចលុបទិន្នន័យបានទេ។');
    }
  };

  const handleConfirmDeleteSingle = async () => {
    try {
      if (studentToDeleteSingle && onDeleteStudent) {
        await onDeleteStudent(studentToDeleteSingle.id);
        setSelectedIds((prev) => prev.filter((id) => id !== studentToDeleteSingle.id));
      }
      setStudentToDeleteSingle(null);
      setDeleteError('');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'មិនអាចលុបទិន្នន័យបានទេ។');
    }
  };

  const isAllVisibleSelected =
    filteredStudents.length > 0 && filteredStudents.every((s) => selectedIds.includes(s.id));
  const isSomeVisibleSelected =
    filteredStudents.some((s) => selectedIds.includes(s.id)) && !isAllVisibleSelected;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1440px] mx-auto pb-16">
      {/* Header & Actions Bento */}
      <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block mb-1">
            STUDENT DIRECTORY & 11 CORE ATTRIBUTES
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            បញ្ជីរាយនាមសិស្ស (ព័ត៌មានទាំង ១១ ចំណុច)
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            គ្រប់គ្រងព័ត៌មានលម្អិត អត្តលេខ ឈ្មោះខ្មែរ/ឡាតាំង/ចិន ជំនាញ ជំនាន់ ឆ្នាំ ឆមាស និងវេនសិក្សា
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Delete All Data Button */}
          {students.length > 0 && onDeleteAllStudents && (
            <button
              type="button"
              onClick={() => setConfirmDeleteAllOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              title="លុបទិន្នន័យសិស្សទាំងអស់ចេញពីប្រព័ន្ធ"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>លុបព័ត៌មានទាំងអស់</span>
            </button>
          )}

          <button
            type="button"
            onClick={downloadStudentTemplate}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-2xl text-xs font-bold transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
            title="ទាញយកគំរូឯកសារ Excel សម្រាប់បំពេញទិន្នន័យ"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ទាញយកគំរូ Excel</span>
            <span className="sm:hidden">គំរូ</span>
          </button>

          <button
            type="button"
            onClick={onOpenImportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            title="នាំចូលទិន្នន័យសិស្សជាក្រុមពីឯកសារ Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>នាំចូល Excel</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddStudent}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>បន្ថែមសិស្សថ្មី</span>
          </button>
        </div>
      </div>

      {/* Multi-attribute Filter Bento Tile */}
      <div className="bg-white dark:bg-[#121215] p-5 sm:p-6 rounded-3xl shadow-xs border border-zinc-200 dark:border-zinc-800 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ស្វែងរកក្នុងព័ត៌មានទាំង ១១ ចំណុច..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-zinc-400 transition-all"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl self-end lg:self-auto border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
              }`}
              title="ទិដ្ឋភាពតារាង (Table View)"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
              }`}
              title="ទិដ្ឋភាពក្រឡា (Grid View)"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters for 11 Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          {/* Major Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
              ៧. តម្រងតាមជំនាញ (Major)
            </label>
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs text-zinc-900 dark:text-white font-medium focus:border-indigo-500 outline-none cursor-pointer transition-all"
            >
              <option value="all">គ្រប់ជំនាញទាំងអស់ (All Majors)</option>
              {majorOptions.map((major) => (
                <option key={major} value={major}>{major}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
              ៩. តម្រងតាមឆ្នាំ (Year Level)
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs text-zinc-900 dark:text-white font-medium focus:border-indigo-500 outline-none cursor-pointer transition-all"
            >
              <option value="all">គ្រប់កម្រិតឆ្នាំ (All Years)</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Shift Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
              ១១. តម្រងតាមវេនសិក្សា (Shift)
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs text-zinc-900 dark:text-white font-medium focus:border-indigo-500 outline-none cursor-pointer transition-all"
            >
              <option value="all">គ្រប់វេនសិក្សា (All Shifts)</option>
              {shiftOptions.map((shift) => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-indigo-50 px-3.5 py-2.5 text-xs dark:bg-indigo-950/40">
            <span className="flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-300">
              <Filter className="h-3.5 w-3.5" />
              កំពុងប្រើតម្រងលើបញ្ជីសិស្ស
            </span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 font-bold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-zinc-900 dark:text-indigo-300 dark:hover:bg-indigo-950"
            >
              សម្អាតតម្រង
            </button>
          </div>
        )}
      </div>

      {/* Selected Items Actions Toolbar */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl px-5 py-3 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-200">
              បានជ្រើសរើសសិស្ស: <span className="underline">{selectedIds.length} នាក់</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
            >
              ដោះការជ្រើសរើស
            </button>
            {onDeleteMultipleStudents && (
              <button
                type="button"
                onClick={() => setConfirmDeleteSelectedOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-rose-500/25 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>លុបដែលបានជ្រើស ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Results Count */}
      {deleteError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          {deleteError}
        </div>
      )}
      <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 flex items-center justify-between">
        <span>
          សរុបសិស្សដែលស្វែងរកឃើញ: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredStudents.length} នាក់</span>
        </span>
        {students.length === 0 && (
          <span className="text-amber-500 font-semibold">ទិន្នន័យសិស្សត្រូវបានលុបអស់ហើយ</span>
        )}
      </div>

      {/* View Mode: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#121215] rounded-3xl shadow-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/80 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-4 w-12 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="p-1 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="ជ្រើសរើសទាំងអស់"
                    >
                      {isAllVisibleSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      ) : isSomeVisibleSelected ? (
                        <MinusSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">ល.រ</th>
                  <th className="p-4">១. អត្តលេខ</th>
                  <th className="p-4">២. ឈ្មោះខ្មែរ / ៣. ឡាតាំង / ៤. ឈ្មោះចិន</th>
                  <th className="p-4">៥. ភេទ</th>
                  <th className="p-4">៦. ថ្ងៃខែកំណើត</th>
                  <th className="p-4">៧. ជំនាញ</th>
                  <th className="p-4">៨. ជំនាន់ & ៩. ឆ្នាំ</th>
                  <th className="p-4">១០. ឆមាស & ១១. វេន</th>
                  <th className="p-4 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-800 dark:text-zinc-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-10 text-center text-zinc-400 text-xs">
                      {students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                          <AlertTriangle className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                          <span className="font-semibold text-zinc-500">ពុំមានទិន្នន័យសិស្សក្នុងប្រព័ន្ធឡើយ។</span>
                          <button
                            type="button"
                            onClick={onOpenAddStudent}
                            className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                          >
                            + ចុចទីនេះដើម្បីបន្ថែមសិស្សថ្មី ឬ នាំចូល Excel
                          </button>
                        </div>
                      ) : (
                        'ពុំមានទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះឡើយ។'
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => {
                    const isSelected = selectedIds.includes(s.id);
                    return (
                      <tr
                        key={s.id}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/30'
                            : 'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectOne(s.id)}
                            className="p-1 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-400" />
                            )}
                          </button>
                        </td>
                        <td className="p-4 font-mono text-xs text-zinc-400 dark:text-zinc-500">
                          #{String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="p-4 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            {s.studentCode}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={s.avatarUrl}
                              alt={s.fullNameKhmer}
                              className="w-10 h-10 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-xs"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                  {s.fullNameKhmer}
                                </span>
                                {s.chineseName && (
                                  <span className="font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20 font-sans">
                                    {s.chineseName}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-zinc-400">{s.fullNameEn}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-medium">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                              s.gender === 'M'
                                ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                : 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
                            }`}
                          >
                            {s.gender === 'M' ? 'ប្រុស' : 'ស្រី'}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                          {s.dob || '—'}
                        </td>
                        <td className="p-4 text-xs">
                          <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-xl font-medium border border-indigo-200/60 dark:border-indigo-800/60 text-[11px]">
                            {s.major || 'គរុកោសល្យភាសាចិន'}
                          </span>
                        </td>
                        <td className="p-4 text-xs">
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200">{s.generation || 'ជំនាន់ទី ៣'}</div>
                          <div className="text-[11px] text-zinc-400">{s.yearLevel || 'ឆ្នាំទី ៤'}</div>
                        </td>
                        <td className="p-4 text-xs">
                          <div className="font-medium text-zinc-800 dark:text-zinc-200">{s.semester || 'ឆមាសទី ១'}</div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{s.shift || 'វេនព្រឹក'}</div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenStudentModal(s)}
                              className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-colors cursor-pointer"
                              title="មើលព័ត៌មានលម្អិតទាំង ១១ ចំណុច"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {onDeleteStudent && (
                              <button
                                type="button"
                                onClick={() => setStudentToDeleteSingle(s)}
                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                                title="លុបទិន្នន័យសិស្សនេះ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Mode Bento */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredStudents.map((s) => {
            const isSelected = selectedIds.includes(s.id);
            return (
              <motion.div
                key={s.id}
                whileHover={{ y: -2 }}
                className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800'
                    : 'bg-white dark:bg-[#121215] border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectOne(s.id)}
                        className="p-0.5 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-400" />
                        )}
                      </button>
                      <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-mono font-bold border border-zinc-200 dark:border-zinc-700">
                        {s.studentCode}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      s.gender === 'M'
                        ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        : 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
                    }`}>
                      {s.gender === 'M' ? 'ប្រុស' : 'ស្រី'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center my-3">
                    <img
                      src={s.avatarUrl}
                      alt={s.fullNameKhmer}
                      className="w-16 h-16 rounded-3xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-xs mb-2.5"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      <h4 className="font-bold text-zinc-900 dark:text-white text-base">
                        {s.fullNameKhmer}
                      </h4>
                      {s.chineseName && (
                        <span className="font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md font-sans">
                          {s.chineseName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{s.fullNameEn}</p>
                  </div>

                  {/* 11 Attributes Badges */}
                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">ជំនាញ:</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{s.major || 'គរុកោសល្យភាសាចិន'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">ជំនាន់ & ឆ្នាំ:</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">{s.generation} · {s.yearLevel}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">ឆមាស & វេន:</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{s.semester} · {s.shift}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">ថ្ងៃកំណើត:</span>
                      <span className="font-mono text-zinc-500">{s.dob || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenStudentModal(s)}
                    className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>មើលទាំង ១១ ចំណុច</span>
                  </button>
                  {onDeleteStudent && (
                    <button
                      type="button"
                      onClick={() => setStudentToDeleteSingle(s)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60 rounded-2xl transition-colors cursor-pointer"
                      title="លុបទិន្នន័យសិស្សនេះ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog: Delete All Students */}
      <AnimatePresence>
        {confirmDeleteAllOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#18181b] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-rose-200 dark:border-rose-900"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white mb-2">
                លុបទិន្នន័យសិស្សទាំងអស់?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                តើអ្នកប្រាកដជាចង់លុបទិន្នន័យសិស្សទាំងអស់ដែលមានសរុប <strong className="text-rose-600 dark:text-rose-400">{students.length} នាក់</strong> ចេញពីប្រព័ន្ធមែនទេ?
                <span className="block mt-1 text-rose-500 font-semibold">
                  ⚠️ សកម្មភាពនេះមិនអាចត្រឡប់ថយក្រោយវិញបានឡើយ!
                </span>
              </p>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteAllOpen(false)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteAll}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-rose-500/25 cursor-pointer active:scale-95"
                >
                  បាទ/ចាស លុបទិន្នន័យទាំងអស់
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog: Delete Selected Students */}
      <AnimatePresence>
        {confirmDeleteSelectedOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#18181b] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-rose-200 dark:border-rose-900"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white mb-2">
                លុបសិស្សដែលបានជ្រើសរើស?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                តើអ្នកប្រាកដជាចង់លុបទិន្នន័យសិស្សទាំង <strong className="text-rose-600 dark:text-rose-400">{selectedIds.length} នាក់</strong> ដែលបានជ្រើសរើសមែនទេ?
              </p>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteSelectedOpen(false)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteSelected}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-rose-500/25 cursor-pointer active:scale-95"
                >
                  បាទ/ចាស លុប
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog: Delete Single Student */}
      <AnimatePresence>
        {studentToDeleteSingle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#18181b] rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-rose-200 dark:border-rose-900"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mb-1.5">
                លុបទិន្នន័យសិស្ស
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
                តើអ្នកប្រាកដជាចង់លុបទិន្នន័យសិស្ស <strong className="text-zinc-900 dark:text-zinc-100">{studentToDeleteSingle.fullNameKhmer} ({studentToDeleteSingle.studentCode})</strong> ចេញពីប្រព័ន្ធមែនទេ?
              </p>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setStudentToDeleteSingle(null)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteSingle}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-rose-500/25 cursor-pointer active:scale-95"
                >
                  បាទ/ចាស លុប
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
