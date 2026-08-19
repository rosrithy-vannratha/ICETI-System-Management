import React, { useState, useMemo } from 'react';
import { ClassRoom, Student } from '../types';
import {
  BookOpen,
  Users,
  CalendarCheck,
  User,
  DoorOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClassFormModal } from './ClassFormModal';

interface ClassesViewProps {
  classes: ClassRoom[];
  students: Student[];
  onSelectClassToRecord: (classId: string) => void;
  onAddClass?: (newClass: Omit<ClassRoom, 'id'>) => void;
  onUpdateClass?: (updatedClass: ClassRoom) => void;
  onDeleteClass?: (classId: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  classes,
  students,
  onSelectClassToRecord,
  onAddClass,
  onUpdateClass,
  onDeleteClass
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        cls.nameKhmer.toLowerCase().includes(q) ||
        cls.teacherName.toLowerCase().includes(q) ||
        cls.roomNumber.toLowerCase().includes(q) ||
        cls.grade.toLowerCase().includes(q);

      const matchGrade = selectedGrade === 'all' || cls.grade === selectedGrade;

      return matchSearch && matchGrade;
    });
  }, [classes, searchTerm, selectedGrade]);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassRoom) => {
    setEditingClass(cls);
    setIsFormModalOpen(true);
  };

  const handleSaveClass = (data: Omit<ClassRoom, 'id'>, editId?: string) => {
    if (editId && onUpdateClass) {
      onUpdateClass({
        ...data,
        id: editId
      });
    } else if (onAddClass) {
      onAddClass(data);
    }
  };

  const handleConfirmDelete = () => {
    if (classToDelete && onDeleteClass) {
      onDeleteClass(classToDelete.id);
    }
    setClassToDelete(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1440px] mx-auto pb-16">
      {/* Header Bento Tile */}
      <div className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block mb-1">
            CLASSROOM MANAGEMENT
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            គ្រប់គ្រងថ្នាក់រៀន
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            បង្កើត កែប្រែ និងលុបថ្នាក់រៀន ព្រមទាំងគ្រប់គ្រងព័ត៌មានគ្រូបន្ទុកថ្នាក់
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
            សរុប <span className="text-indigo-600 dark:text-indigo-400">{classes.length}</span> ថ្នាក់
          </div>

          {onAddClass && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>បង្កើតថ្នាក់រៀនថ្មី</span>
            </button>
          )}
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
            placeholder="ស្វែងរកតាមឈ្មោះថ្នាក់រៀន, គ្រូបន្ទុក, លេខបន្ទប់..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-zinc-400 transition-all"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white font-medium focus:border-indigo-500 outline-none cursor-pointer transition-all"
          >
            <option value="all">គ្រប់កម្រិតថ្នាក់/ឆ្នាំ (All Grades)</option>
            <option value="ឆ្នាំទី ១">ឆ្នាំទី ១ (Year 1)</option>
            <option value="ឆ្នាំទី ២">ឆ្នាំទី ២ (Year 2)</option>
            <option value="ឆ្នាំទី ៣">ឆ្នាំទី ៣ (Year 3)</option>
            <option value="ឆ្នាំទី ៤">ឆ្នាំទី ៤ (Year 4)</option>
          </select>
        </div>
      </div>

      {/* Classroom Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-[#121215] rounded-3xl p-12 text-center border border-zinc-200 dark:border-zinc-800 text-zinc-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              {classes.length === 0
                ? 'មិនទាន់មានថ្នាក់រៀនក្នុងប្រព័ន្ធនៅឡើយទេ។'
                : 'ពុំមានថ្នាក់រៀនត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះឡើយ។'}
            </p>
            {onAddClass && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                + ចុចទីនេះដើម្បីបង្កើតថ្នាក់រៀនថ្មី
              </button>
            )}
          </div>
        ) : (
          filteredClasses.map((cls, idx) => {
            const enrolledCount = students.filter(
              (s) => s.classId === cls.id || s.className === cls.nameKhmer
            ).length;
            const rates = [96, 92, 95, 94, 91, 98];
            const todayRate = rates[idx % rates.length];

            return (
              <motion.div
                key={cls.id}
                whileHover={{ y: -3 }}
                className="bg-white dark:bg-[#121215] rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Top Bar: Icon, Attendance Rate & Action Menu */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-[11px] font-bold">
                        {cls.grade}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Button */}
                      {onUpdateClass && (
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cls)}
                          className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
                          title="កែប្រែព័ត៌មានថ្នាក់រៀន"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete Button */}
                      {onDeleteClass && (
                        <button
                          type="button"
                          onClick={() => setClassToDelete(cls)}
                          className="p-2 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                          title="លុបថ្នាក់រៀននេះ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                    {cls.nameKhmer}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4">
                    ឆ្នាំសិក្សា {cls.academicYear || '2026-2027'} • បន្ទប់ {cls.roomNumber}
                  </p>

                  <div className="space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-zinc-400" />
                        <span>គ្រូបន្ទុកថ្នាក់</span>
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {cls.teacherName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span>ចំនួនសិស្សជាក់ស្តែង</span>
                      </span>
                      <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60">
                        {enrolledCount} នាក់ {cls.totalStudents ? `/ ${cls.totalStudents}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <DoorOpen className="w-4 h-4 text-zinc-400" />
                        <span>បន្ទប់សិក្សា</span>
                      </span>
                      <span className="font-semibold font-mono text-zinc-700 dark:text-zinc-300">
                        {cls.roomNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => onSelectClassToRecord(cls.id)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/25 cursor-pointer active:scale-95"
                  >
                    <CalendarCheck className="w-4 h-4 stroke-[2.2]" />
                    <span>កត់ត្រាវត្តមានថ្នាក់នេះ</span>
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal: Create / Edit Class */}
      <ClassFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingClass(null);
        }}
        onSaveClass={handleSaveClass}
        initialData={editingClass}
      />

      {/* Confirmation Dialog: Delete Class */}
      <AnimatePresence>
        {classToDelete && (
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
                លុបថ្នាក់រៀន?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                តើអ្នកប្រាកដជាចង់លុបថ្នាក់ <strong className="text-zinc-900 dark:text-white">«{classToDelete.nameKhmer}»</strong> ចេញពីប្រព័ន្ធមែនទេ?
              </p>

              {students.some((s) => s.classId === classToDelete.id || s.className === classToDelete.nameKhmer) && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-xs mb-5 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    ចំណាំ៖ មានសិស្សចំនួន <strong>{students.filter((s) => s.classId === classToDelete.id || s.className === classToDelete.nameKhmer).length} នាក់</strong> កំពុងស្ថិតក្នុងថ្នាក់នេះ។
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setClassToDelete(null)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-rose-500/25 cursor-pointer active:scale-95"
                >
                  បាទ/ចាស លុបថ្នាក់នេះ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
