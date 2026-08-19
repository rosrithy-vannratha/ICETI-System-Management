import React, { useState, useMemo } from 'react';
import {
  Generation,
  AcademicYear,
  YearLevel,
  Semester,
  Student,
  ClassRoom
} from '../types';
import {
  Layers,
  Calendar,
  GraduationCap,
  Clock,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
  Sparkles,
  Users,
  BookOpen,
  CalendarDays,
  Tag,
  ArrowRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type SubTab = 'generations' | 'academicYears' | 'yearLevels' | 'semesters';

interface AcademicStructureViewProps {
  generations: Generation[];
  academicYears: AcademicYear[];
  yearLevels: YearLevel[];
  semesters: Semester[];
  students: Student[];
  classes: ClassRoom[];
  // Generation handlers
  onAddGeneration: (gen: Omit<Generation, 'id'>) => void;
  onUpdateGeneration: (gen: Generation) => void;
  onDeleteGeneration: (id: string) => void;
  // Academic Year handlers
  onAddAcademicYear: (ay: Omit<AcademicYear, 'id'>) => void;
  onUpdateAcademicYear: (ay: AcademicYear) => void;
  onDeleteAcademicYear: (id: string) => void;
  // Year Level handlers
  onAddYearLevel: (yl: Omit<YearLevel, 'id'>) => void;
  onUpdateYearLevel: (yl: YearLevel) => void;
  onDeleteYearLevel: (id: string) => void;
  // Semester handlers
  onAddSemester: (sem: Omit<Semester, 'id'>) => void;
  onUpdateSemester: (sem: Semester) => void;
  onDeleteSemester: (id: string) => void;
}

export const AcademicStructureView: React.FC<AcademicStructureViewProps> = ({
  generations,
  academicYears,
  yearLevels,
  semesters,
  students,
  classes,
  onAddGeneration,
  onUpdateGeneration,
  onDeleteGeneration,
  onAddAcademicYear,
  onUpdateAcademicYear,
  onDeleteAcademicYear,
  onAddYearLevel,
  onUpdateYearLevel,
  onDeleteYearLevel,
  onAddSemester,
  onUpdateSemester,
  onDeleteSemester
}) => {
  const [activeTab, setActiveTab] = useState<SubTab>('generations');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [editingGen, setEditingGen] = useState<Generation | null>(null);

  const [isAyModalOpen, setIsAyModalOpen] = useState(false);
  const [editingAy, setEditingAy] = useState<AcademicYear | null>(null);

  const [isYlModalOpen, setIsYlModalOpen] = useState(false);
  const [editingYl, setEditingYl] = useState<YearLevel | null>(null);

  const [isSemModalOpen, setIsSemModalOpen] = useState(false);
  const [editingSem, setEditingSem] = useState<Semester | null>(null);

  // Deletion modal state
  const [deleteItemInfo, setDeleteItemInfo] = useState<{
    type: SubTab;
    id: string;
    name: string;
    studentCount: number;
  } | null>(null);

  // Helper counts
  const studentCountByGeneration = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach((s) => {
      if (s.generation) {
        map[s.generation] = (map[s.generation] || 0) + 1;
      }
    });
    return map;
  }, [students]);

  const studentCountByYearLevel = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach((s) => {
      if (s.yearLevel) {
        map[s.yearLevel] = (map[s.yearLevel] || 0) + 1;
      }
    });
    return map;
  }, [students]);

  const studentCountBySemester = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach((s) => {
      if (s.semester) {
        map[s.semester] = (map[s.semester] || 0) + 1;
      }
    });
    return map;
  }, [students]);

  const classesCountByAcademicYear = useMemo(() => {
    const map: Record<string, number> = {};
    classes.forEach((c) => {
      if (c.academicYear) {
        map[c.academicYear] = (map[c.academicYear] || 0) + 1;
      }
    });
    return map;
  }, [classes]);

  // Filtered lists
  const filteredGenerations = useMemo(() => {
    return generations.filter((g) => {
      const q = searchTerm.toLowerCase();
      return (
        g.nameKhmer.toLowerCase().includes(q) ||
        (g.nameEn && g.nameEn.toLowerCase().includes(q)) ||
        (g.startYear && g.startYear.includes(q)) ||
        (g.endYear && g.endYear.includes(q))
      );
    });
  }, [generations, searchTerm]);

  const filteredAcademicYears = useMemo(() => {
    return academicYears.filter((ay) => {
      const q = searchTerm.toLowerCase();
      return (
        ay.nameKhmer.toLowerCase().includes(q) ||
        (ay.nameEn && ay.nameEn.toLowerCase().includes(q)) ||
        (ay.description && ay.description.toLowerCase().includes(q))
      );
    });
  }, [academicYears, searchTerm]);

  const filteredYearLevels = useMemo(() => {
    return yearLevels.filter((yl) => {
      const q = searchTerm.toLowerCase();
      return (
        yl.nameKhmer.toLowerCase().includes(q) ||
        (yl.nameEn && yl.nameEn.toLowerCase().includes(q)) ||
        (yl.description && yl.description.toLowerCase().includes(q))
      );
    });
  }, [yearLevels, searchTerm]);

  const filteredSemesters = useMemo(() => {
    return semesters.filter((sem) => {
      const q = searchTerm.toLowerCase();
      return (
        sem.nameKhmer.toLowerCase().includes(q) ||
        (sem.nameEn && sem.nameEn.toLowerCase().includes(q)) ||
        (sem.description && sem.description.toLowerCase().includes(q))
      );
    });
  }, [semesters, searchTerm]);

  // Execution delete
  const handleExecuteDelete = () => {
    if (!deleteItemInfo) return;
    if (deleteItemInfo.type === 'generations') {
      onDeleteGeneration(deleteItemInfo.id);
    } else if (deleteItemInfo.type === 'academicYears') {
      onDeleteAcademicYear(deleteItemInfo.id);
    } else if (deleteItemInfo.type === 'yearLevels') {
      onDeleteYearLevel(deleteItemInfo.id);
    } else if (deleteItemInfo.type === 'semesters') {
      onDeleteSemester(deleteItemInfo.id);
    }
    setDeleteItemInfo(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
                ACADEMIC STRUCTURE
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                ជំនាន់ · វគ្គសិក្សា · ឆ្នាំ · ឆមាស
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              រចនាសម្ព័ន្ធ និងវដ្តសិក្សា
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
              គ្រប់គ្រង បន្ថែម កែប្រែ និងលុបទិន្នន័យ <strong>ជំនាន់</strong>, <strong>វគ្គ/ឆ្នាំសិក្សា</strong>, <strong>កម្រិតឆ្នាំ</strong> និង <strong>ឆមាស</strong> សម្រាប់ប្រើប្រាស់ក្នុងប្រព័ន្ធទាំងមូល។
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'generations' && (
              <button
                type="button"
                onClick={() => {
                  setEditingGen(null);
                  setIsGenModalOpen(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>បង្កើតជំនាន់ថ្មី</span>
              </button>
            )}

            {activeTab === 'academicYears' && (
              <button
                type="button"
                onClick={() => {
                  setEditingAy(null);
                  setIsAyModalOpen(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>បង្កើតឆ្នាំសិក្សាថ្មី</span>
              </button>
            )}

            {activeTab === 'yearLevels' && (
              <button
                type="button"
                onClick={() => {
                  setEditingYl(null);
                  setIsYlModalOpen(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>បង្កើតកម្រិតឆ្នាំថ្មី</span>
              </button>
            )}

            {activeTab === 'semesters' && (
              <button
                type="button"
                onClick={() => {
                  setEditingSem(null);
                  setIsSemModalOpen(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>បង្កើតឆមាសថ្មី</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div
            onClick={() => setActiveTab('generations')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'generations'
                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-900 dark:text-indigo-200'
                : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
              <span className="text-[11px] font-bold">ជំនាន់សរុប</span>
              <Layers className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl font-black text-zinc-900 dark:text-white font-mono">
              {generations.length} <span className="text-xs font-sans font-normal text-zinc-400">ជំនាន់</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('academicYears')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'academicYears'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
              <span className="text-[11px] font-bold">ឆ្នាំសិក្សា</span>
              <Calendar className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-black text-zinc-900 dark:text-white font-mono">
              {academicYears.length} <span className="text-xs font-sans font-normal text-zinc-400">វគ្គ</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('yearLevels')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'yearLevels'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200'
                : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
              <span className="text-[11px] font-bold">កម្រិតឆ្នាំ</span>
              <GraduationCap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-black text-zinc-900 dark:text-white font-mono">
              {yearLevels.length} <span className="text-xs font-sans font-normal text-zinc-400">កម្រិត</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('semesters')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'semesters'
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-900 dark:text-sky-200'
                : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
              <span className="text-[11px] font-bold">ឆមាស</span>
              <Clock className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-xl font-black text-zinc-900 dark:text-white font-mono">
              {semesters.length} <span className="text-xs font-sans font-normal text-zinc-400">ឆមាស</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* SubTab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('generations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'generations'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>១. ជំនាន់ ({generations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('academicYears')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'academicYears'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>២. ឆ្នាំសិក្សា/វគ្គ ({academicYears.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('yearLevels')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'yearLevels'
                ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>៣. កម្រិតឆ្នាំ ({yearLevels.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('semesters')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'semesters'
                ? 'bg-white dark:bg-zinc-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>៤. ឆមាស ({semesters.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="ស្វែងរក..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* SUBTAB 1: GENERATIONS (ជំនាន់) */}
      {activeTab === 'generations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGenerations.map((gen) => {
            const count = studentCountByGeneration[gen.nameKhmer] || 0;
            return (
              <motion.div
                key={gen.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {gen.nameKhmer}
                        </h3>
                        {gen.nameEn && (
                          <span className="text-xs text-zinc-400 font-mono">
                            {gen.nameEn}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        gen.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : gen.status === 'graduated'
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}
                    >
                      {gen.status === 'active' ? 'កំពុងសិក្សា' : gen.status === 'graduated' ? 'បញ្ចប់ការសិក្សា' : 'គ្រោងទុក'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {gen.description || 'គ្មានការពណ៌នា'}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-zinc-500 font-mono font-semibold">
                      <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{gen.startYear || '2023'} - {gen.endYear || '2027'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold font-mono">
                      <Users className="w-3.5 h-3.5" />
                      <span>{count} នាក់</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGen(gen);
                        setIsGenModalOpen(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                      title="កែប្រែ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteItemInfo({
                          type: 'generations',
                          id: gen.id,
                          name: gen.nameKhmer,
                          studentCount: count
                        })
                      }
                      className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                      title="លុប"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 2: ACADEMIC YEARS / COURSES (ឆ្នាំសិក្សា / វគ្គ) */}
      {activeTab === 'academicYears' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAcademicYears.map((ay) => {
            const classCount = classesCountByAcademicYear[ay.nameKhmer] || 0;
            return (
              <motion.div
                key={ay.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white dark:bg-[#121215] border rounded-3xl p-5 shadow-xs transition-all group flex flex-col justify-between ${
                  ay.isCurrent
                    ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          ឆ្នាំសិក្សា {ay.nameKhmer}
                        </h3>
                        {ay.nameEn && (
                          <span className="text-xs text-zinc-400 font-mono">
                            {ay.nameEn}
                          </span>
                        )}
                      </div>
                    </div>

                    {ay.isCurrent ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>បច្ចុប្បន្ន</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                        អសកម្ម
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {ay.description || 'គ្មានការពណ៌នា'}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{classCount} ថ្នាក់រៀន</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAy(ay);
                        setIsAyModalOpen(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                      title="កែប្រែ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteItemInfo({
                          type: 'academicYears',
                          id: ay.id,
                          name: ay.nameKhmer,
                          studentCount: classCount
                        })
                      }
                      className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                      title="លុប"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 3: YEAR LEVELS (កម្រិតឆ្នាំ) */}
      {activeTab === 'yearLevels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredYearLevels.map((yl) => {
            const count = studentCountByYearLevel[yl.nameKhmer] || 0;
            return (
              <motion.div
                key={yl.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs hover:border-amber-500/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
                      {yl.levelNumber}
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500">
                      កម្រិត {yl.levelNumber}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {yl.nameKhmer}
                  </h3>
                  {yl.nameEn && (
                    <span className="text-xs text-zinc-400 font-mono block mb-2">
                      {yl.nameEn}
                    </span>
                  )}

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {yl.description || 'គ្មានការពណ៌នា'}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold font-mono text-xs">
                    <Users className="w-3.5 h-3.5" />
                    <span>{count} នាក់</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingYl(yl);
                        setIsYlModalOpen(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                      title="កែប្រែ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteItemInfo({
                          type: 'yearLevels',
                          id: yl.id,
                          name: yl.nameKhmer,
                          studentCount: count
                        })
                      }
                      className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                      title="លុប"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 4: SEMESTERS (ឆមាស) */}
      {activeTab === 'semesters' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredSemesters.map((sem) => {
            const count = studentCountBySemester[sem.nameKhmer] || 0;
            return (
              <motion.div
                key={sem.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white dark:bg-[#121215] border rounded-3xl p-5 shadow-xs transition-all group flex flex-col justify-between ${
                  sem.isCurrent
                    ? 'border-sky-500/40 ring-1 ring-sky-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-sky-500/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {sem.nameKhmer}
                        </h3>
                        {sem.nameEn && (
                          <span className="text-xs text-zinc-400 font-mono">
                            {sem.nameEn}
                          </span>
                        )}
                      </div>
                    </div>

                    {sem.isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                        ឆមាសបច្ចុប្បន្ន
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {sem.description || 'គ្មានការពណ៌នា'}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold font-mono text-xs">
                    <Users className="w-3.5 h-3.5" />
                    <span>{count} នាក់</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSem(sem);
                        setIsSemModalOpen(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                      title="កែប្រែ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteItemInfo({
                          type: 'semesters',
                          id: sem.id,
                          name: sem.nameKhmer,
                          studentCount: count
                        })
                      }
                      className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                      title="លុប"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL 1: ADD / EDIT GENERATION ================= */}
      <AnimatePresence>
        {isGenModalOpen && (
          <GenerationModal
            isOpen={isGenModalOpen}
            onClose={() => {
              setIsGenModalOpen(false);
              setEditingGen(null);
            }}
            initialData={editingGen}
            onSave={(data) => {
              if (editingGen) {
                onUpdateGeneration({ ...editingGen, ...data });
              } else {
                onAddGeneration(data);
              }
              setIsGenModalOpen(false);
              setEditingGen(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ================= MODAL 2: ADD / EDIT ACADEMIC YEAR ================= */}
      <AnimatePresence>
        {isAyModalOpen && (
          <AcademicYearModal
            isOpen={isAyModalOpen}
            onClose={() => {
              setIsAyModalOpen(false);
              setEditingAy(null);
            }}
            initialData={editingAy}
            onSave={(data) => {
              if (editingAy) {
                onUpdateAcademicYear({ ...editingAy, ...data });
              } else {
                onAddAcademicYear(data);
              }
              setIsAyModalOpen(false);
              setEditingAy(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ================= MODAL 3: ADD / EDIT YEAR LEVEL ================= */}
      <AnimatePresence>
        {isYlModalOpen && (
          <YearLevelModal
            isOpen={isYlModalOpen}
            onClose={() => {
              setIsYlModalOpen(false);
              setEditingYl(null);
            }}
            initialData={editingYl}
            onSave={(data) => {
              if (editingYl) {
                onUpdateYearLevel({ ...editingYl, ...data });
              } else {
                onAddYearLevel(data);
              }
              setIsYlModalOpen(false);
              setEditingYl(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ================= MODAL 4: ADD / EDIT SEMESTER ================= */}
      <AnimatePresence>
        {isSemModalOpen && (
          <SemesterModal
            isOpen={isSemModalOpen}
            onClose={() => {
              setIsSemModalOpen(false);
              setEditingSem(null);
            }}
            initialData={editingSem}
            onSave={(data) => {
              if (editingSem) {
                onUpdateSemester({ ...editingSem, ...data });
              } else {
                onAddSemester(data);
              }
              setIsSemModalOpen(false);
              setEditingSem(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ================= GLOBAL DELETE CONFIRMATION MODAL ================= */}
      <AnimatePresence>
        {deleteItemInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#121215] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h4 className="text-lg font-bold text-center text-zinc-900 dark:text-white mb-1">
                តើអ្នកពិតជាចង់លុប &quot;{deleteItemInfo.name}&quot;?
              </h4>

              <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
                ទិន្នន័យនេះនឹងត្រូវលុបចេញពីជម្រើសកំណត់ក្នុងប្រព័ន្ធ។
                {deleteItemInfo.studentCount > 0 && (
                  <span className="block mt-1 text-amber-600 dark:text-amber-400 font-medium">
                    (សម្គាល់៖ មានសិស្ស/ថ្នាក់រៀនចំនួន {deleteItemInfo.studentCount} កំពុងជាប់ពាក់ព័ន្ធនឹងទិន្នន័យនេះ)
                  </span>
                )}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteItemInfo(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  យល់ព្រមលុប
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ================= MODAL SUB-COMPONENTS =================

// 1. Generation Modal
interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Generation | null;
  onSave: (data: Omit<Generation, 'id'>) => void;
}

const GenerationModal: React.FC<GenerationModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave
}) => {
  const [nameKhmer, setNameKhmer] = useState(initialData?.nameKhmer || '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn || '');
  const [startYear, setStartYear] = useState(initialData?.startYear || '2024');
  const [endYear, setEndYear] = useState(initialData?.endYear || '2028');
  const [status, setStatus] = useState<'active' | 'graduated' | 'upcoming'>(
    initialData?.status || 'active'
  );
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKhmer.trim()) return;
    onSave({
      nameKhmer,
      nameEn: nameEn || `Generation ${nameKhmer.replace(/\D/g, '')}`,
      startYear,
      endYear,
      status,
      description
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#121215] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {initialData ? 'កែប្រែព័ត៌មានជំនាន់' : 'បង្កើតជំនាន់សិក្សាថ្មី'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              ឈ្មោះជំនាន់ជាភាសាខ្មែរ * (ឧ. ជំនាន់ទី ៤)
            </label>
            <input
              type="text"
              required
              value={nameKhmer}
              onChange={(e) => setNameKhmer(e.target.value)}
              placeholder="ជំនាន់ទី ៤"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              ឈ្មោះជំនាន់ជាឡាតាំង (ឧ. Generation 4)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Generation 4"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                ឆ្នាំចាប់ផ្តើម
              </label>
              <input
                type="text"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                placeholder="2024"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                ឆ្នាំបញ្ចប់ការសិក្សា
              </label>
              <input
                type="text"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                placeholder="2028"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              ស្ថានភាពជំនាន់
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="active">កំពុងសិក្សា (Active)</option>
              <option value="graduated">បញ្ចប់ការសិក្សា (Graduated)</option>
              <option value="upcoming">គ្រោងទុក (Upcoming)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              កំណត់ចំណាំ
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ព័ត៌មានលម្អិតបន្ថែមអំពីជំនាន់នេះ..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              {initialData ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតជំនាន់'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// 2. Academic Year Modal
interface AcademicYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: AcademicYear | null;
  onSave: (data: Omit<AcademicYear, 'id'>) => void;
}

const AcademicYearModal: React.FC<AcademicYearModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave
}) => {
  const [nameKhmer, setNameKhmer] = useState(initialData?.nameKhmer || '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || '2026-08-01');
  const [endDate, setEndDate] = useState(initialData?.endDate || '2027-07-31');
  const [isCurrent, setIsCurrent] = useState(initialData?.isCurrent || false);
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKhmer.trim()) return;
    onSave({
      nameKhmer,
      nameEn: nameEn || `Academic Year ${nameKhmer}`,
      startDate,
      endDate,
      isCurrent,
      description
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#121215] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {initialData ? 'កែប្រែឆ្នាំសិក្សា' : 'បង្កើតឆ្នាំសិក្សា / វគ្គថ្មី'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              ឈ្មោះឆ្នាំសិក្សា * (ឧ. 2026-2027)
            </label>
            <input
              type="text"
              required
              value={nameKhmer}
              onChange={(e) => setNameKhmer(e.target.value)}
              placeholder="2026-2027"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              ឈ្មោះជាឡាតាំង (ឧ. Academic Year 2026-2027)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Academic Year 2026-2027"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                កាលបរិច្ឆេទចាប់ផ្តើម
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                កាលបរិច្ឆេទបញ្ចប់
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <input
              type="checkbox"
              id="isCurrentYear"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isCurrentYear" className="text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
              កំណត់ជាឆ្នាំសិក្សាបច្ចុប្បន្នដែលកំពុងដំណើរការ (Current Academic Year)
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              កំណត់ចំណាំ
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ព័ត៌មានលម្អិតបន្ថែម..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              {initialData ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតឆ្នាំសិក្សា'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// 3. Year Level Modal
interface YearLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: YearLevel | null;
  onSave: (data: Omit<YearLevel, 'id'>) => void;
}

const YearLevelModal: React.FC<YearLevelModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave
}) => {
  const [nameKhmer, setNameKhmer] = useState(initialData?.nameKhmer || '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn || '');
  const [levelNumber, setLevelNumber] = useState(initialData?.levelNumber || 1);
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKhmer.trim()) return;
    onSave({
      nameKhmer,
      nameEn: nameEn || `Year ${levelNumber}`,
      levelNumber: Number(levelNumber),
      description
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#121215] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {initialData ? 'កែប្រែកម្រិតឆ្នាំ' : 'បង្កើតកម្រិតឆ្នាំសិក្សាថ្មី'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              ឈ្មោះកម្រិតឆ្នាំជាភាសាខ្មែរ * (ឧ. ឆ្នាំទី ៤)
            </label>
            <input
              type="text"
              required
              value={nameKhmer}
              onChange={(e) => setNameKhmer(e.target.value)}
              placeholder="ឆ្នាំទី ៤"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                ឈ្មោះជាឡាតាំង (ឧ. Year 4)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Year 4 (Senior)"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                លំដាប់កម្រិតឆ្នាំ (1-4)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={levelNumber}
                onChange={(e) => setLevelNumber(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              កំណត់ចំណាំ / មុខវិជ្ជាស្នូល
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ព័ត៌មានលម្អិតបន្ថែម..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
            >
              {initialData ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតកម្រិតឆ្នាំ'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// 4. Semester Modal
interface SemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Semester | null;
  onSave: (data: Omit<Semester, 'id'>) => void;
}

const SemesterModal: React.FC<SemesterModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave
}) => {
  const [nameKhmer, setNameKhmer] = useState(initialData?.nameKhmer || '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn || '');
  const [semesterNumber, setSemesterNumber] = useState(initialData?.semesterNumber || 1);
  const [isCurrent, setIsCurrent] = useState(initialData?.isCurrent || false);
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKhmer.trim()) return;
    onSave({
      nameKhmer,
      nameEn: nameEn || `Semester ${semesterNumber}`,
      semesterNumber: Number(semesterNumber),
      isCurrent,
      description
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#121215] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-sky-500/10 text-sky-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {initialData ? 'កែប្រែព័ត៌មានឆមាស' : 'បង្កើតឆមាសថ្មី'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              ឈ្មោះឆមាសជាភាសាខ្មែរ * (ឧ. ឆមាសទី ១)
            </label>
            <input
              type="text"
              required
              value={nameKhmer}
              onChange={(e) => setNameKhmer(e.target.value)}
              placeholder="ឆមាសទី ១"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                ឈ្មោះជាឡាតាំង (ឧ. Semester 1)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Semester 1"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                លេខឆមាស (1-3)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={semesterNumber}
                onChange={(e) => setSemesterNumber(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <input
              type="checkbox"
              id="isCurrentSemester"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isCurrentSemester" className="text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
              កំណត់ជាឆមាសបច្ចុប្បន្នដែលកំពុងរៀន (Current Semester)
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              កំណត់ចំណាំ
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ព័ត៌មានលម្អិតបន្ថែម..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold"
            >
              {initialData ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតឆមាស'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
