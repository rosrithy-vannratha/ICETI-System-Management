import React, { useState, useEffect } from 'react';
import { ClassRoom, Major } from '../types';
import { X, BookOpen, User, DoorOpen, Calendar, Layers, Clock, Award, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveClass: (classData: Omit<ClassRoom, 'id'>, editId?: string) => void;
  initialData?: ClassRoom | null;
  majors?: Major[];
}

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  isOpen,
  onClose,
  onSaveClass,
  initialData,
  majors = []
}) => {
  const isEditing = Boolean(initialData);

  const [nameKhmer, setNameKhmer] = useState('');
  const [grade, setGrade] = useState('ឆ្នាំទី ១');
  const [shift, setShift] = useState('ព្រឹក (Morning)');
  const [major, setMajor] = useState('គរុកោសល្យភាសាចិន');
  const [generation, setGeneration] = useState('ជំនាន់ទី ៤');
  const [semester, setSemester] = useState('ឆមាសទី ១');
  const [roomNumber, setRoomNumber] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [totalStudents, setTotalStudents] = useState<number>(30);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setNameKhmer(initialData.nameKhmer || '');
      setGrade(initialData.grade || 'ឆ្នាំទី ១');
      setShift(initialData.shift || 'ព្រឹក (Morning)');
      setMajor(initialData.major || (majors.length > 0 ? majors[0].nameKhmer : 'គរុកោសល្យភាសាចិន'));
      setGeneration(initialData.generation || 'ជំនាន់ទី ៤');
      setSemester(initialData.semester || 'ឆមាសទី ១');
      setRoomNumber(initialData.roomNumber || '');
      setTeacherName(initialData.teacherName || '');
      setAcademicYear(initialData.academicYear || '2026-2027');
      setTotalStudents(initialData.totalStudents || 30);
    } else {
      setNameKhmer('');
      setGrade('ឆ្នាំទី ១');
      setShift('ព្រឹក (Morning)');
      setMajor(majors.length > 0 ? majors[0].nameKhmer : 'គរុកោសល្យភាសាចិន');
      setGeneration('ជំនាន់ទី ៤');
      setSemester('ឆមាសទី ១');
      setRoomNumber('ICETI-101');
      setTeacherName('');
      setAcademicYear('2026-2027');
      setTotalStudents(30);
    }
    setErrors({});
  }, [initialData, isOpen, majors]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!nameKhmer.trim()) {
      newErrors.nameKhmer = 'សូមបញ្ចូលឈ្មោះថ្នាក់រៀន';
    }
    if (!teacherName.trim()) {
      newErrors.teacherName = 'សូមបញ្ចូលឈ្មោះគ្រូបន្ទុកថ្នាក់';
    }
    if (!roomNumber.trim()) {
      newErrors.roomNumber = 'សូមបញ្ចូលលេខបន្ទប់';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSaveClass(
      {
        nameKhmer: nameKhmer.trim(),
        grade,
        shift,
        major,
        generation,
        semester,
        roomNumber: roomNumber.trim(),
        teacherName: teacherName.trim(),
        totalStudents: Number(totalStudents) || 0,
        academicYear: academicYear.trim()
      },
      initialData?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 my-8 overflow-hidden"
      >
        <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/80">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block">
                {isEditing ? 'EDIT CLASSROOM' : 'NEW CLASSROOM'}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white">
                {isEditing ? 'កែប្រែព័ត៌មានថ្នាក់រៀន' : 'បង្កើតថ្នាក់រៀនថ្មី (New Classroom)'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Class Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              ឈ្មោះថ្នាក់រៀន <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nameKhmer}
              onChange={(e) => {
                setNameKhmer(e.target.value);
                if (errors.nameKhmer) setErrors((prev) => ({ ...prev, nameKhmer: '' }));
              }}
              placeholder="ឧទាហរណ៍៖ ថ្នាក់គរុកោសល្យ ឆ្នាំទី១ ក"
              className={`w-full bg-zinc-100 dark:bg-zinc-900 border rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                errors.nameKhmer
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-zinc-200 dark:border-zinc-700 focus:border-indigo-500'
              }`}
            />
            {errors.nameKhmer && (
              <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.nameKhmer}</p>
            )}
          </div>

          {/* Grade Level & Shift (វេនសិក្សា) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>កម្រិតថ្នាក់ / ឆ្នាំ</span> <span className="text-rose-500">*</span>
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:border-indigo-500 outline-none cursor-pointer transition-all"
              >
                <option value="ឆ្នាំទី ១">ឆ្នាំទី ១ (Year 1)</option>
                <option value="ឆ្នាំទី ២">ឆ្នាំទី ២ (Year 2)</option>
                <option value="ឆ្នាំទី ៣">ឆ្នាំទី ៣ (Year 3)</option>
                <option value="ឆ្នាំទី ៤">ឆ្នាំទី ៤ (Year 4)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>វេនសិក្សា (Study Shift)</span> <span className="text-rose-500">*</span>
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:border-indigo-500 outline-none cursor-pointer transition-all"
              >
                <option value="ព្រឹក (Morning)">ព្រឹក (Morning)</option>
                <option value="រសៀល (Afternoon)">រសៀល (Afternoon)</option>
                <option value="យប់ (Evening)">យប់ (Evening)</option>
                <option value="ចុងសប្តាហ៍ (Weekend)">ចុងសប្តាហ៍ (Weekend)</option>
              </select>
            </div>
          </div>

          {/* Major & Generation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-500" />
                <span>ជំនាញ (Major)</span>
              </label>
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:border-indigo-500 outline-none cursor-pointer transition-all"
              >
                {majors.length > 0 ? (
                  majors.map((m) => (
                    <option key={m.id} value={m.nameKhmer}>
                      {m.nameKhmer}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="គរុកោសល្យភាសាចិន">គរុកោសល្យភាសាចិន</option>
                    <option value="ភាសាចិនពាណិជ្ជកម្ម">ភាសាចិនពាណិជ្ជកម្ម</option>
                    <option value="បកប្រែភាសាចិន">បកប្រែភាសាចិន</option>
                    <option value="ភាសាចិនទូទៅ">ភាសាចិនទូទៅ</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>ជំនាន់ (Generation)</span>
              </label>
              <select
                value={generation}
                onChange={(e) => setGeneration(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:border-indigo-500 outline-none cursor-pointer transition-all"
              >
                <option value="ជំនាន់ទី ៤">ជំនាន់ទី ៤</option>
                <option value="ជំនាន់ទី ៣">ជំនាន់ទី ៣</option>
                <option value="ជំនាន់ទី ២">ជំនាន់ទី ២</option>
                <option value="ជំនាន់ទី ១">ជំនាន់ទី ១</option>
              </select>
            </div>
          </div>

          {/* Teacher Name & Room Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span>គ្រូបន្ទុកថ្នាក់</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => {
                  setTeacherName(e.target.value);
                  if (errors.teacherName) setErrors((prev) => ({ ...prev, teacherName: '' }));
                }}
                placeholder="ឧ. សាស្ត្រាចារ្យ សុខ វិបុល"
                className={`w-full bg-zinc-100 dark:bg-zinc-900 border rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  errors.teacherName
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-zinc-200 dark:border-zinc-700 focus:border-indigo-500'
                }`}
              />
              {errors.teacherName && (
                <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.teacherName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5 text-teal-500" />
                <span>លេខបន្ទប់សិក្សា</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => {
                  setRoomNumber(e.target.value);
                  if (errors.roomNumber) setErrors((prev) => ({ ...prev, roomNumber: '' }));
                }}
                placeholder="ឧ. ICETI-201"
                className={`w-full bg-zinc-100 dark:bg-zinc-900 border rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  errors.roomNumber
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-zinc-200 dark:border-zinc-700 focus:border-indigo-500'
                }`}
              />
              {errors.roomNumber && (
                <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.roomNumber}</p>
              )}
            </div>
          </div>

          {/* Academic Year & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ឆ្នាំសិក្សា
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026-2027"
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ចំណុះសិស្សរំពឹងទុក (នាក់)
              </label>
              <input
                type="number"
                min={1}
                max={150}
                value={totalStudents}
                onChange={(e) => setTotalStudents(Number(e.target.value) || 0)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតថ្នាក់រៀន'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
