import React, { useState } from 'react';
import { Student, ClassRoom, Major, Generation, YearLevel, Semester } from '../types';
import { X, UserPlus, User, Phone, MapPin, Calendar, GraduationCap, Layers, Award, BookOpen, Clock, Hash, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];
  majors?: Major[];
  generations?: Generation[];
  yearLevels?: YearLevel[];
  semesters?: Semester[];
  onAddStudent: (newStudent: Omit<Student, 'id'>) => Promise<void> | void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  classes,
  majors = [],
  generations = [],
  yearLevels = [],
  semesters = [],
  onAddStudent
}) => {
  // 11 Core fields
  const [studentCode, setStudentCode] = useState(`ICETI-2026${Math.floor(10 + Math.random() * 90)}`);
  const [fullNameKhmer, setFullNameKhmer] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [chineseName, setChineseName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [dob, setDob] = useState('2004-05-15');
  const [major, setMajor] = useState(majors[0]?.nameKhmer || 'គរុកោសល្យភាសាចិន');
  const [generation, setGeneration] = useState(generations[0]?.nameKhmer || 'ជំនាន់ទី ៣');
  const [yearLevel, setYearLevel] = useState(yearLevels[0]?.nameKhmer || 'ឆ្នាំទី ៤');
  const [semester, setSemester] = useState(semesters[0]?.nameKhmer || 'ឆមាសទី ១');
  const [shift, setShift] = useState('វេនព្រឹក');

  // Supplemental fields
  const [classId, setClassId] = useState(classes[0]?.id || 'c-12a');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameKhmer.trim()) return;

    const selectedClassObj = classes.find((c) => c.id === classId);
    const initialKhmer = fullNameKhmer.trim().slice(0, 2);

    const defaultAvatar =
      gender === 'M'
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKSsA5RfBKHnd9fKbBm7I7cwsmKGuy3n2lfoV7MnsdJuU_AgMa6wXcyB636GbFe3lJq7WedxR-G6gUFNhu4jfgE-Y_YbpQ31smyMc3DtSDPDs_LOxtOP7qiFxIxrCT9k8SoEjk45VRvG4lKu7XrYkAD3TBLBdwJNsPaYGhNgIPCyZxfABQDvacandQsEesgX9AuhzMLD9EPaAfWHlucdWOIYUftZAStrNAWY-eaAFnSm8mErVLf5Jq'
        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAigosMiuQAcOQlde05ZDHKu45HlEzY54FcwzwPGNaWP5pKYG6sH23tLJdSsCJrTyEgY8k96uVjfknEOv10-Z3WS134pOfiF1Z1DcoKaU3yX04qiU2jf6WRAAirQcVLurZjWjnR4jzezL3Ydu-NJZXcPlpghd88R5UJzmbYJBHDVmvblLxTVMAZR2kyf0o_uzBXxloZl37-Fn_luvPhHaTScFrVvZdIp8VDUxsHbma5b8jq1MyK2eEc';

    setIsSaving(true);
    setSubmitError('');
    try {
      await onAddStudent({
        studentCode,
        fullNameKhmer,
        fullNameEn: fullNameEn || fullNameKhmer,
        chineseName,
        gender,
        dob,
        major,
        generation,
        yearLevel,
        semester,
        shift,
        classId,
        className: selectedClassObj?.nameKhmer || 'ថ្នាក់គរុកោសល្យ ក',
        initialKhmer,
        avatarUrl: defaultAvatar,
        phone,
        parentName,
        parentPhone,
        address
      });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'មិនអាចរក្សាទុកនិស្សិតបានទេ។');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-5 border-b border-zinc-100 dark:border-zinc-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block">
                STUDENT ADMISSION
              </span>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                ចុះឈ្មោះសិស្សថ្មី (ព័ត៌មានទាំង ១១ ចំណុច)
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Names & Identity */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <User className="w-3.5 h-3.5" />
              <span>ព័ត៌មានអត្តសញ្ញាណ និងឈ្មោះ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* ១. អត្តលេខ */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ១. អត្តលេខ (Student ID) *
                </label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white font-mono font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>

              {/* ៥. ភេទ */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ៥. ភេទ (Gender) *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                >
                  <option value="M">ប្រុស (Male)</option>
                  <option value="F">ស្រី (Female)</option>
                </select>
              </div>

              {/* ២. ឈ្មោះខ្មែរ */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ២. ឈ្មោះខ្មែរ (Khmer Name) *
                </label>
                <input
                  type="text"
                  value={fullNameKhmer}
                  onChange={(e) => setFullNameKhmer(e.target.value)}
                  placeholder="ឧ. សុខ សាន្ត"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-zinc-400 transition-all"
                  required
                />
              </div>

              {/* ៣. ឈ្មោះឡាតាំង */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ៣. ឈ្មោះឡាតាំង (Latin Name)
                </label>
                <input
                  type="text"
                  value={fullNameEn}
                  onChange={(e) => setFullNameEn(e.target.value)}
                  placeholder="Ex. Sok Sant"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-zinc-400 transition-all"
                />
              </div>

              {/* ៤. ឈ្មោះចិន */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>៤. ឈ្មោះចិន (Chinese Name)</span>
                  <span className="text-[10px] text-rose-500 font-normal">中文姓名</span>
                </label>
                <input
                  type="text"
                  value={chineseName}
                  onChange={(e) => setChineseName(e.target.value)}
                  placeholder="ឧ. 孙小圣"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white font-sans focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-zinc-400 transition-all"
                />
              </div>

              {/* ៦. ថ្ងៃខែកំណើត */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ៦. ថ្ងៃខែកំណើត (DOB) *
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Program & Shift */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>ព័ត៌មានសិក្សា និងកម្មវិធី</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* ៧. ជំនាញ */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ៧. ជំនាញ (Major) *
                </label>
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                >
                  {majors.length > 0 ? (
                    majors.map((m) => (
                      <option key={m.id} value={m.nameKhmer}>
                        {m.nameKhmer} {m.nameChinese ? `(${m.nameChinese})` : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="គរុកោសល្យភាសាចិន">គរុកោសល្យភាសាចិន (Chinese international education)</option>
                      <option value="បកប្រែភាសាចិន">បកប្រែភាសាចិន (Chinese Translation)</option>
                      <option value="ពាណិជ្ជកម្មចិន">ពាណិជ្ជកម្មចិន (Business Chinese)</option>
                      <option value="ភាសាចិនទូទៅ">ភាសាចិនទូទៅ (General Chinese)</option>
                    </>
                  )}
                </select>
              </div>

              {/* ៨. ជំនាន់ */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ៨. ជំនាន់ (Generation) *
                </label>
                <select
                  value={generation}
                  onChange={(e) => setGeneration(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                >
                  {generations.length > 0 ? (
                    generations.map((g) => (
                      <option key={g.id} value={g.nameKhmer}>
                        {g.nameKhmer} {g.nameEn ? `(${g.nameEn})` : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="ជំនាន់ទី ១">ជំនាន់ទី ១ (Gen 1)</option>
                      <option value="ជំនាន់ទី ២">ជំនាន់ទី ២ (Gen 2)</option>
                      <option value="ជំនាន់ទី ៣">ជំនាន់ទី ៣ (Gen 3)</option>
                      <option value="ជំនាន់ទី ៤">ជំនាន់ទី ៤ (Gen 4)</option>
                      <option value="ជំនាន់ទី ៥">ជំនាន់ទី ៥ (Gen 5)</option>
                      <option value="ជំនាន់ទី ៦">ជំនាន់ទី ៦ (Gen 6)</option>
                      <option value="ជំនាន់ទី ៧">ជំនាន់ទី ៧ (Gen ​7)</option>
                    </>
                  )}
                </select>
              </div>

              {/* ៩. ឆ្នាំ */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ៩. ឆ្នាំ (Year Level) *
                </label>
                <select
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                >
                  {yearLevels.length > 0 ? (
                    yearLevels.map((yl) => (
                      <option key={yl.id} value={yl.nameKhmer}>
                        {yl.nameKhmer} {yl.nameEn ? `(${yl.nameEn})` : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="ឆ្នាំទី ១">ឆ្នាំទី ១ (Year 1)</option>
                      <option value="ឆ្នាំទី ២">ឆ្នាំទី ២ (Year 2)</option>
                      <option value="ឆ្នាំទី ៣">ឆ្នាំទី ៣ (Year 3)</option>
                      <option value="ឆ្នាំទី ៤">ឆ្នាំទី ៤ (Year 4)</option>
                    </>
                  )}
                </select>
              </div>

              {/* ១០. ឆមាស */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ១០. ឆមាស (Semester) *
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                >
                  {semesters.length > 0 ? (
                    semesters.map((s) => (
                      <option key={s.id} value={s.nameKhmer}>
                        {s.nameKhmer} {s.nameEn ? `(${s.nameEn})` : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="ឆមាសទី ១">ឆមាសទី ១ (Semester 1)</option>
                      <option value="ឆមាសទី ២">ឆមាសទី ២ (Semester 2)</option>
                    </>
                  )}
                </select>
              </div>

              {/* ១១. វេនសិក្សា */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ១១. វេនសិក្សា (Study Shift) *
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                >
                  <option value="វេនព្រឹក">វេនព្រឹក (Morning 08:00 - 11:00)</option>
                  <option value="វេនរសៀល">វេនរសៀល (Afternoon 14:00 - 17:00)</option>
                  <option value="វេនយប់">វេនយប់ (Evening 17:30 - 20:45)</option>
                  <option value="វេនចុងសប្តាហ៍">វេនចុងសប្តាហ៍ (Weekend Sat-Sun)</option>
                </select>
              </div>

              {/* ថ្នាក់រៀន */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  បន្ទប់ / ថ្នាក់រៀន
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.nameKhmer}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Optional Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                លេខទូរសព្ទសិស្ស
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="012 345 678"
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-zinc-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                អាសយដ្ឋានបច្ចុប្បន្ន
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ខណ្ឌទួលគោក រាជធានីភ្នំពេញ..."
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-zinc-400 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-zinc-100 dark:border-zinc-800">
            {submitError && (
              <p className="mr-auto self-center text-xs font-semibold text-rose-600 dark:text-rose-400">
                {submitError}
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកសិស្ស'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
