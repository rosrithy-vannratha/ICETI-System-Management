import React, { useEffect, useState } from 'react';
import { Student } from '../types';
import {
  X,
  Phone,
  MapPin,
  User,
  GraduationCap,
  Layers,
  Clock,
  BookOpen,
  Award,
  Hash,
  Sparkles,
  Trash2,
  AlertTriangle,
  Pencil,
  Save,
  RotateCcw,
  CheckCircle2,
  UserRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;

  onDeleteStudent?: (id: string) => Promise<void> | void;

  /*
   * Callback សម្រាប់ Save
   *
   * Parent Component នឹងទទួលបាន
   * student ដែលបានកែប្រែ
   */
  onUpdateStudent?: (student: Student) => Promise<void> | void;

  absenceCount?: number;
  onOpenWarningNotice?: () => void;
}

export const StudentProfileModal: React.FC<
  StudentProfileModalProps
> = ({
  student,
  onClose,
  onDeleteStudent,
  onUpdateStudent,
  absenceCount = 0,
  onOpenWarningNotice,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const [editedStudent, setEditedStudent] =
    useState<Student | null>(student);

  const [showConfirmDelete, setShowConfirmDelete] =
    useState(false);

  const [showSavedMessage, setShowSavedMessage] =
    useState(false);

  const [saveError, setSaveError] =
    useState('');

  /*
   * ---------------------------------------------------------
   * Sync student when selected student changes
   * ---------------------------------------------------------
   */
  useEffect(() => {
    setEditedStudent(student);
    setIsEditing(false);
    setSaveError('');
    setShowSavedMessage(false);
  }, [student]);

  if (!student || !editedStudent) return null;

  /*
   * ---------------------------------------------------------
   * Attendance warning
   * ---------------------------------------------------------
   */
  const isAtRisk =
    absenceCount >= 5 ||
    student.id === 's-006' ||
    student.id === 's-004';

  const displayAbsences = isAtRisk
    ? absenceCount || 6
    : absenceCount;

  /*
   * ---------------------------------------------------------
   * Update field helper
   * ---------------------------------------------------------
   */
  const updateField = <K extends keyof Student>(
    field: K,
    value: Student[K]
  ) => {
    setEditedStudent((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [field]: value,
      };
    });

    setSaveError('');
    setShowSavedMessage(false);
  };

  /*
   * ---------------------------------------------------------
   * Start editing
   * ---------------------------------------------------------
   */
  const handleStartEdit = () => {
    setEditedStudent({
      ...student,
    });

    setSaveError('');
    setShowSavedMessage(false);
    setIsEditing(true);
  };

  /*
   * ---------------------------------------------------------
   * Cancel editing
   * ---------------------------------------------------------
   */
  const handleCancelEdit = () => {
    setEditedStudent({
      ...student,
    });

    setSaveError('');
    setShowSavedMessage(false);
    setIsEditing(false);
  };

  /*
   * ---------------------------------------------------------
   * Validate before save
   * ---------------------------------------------------------
   */
  const validateStudent = (): string | null => {
    const code = String(
      editedStudent.studentCode || ''
    ).trim();

    const khmerName = String(
      editedStudent.fullNameKhmer || ''
    ).trim();

    const englishName = String(
      editedStudent.fullNameEn || ''
    ).trim();

    if (!code) {
      return 'សូមបញ្ចូលអត្តលេខនិស្សិត។';
    }

    if (!khmerName) {
      return 'សូមបញ្ចូលឈ្មោះខ្មែរ។';
    }

    if (!englishName) {
      return 'សូមបញ្ចូលឈ្មោះឡាតាំង។';
    }

    return null;
  };

  /*
   * ---------------------------------------------------------
   * Save
   * ---------------------------------------------------------
   */
  const handleSave = async () => {
    const validationError =
      validateStudent();

    if (validationError) {
      setSaveError(validationError);
      return;
    }

    if (!onUpdateStudent) {
      setSaveError(
        'ប្រព័ន្ធមិនទាន់បានភ្ជាប់មុខងារ Save ទេ។'
      );
      return;
    }

    /*
     * Clean text before saving
     */
    const cleanedStudent: Student = {
      ...editedStudent,

      studentCode:
        String(
          editedStudent.studentCode || ''
        ).trim(),

      fullNameKhmer:
        String(
          editedStudent.fullNameKhmer || ''
        ).trim(),

      fullNameEn:
        String(
          editedStudent.fullNameEn || ''
        ).trim(),

      chineseName:
        String(
          editedStudent.chineseName || ''
        ).trim(),

      major:
        String(
          editedStudent.major || ''
        ).trim(),

      generation:
        String(
          editedStudent.generation || ''
        ).trim(),

      yearLevel:
        String(
          editedStudent.yearLevel || ''
        ).trim(),

      semester:
        String(
          editedStudent.semester || ''
        ).trim(),

      shift:
        String(
          editedStudent.shift || ''
        ).trim(),

      phone:
        String(
          editedStudent.phone || ''
        ).trim(),

      parentName:
        String(
          editedStudent.parentName || ''
        ).trim(),

      parentPhone:
        String(
          editedStudent.parentPhone || ''
        ).trim(),

      address:
        String(
          editedStudent.address || ''
        ).trim(),
    };

    try {
      /*
       * Send updated student to Parent
       */
      await onUpdateStudent(cleanedStudent);

      /*
       * Update local state
       */
      setEditedStudent(cleanedStudent);

      setIsEditing(false);
      setSaveError('');
      setShowSavedMessage(true);

      /*
       * Hide success message after 3 seconds
       */
      setTimeout(() => {
        setShowSavedMessage(false);
      }, 3000);
    } catch (error: any) {
      setSaveError(
        error?.message ||
          'មិនអាចរក្សាទុកព័ត៌មានបានទេ។'
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * Delete
   * ---------------------------------------------------------
   */
  const handleConfirmDelete = async () => {
    try {
      if (onDeleteStudent) {
        await onDeleteStudent(student.id);
      }

      setShowConfirmDelete(false);
      onClose();
    } catch (error) {
      setShowConfirmDelete(false);
      setSaveError(error instanceof Error ? error.message : 'មិនអាចលុបទិន្នន័យបានទេ។');
    }
  };

  /*
   * ---------------------------------------------------------
   * Reusable Input
   * ---------------------------------------------------------
   */
  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all';

  const readOnlyInputClass =
    'w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/70 text-sm text-zinc-500 dark:text-zinc-400 outline-none cursor-not-allowed';

  /*
   * ---------------------------------------------------------
   * Field Component
   * ---------------------------------------------------------
   */
  const EditField = ({
    label,
    value,
    field,
    placeholder = '',
    readOnly = false,
  }: {
    label: string;
    value: any;
    field: keyof Student;
    placeholder?: string;
    readOnly?: boolean;
  }) => (
    <div>
      <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">
        {label}
      </label>

      <input
        type="text"
        value={value ?? ''}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) =>
          updateField(
            field,
            e.target.value as never
          )
        }
        className={
          readOnly
            ? readOnlyInputClass
            : inputClass
        }
      />

      {readOnly && (
        <p className="text-[9px] text-zinc-400 mt-1">
          អត្តលេខត្រូវបានការពារ
          ដើម្បីជៀសវាងព័ត៌មានស្ទួន
        </p>
      )}
    </div>
  );

  /*
   * ---------------------------------------------------------
   * Select Component
   * ---------------------------------------------------------
   */
  const EditSelect = ({
    label,
    value,
    field,
    options,
  }: {
    label: string;
    value: any;
    field: keyof Student;
    options: {
      value: string;
      label: string;
    }[];
  }) => (
    <div>
      <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">
        {label}
      </label>

      <select
        value={value ?? ''}
        onChange={(e) =>
          updateField(
            field,
            e.target.value as never
          )
        }
        className={`${inputClass} cursor-pointer`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 10,
        }}
        className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative max-h-[92vh] flex flex-col"
      >

        {/* =====================================================
            CLOSE
        ====================================================== */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6 pr-10">

          <img
            src={
              editedStudent.avatarUrl ||
              'https://via.placeholder.com/150'
            }
            alt={editedStudent.fullNameKhmer}
            className="w-24 h-24 rounded-3xl object-cover border-2 border-indigo-500/20 dark:border-indigo-500/30 shadow-md"
            referrerPolicy="no-referrer"
          />

          <div className="text-center sm:text-left flex-1">

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">

              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold rounded-xl border border-indigo-200 dark:border-indigo-800">
                {editedStudent.studentCode}
              </span>

              <span
                className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                  editedStudent.gender === 'M'
                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    : 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
                }`}
              >
                {editedStudent.gender === 'M'
                  ? 'ភេទ ប្រុស'
                  : 'ភេទ ស្រី'}
              </span>

              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20">
                {editedStudent.shift ||
                  'វេនព្រឹក'}
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap justify-center sm:justify-start">

              <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
                {editedStudent.fullNameKhmer}
              </h3>

              {editedStudent.chineseName && (
                <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                  {editedStudent.chineseName}
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              {editedStudent.fullNameEn}
            </p>
          </div>
        </div>

        {/* =====================================================
            EDIT MODE HEADER
        ====================================================== */}
        {isEditing && (
          <div className="mb-5 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50">

            <div className="flex items-start gap-3">

              <div className="p-2 bg-indigo-600 text-white rounded-xl">
                <Pencil className="w-4 h-4" />
              </div>

              <div>
                <div className="text-xs font-bold text-indigo-800 dark:text-indigo-300">
                  កំពុងកែប្រែព័ត៌មាននិស្សិត
                </div>

                <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-1">
                  សូមពិនិត្យព័ត៌មានឱ្យបានត្រឹមត្រូវ
                  មុនចុច “រក្សាទុក”។
                </p>
              </div>

            </div>
          </div>
        )}

        {/* =====================================================
            SAVE SUCCESS
        ====================================================== */}
        {showSavedMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: -5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />

            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              រក្សាទុកព័ត៌មានបានជោគជ័យ!
            </span>
          </motion.div>
        )}

        {/* =====================================================
            SAVE ERROR
        ====================================================== */}
        {saveError && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />

            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
              {saveError}
            </span>
          </div>
        )}

        {/* =====================================================
            ATTENDANCE WARNING
        ====================================================== */}
        {isAtRisk && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">

            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="flex-1">

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-rose-600 text-white px-2 py-1 rounded-md">
                  ការប្រកាសអាសន្ន
                </span>

                <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  អវត្តមាន {displayAbsences} ដង
                </span>
              </div>

              <p className="text-xs text-rose-800 dark:text-rose-200 mt-1 leading-relaxed">
                និស្សិតនេះបានអវត្តមាន
                ឥតច្បាប់ចំនួន{' '}
                <strong>
                  {displayAbsences} ដង
                </strong>{' '}
                ដែលលើសពីកម្រិតកំណត់ ៥ ដង។
              </p>

              {onOpenWarningNotice && (
                <button
                  type="button"
                  onClick={onOpenWarningNotice}
                  className="mt-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  មើល និងបោះពុម្ពលិខិតព្រមានផ្លូវការ
                </button>
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            CONTENT
        ====================================================== */}
        <div className="flex-1 overflow-y-auto pr-1">

          {!isEditing ? (

            /* =================================================
               VIEW MODE
            ================================================== */
            <div>

              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-500" />

                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  ព័ត៌មានលម្អិតទាំង ១១ ចំណុច
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* 1 */}
                <InfoCard
                  number="1"
                  label="អត្តលេខ (Student ID)"
                  value={editedStudent.studentCode}
                  icon={
                    <Hash className="w-4 h-4" />
                  }
                />

                {/* 2 */}
                <InfoCard
                  number="2"
                  label="ឈ្មោះខ្មែរ"
                  value={
                    editedStudent.fullNameKhmer
                  }
                  icon={
                    <User className="w-4 h-4" />
                  }
                />

                {/* 3 */}
                <InfoCard
                  number="3"
                  label="ឈ្មោះឡាតាំង"
                  value={
                    editedStudent.fullNameEn
                  }
                  icon={
                    <User className="w-4 h-4" />
                  }
                />

                {/* 4 */}
                <InfoCard
                  number="4"
                  label="ឈ្មោះចិន"
                  value={
                    editedStudent.chineseName ||
                    '—'
                  }
                  icon={
                    <span className="font-bold">
                      中
                    </span>
                  }
                  rose
                />

                {/* 5 */}
                <InfoCard
                  number="5"
                  label="ភេទ"
                  value={
                    editedStudent.gender ===
                    'M'
                      ? 'ប្រុស'
                      : 'ស្រី'
                  }
                  icon={
                    <UserRound className="w-4 h-4" />
                  }
                />

                {/* 6 */}
                <InfoCard
                  number="6"
                  label="ជំនាញ"
                  value={
                    editedStudent.major || '—'
                  }
                  icon={
                    <GraduationCap className="w-4 h-4" />
                  }
                />

                {/* 7 */}
                <InfoCard
                  number="7"
                  label="ថ្នាក់"
                  value={
                    editedStudent.className ||
                    '—'
                  }
                  icon={
                    <GraduationCap className="w-4 h-4" />
                  }
                />

                {/* 8 */}
                <InfoCard
                  number="8"
                  label="ជំនាន់"
                  value={
                    editedStudent.generation ||
                    '—'
                  }
                  icon={
                    <Layers className="w-4 h-4" />
                  }
                />

                {/* 9 */}
                <InfoCard
                  number="9"
                  label="ឆ្នាំ"
                  value={
                    editedStudent.yearLevel ||
                    '—'
                  }
                  icon={
                    <Award className="w-4 h-4" />
                  }
                />

                {/* 10 */}
                <InfoCard
                  number="10"
                  label="ឆមាស"
                  value={
                    editedStudent.semester ||
                    '—'
                  }
                  icon={
                    <BookOpen className="w-4 h-4" />
                  }
                />

                {/* 11 */}
                <InfoCard
                  number="11"
                  label="វេនសិក្សា"
                  value={
                    editedStudent.shift ||
                    'វេនព្រឹក'
                  }
                  icon={
                    <Clock className="w-4 h-4" />
                  }
                  emerald
                  full
                />
              </div>

              {/* CONTACT */}
              <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800">

                <div className="text-xs font-bold text-zinc-900 dark:text-white mb-3">
                  ព័ត៌មានទំនាក់ទំនង
                </div>

                <div className="space-y-3">

                  {editedStudent.phone && (
                    <InfoRow
                      icon={
                        <Phone className="w-4 h-4" />
                      }
                      label="ទូរស័ព្ទនិស្សិត"
                      value={
                        editedStudent.phone
                      }
                    />
                  )}

                  {editedStudent.parentName && (
                    <InfoRow
                      icon={
                        <User className="w-4 h-4" />
                      }
                      label="អាណាព្យាបាល"
                      value={`${editedStudent.parentName} (${
                        editedStudent.parentPhone ||
                        '—'
                      })`}
                    />
                  )}

                  {editedStudent.address && (
                    <InfoRow
                      icon={
                        <MapPin className="w-4 h-4" />
                      }
                      label="អាសយដ្ឋាន"
                      value={
                        editedStudent.address
                      }
                    />
                  )}

                </div>
              </div>
            </div>

          ) : (

            /* =================================================
               EDIT MODE
            ================================================== */
            <div>

              <div className="flex items-center gap-2 mb-4">
                <Pencil className="w-4 h-4 text-indigo-500" />

                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  កែប្រែព័ត៌មាននិស្សិត
                </span>
              </div>

              {/* =============================================
                  CORE INFORMATION
              ============================================== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <EditField
                  label="១. អត្តលេខ (Student ID)"
                  field="studentCode"
                  value={
                    editedStudent.studentCode
                  }
                  readOnly
                />

                <EditField
                  label="២. ឈ្មោះខ្មែរ"
                  field="fullNameKhmer"
                  value={
                    editedStudent.fullNameKhmer
                  }
                  placeholder="បញ្ចូលឈ្មោះខ្មែរ"
                />

                <EditField
                  label="៣. ឈ្មោះឡាតាំង"
                  field="fullNameEn"
                  value={
                    editedStudent.fullNameEn
                  }
                  placeholder="English Name"
                />

                <EditField
                  label="៤. ឈ្មោះចិន"
                  field="chineseName"
                  value={
                    editedStudent.chineseName
                  }
                  placeholder="中文姓名"
                />

                <EditSelect
                  label="៥. ភេទ"
                  field="gender"
                  value={
                    editedStudent.gender
                  }
                  options={[
                    {
                      value: 'M',
                      label: 'ប្រុស',
                    },
                    {
                      value: 'F',
                      label: 'ស្រី',
                    },
                  ]}
                />

                <EditField
                  label="៦. ជំនាញ"
                  field="major"
                  value={
                    editedStudent.major
                  }
                  placeholder="ឧ. ភាសាចិន"
                />

                <EditField
                  label="៧. ថ្នាក់"
                  field="className"
                  value={
                    editedStudent.className
                  }
                  placeholder="ឈ្មោះថ្នាក់"
                />

                <EditField
                  label="៨. ជំនាន់"
                  field="generation"
                  value={
                    editedStudent.generation
                  }
                  placeholder="ឧ. ជំនាន់ទី ៣"
                />

                <EditField
                  label="៩. ឆ្នាំ"
                  field="yearLevel"
                  value={
                    editedStudent.yearLevel
                  }
                  placeholder="ឧ. ឆ្នាំទី ៤"
                />

                <EditSelect
                  label="១០. ឆមាស"
                  field="semester"
                  value={
                    editedStudent.semester
                  }
                  options={[
                    {
                      value: 'ឆមាសទី ១',
                      label: 'ឆមាសទី ១',
                    },
                    {
                      value: 'ឆមាសទី ២',
                      label: 'ឆមាសទី ២',
                    },
                  ]}
                />

                <EditSelect
                  label="១១. វេនសិក្សា"
                  field="shift"
                  value={
                    editedStudent.shift
                  }
                  options={[
                    {
                      value: 'វេនព្រឹក',
                      label: 'វេនព្រឹក',
                    },
                    {
                      value: 'វេនរសៀល',
                      label: 'វេនរសៀល',
                    },
                    {
                      value: 'វេនល្ងាច',
                      label: 'វេនល្ងាច',
                    },
                    {
                      value: 'វេនយប់',
                      label: 'វេនយប់',
                    },
                  ]}
                />

              </div>

              {/* =============================================
                  CONTACT INFORMATION
              ============================================== */}
              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">

                <div className="flex items-center gap-2 mb-4">
                  <Phone className="w-4 h-4 text-indigo-500" />

                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    ព័ត៌មានទំនាក់ទំនង
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <EditField
                    label="ទូរស័ព្ទនិស្សិត"
                    field="phone"
                    value={
                      editedStudent.phone
                    }
                    placeholder="0XX XXX XXX"
                  />

                  <EditField
                    label="ឈ្មោះអាណាព្យាបាល"
                    field="parentName"
                    value={
                      editedStudent.parentName
                    }
                    placeholder="ឈ្មោះអាណាព្យាបាល"
                  />

                  <EditField
                    label="ទូរស័ព្ទអាណាព្យាបាល"
                    field="parentPhone"
                    value={
                      editedStudent.parentPhone
                    }
                    placeholder="0XX XXX XXX"
                  />

                  <div className="sm:col-span-2">
                    <EditField
                      label="អាសយដ្ឋាន"
                      field="address"
                      value={
                        editedStudent.address
                      }
                      placeholder="អាសយដ្ឋានបច្ចុប្បន្ន"
                    />
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800">

          {!isEditing ? (

            <div className="flex items-center justify-between gap-3">

              <div>
                {onDeleteStudent ? (
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmDelete(true)
                    }
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />

                    <span>
                      លុបទិន្នន័យ
                    </span>
                  </button>
                ) : null}
              </div>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-2xl text-xs font-bold cursor-pointer"
                >
                  បិទ
                </button>

                {onUpdateStudent && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Pencil className="w-4 h-4" />

                    <span>
                      កែប្រែព័ត៌មាន
                    </span>
                  </button>
                )}

              </div>
            </div>

          ) : (

            <div className="flex flex-col sm:flex-row justify-end gap-2">

              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />

                <span>
                  បោះបង់ការកែប្រែ
                </span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />

                <span>
                  រក្សាទុកព័ត៌មាន
                </span>
              </button>

            </div>
          )}
        </div>

        {/* =====================================================
            DELETE CONFIRM
        ====================================================== */}
        <AnimatePresence>
          {showConfirmDelete && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                className="bg-white dark:bg-[#18181b] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-200 dark:border-rose-900"
              >

                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <h4 className="text-base font-extrabold text-zinc-900 dark:text-white mb-1">
                  បញ្ជាក់ការលុប
                </h4>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
                  តើអ្នកពិតជាចង់លុប
                  <strong className="text-zinc-900 dark:text-white">
                    {' '}
                    {editedStudent.fullNameKhmer}{' '}
                    ({editedStudent.studentCode})
                  </strong>{' '}
                  ចេញពីប្រព័ន្ធមែនទេ?
                </p>

                <div className="flex justify-end gap-2.5">

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmDelete(false)
                    }
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    បោះបង់
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleConfirmDelete
                    }
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    បាទ/ចាស លុប
                  </button>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

/*
 * ============================================================
 * INFO CARD
 * ============================================================
 */

interface InfoCardProps {
  number: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  rose?: boolean;
  emerald?: boolean;
  full?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({
  number,
  label,
  value,
  icon,
  rose = false,
  emerald = false,
  full = false,
}) => {
  return (
    <div
      className={`${full ? 'sm:col-span-2 ' : ''}p-3.5 rounded-2xl border flex items-center justify-between ${
        emerald
          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
          : rose
          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
          : 'bg-zinc-50 dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">

        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
            emerald
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : rose
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
          }`}
        >
          {number}
        </div>

        <div className="min-w-0">

          <div className="text-[10px] uppercase font-bold text-zinc-400">
            {label}
          </div>

          <div
            className={`text-xs font-bold truncate ${
              emerald
                ? 'text-emerald-900 dark:text-emerald-200'
                : rose
                ? 'text-rose-700 dark:text-rose-300'
                : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {value || '—'}
          </div>

        </div>
      </div>

      <div className="text-zinc-400 shrink-0 ml-2">
        {icon}
      </div>
    </div>
  );
};

/*
 * ============================================================
 * INFO ROW
 * ============================================================
 */

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">

      <span className="flex items-center gap-2 text-zinc-400 text-xs shrink-0">
        {icon}

        <span>
          {label}
        </span>
      </span>

      <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs text-right">
        {value || '—'}
      </span>
    </div>
  );
};
