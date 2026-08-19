import React, { useState, useMemo } from 'react';
import { Major, Student } from '../types';
import {
  Award,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  Clock,
  BookOpen,
  AlertTriangle,
  Sparkles,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MajorFormModal } from './MajorFormModal';

interface MajorsViewProps {
  majors: Major[];
  students: Student[];
  onAddMajor: (newMajor: Omit<Major, 'id'>) => void;
  onUpdateMajor: (updatedMajor: Major) => void;
  onDeleteMajor: (majorId: string) => void;
}

export const MajorsView: React.FC<MajorsViewProps> = ({
  majors,
  students,
  onAddMajor,
  onUpdateMajor,
  onDeleteMajor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [majorToDelete, setMajorToDelete] = useState<Major | null>(null);

  const filteredMajors = useMemo(() => {
    return majors.filter((m) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        m.nameKhmer.toLowerCase().includes(q) ||
        (m.nameChinese && m.nameChinese.toLowerCase().includes(q)) ||
        (m.nameEn && m.nameEn.toLowerCase().includes(q)) ||
        m.code.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q));

      const matchDegree = selectedDegree === 'all' || m.degreeLevel === selectedDegree;

      return matchSearch && matchDegree;
    });
  }, [majors, searchTerm, selectedDegree]);

  const handleOpenAdd = () => {
    setEditingMajor(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (major: Major) => {
    setEditingMajor(major);
    setIsFormModalOpen(true);
  };

  const handleSaveMajor = (data: Omit<Major, 'id'>, editId?: string) => {
    if (editId) {
      onUpdateMajor({
        ...data,
        id: editId
      });
    } else {
      onAddMajor(data);
    }
  };

  const handleConfirmDelete = () => {
    if (majorToDelete) {
      onDeleteMajor(majorToDelete.id);
    }
    setMajorToDelete(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1440px] mx-auto pb-16">
      {/* Header Bento Tile */}
      <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block mb-1">
            ACADEMIC MAJORS & DISCIPLINES
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            គ្រប់គ្រងជំនាញសិក្សា
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            បង្កើត កែប្រែ និងលុបជំនាញបណ្តុះបណ្តាលរបស់វិទ្យាស្ថានគរុកោសល្យភាសាចិន
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
            សរុប <span className="text-indigo-600 dark:text-indigo-400">{majors.length}</span> ជំនាញ
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>បន្ថែមជំនាញថ្មី</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-[#121215] p-4 sm:p-5 rounded-3xl shadow-xs border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះជំនាញខ្មែរ, ឈ្មោះចិន (中文), កូដជំនាញ..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-zinc-400 transition-all"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedDegree}
            onChange={(e) => setSelectedDegree(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white font-medium focus:border-indigo-500 outline-none cursor-pointer transition-all"
          >
            <option value="all">គ្រប់កម្រិតសញ្ញាបត្រ (All Degrees)</option>
            <option value="បរិញ្ញាបត្រ (Bachelor)">បរិញ្ញាបត្រ (Bachelor)</option>
            <option value="បរិញ្ញាបត្រជាន់ខ្ពស់ (Master)">បរិញ្ញាបត្រជាន់ខ្ពស់ (Master)</option>
            <option value="បរិញ្ញាបត្ររង (Associate)">បរិញ្ញាបត្ររង (Associate)</option>
          </select>
        </div>
      </div>

      {/* Majors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredMajors.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-[#121215] rounded-3xl p-12 text-center border border-zinc-200 dark:border-zinc-800 text-zinc-400">
            <Award className="w-10 h-10 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              {majors.length === 0
                ? 'មិនទាន់មានជំនាញសិក្សាក្នុងប្រព័ន្ធនៅឡើយទេ។'
                : 'ពុំមានជំនាញត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះឡើយ។'}
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              + ចុចទីនេះដើម្បីបន្ថែមជំនាញថ្មី
            </button>
          </div>
        ) : (
          filteredMajors.map((major) => {
            const enrolledStudentsCount = students.filter(
              (s) => s.major === major.nameKhmer || s.major === major.code
            ).length;

            return (
              <motion.div
                key={major.id}
                whileHover={{ y: -3 }}
                className="bg-white dark:bg-[#121215] rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Top Bar: Code badge, Degree badge & Action buttons */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 rounded-xl text-xs font-mono font-bold">
                        {major.code}
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-[11px] font-bold">
                        {major.degreeLevel?.split(' ')[0] || 'បរិញ្ញាបត្រ'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(major)}
                        className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
                        title="កែប្រែព័ត៌មានជំនាញ"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setMajorToDelete(major)}
                        className="p-2 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                        title="លុបជំនាញនេះ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Major Title (Khmer, Chinese, English) */}
                  <div className="mb-3">
                    <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-1">
                      {major.nameKhmer}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {major.nameChinese && (
                        <span className="font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20 font-sans">
                          {major.nameChinese}
                        </span>
                      )}
                      {major.nameEn && (
                        <span className="text-xs text-zinc-400 font-medium">
                          {major.nameEn}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {major.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                      {major.description}
                    </p>
                  )}

                  {/* Meta stats */}
                  <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span>ចំនួននិស្សិតកំពុងសិក្សា</span>
                      </span>
                      <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60">
                        {enrolledStudentsCount} នាក់
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        <span>រយៈពេលសិក្សា</span>
                      </span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {major.durationYears || 4} ឆ្នាំ
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-zinc-400" />
                        <span>កម្រិតសញ្ញាបត្រ</span>
                      </span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {major.degreeLevel || 'បរិញ្ញាបត្រ'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(major)}
                    className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>កែប្រែព័ត៌មានជំនាញ</span>
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal: Create / Edit Major */}
      <MajorFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingMajor(null);
        }}
        onSaveMajor={handleSaveMajor}
        initialData={editingMajor}
      />

      {/* Confirmation Dialog: Delete Major */}
      <AnimatePresence>
        {majorToDelete && (
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
                លុបជំនាញសិក្សា?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                តើអ្នកប្រាកដជាចង់លុបជំនាញ <strong className="text-zinc-900 dark:text-white">«{majorToDelete.nameKhmer} ({majorToDelete.code})»</strong> ចេញពីប្រព័ន្ធមែនទេ?
              </p>

              {students.some((s) => s.major === majorToDelete.nameKhmer || s.major === majorToDelete.code) && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-xs mb-5 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    ចំណាំ៖ មានសិស្សចំនួន <strong>{students.filter((s) => s.major === majorToDelete.nameKhmer || s.major === majorToDelete.code).length} នាក់</strong> កំពុងចុះឈ្មោះរៀនជំនាញនេះ។
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setMajorToDelete(null)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-rose-500/25 cursor-pointer active:scale-95"
                >
                  បាទ/ចាស លុបជំនាញនេះ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
