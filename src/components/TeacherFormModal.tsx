import React, { useState, useEffect, useRef } from 'react';
import { Teacher, ClassRoom } from '../types';
import {
  X,
  User,
  GraduationCap,
  Phone,
  Mail,
  BookOpen,
  Camera,
  Upload,
  Calendar,
  MapPin,
  Check,
  Award,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
  editingTeacher?: Teacher | null;
  classes: ClassRoom[];
  existingTeachersCount: number;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
];

export const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTeacher,
  classes,
  existingTeachersCount
}) => {
  const isEditing = !!editingTeacher;

  const [teacherCode, setTeacherCode] = useState('');
  const [fullNameKhmer, setFullNameKhmer] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [chineseName, setChineseName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('F');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [degreeKhmer, setDegreeKhmer] = useState('អនុបណ្ឌិត (Master)');
  const [specialization, setSpecialization] = useState('គរុកោសល្យភាសាចិន');
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'leave' | 'inactive'>('active');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [address, setAddress] = useState('រាជធានីភ្នំពេញ');
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTeacher) {
      setTeacherCode(editingTeacher.teacherCode);
      setFullNameKhmer(editingTeacher.fullNameKhmer);
      setFullNameEn(editingTeacher.fullNameEn || '');
      setChineseName(editingTeacher.chineseName || '');
      setGender(editingTeacher.gender);
      setPhone(editingTeacher.phone || '');
      setEmail(editingTeacher.email || '');
      setDegreeKhmer(editingTeacher.degreeKhmer || 'អនុបណ្ឌិត (Master)');
      setSpecialization(editingTeacher.specialization || 'គរុកោសល្យភាសាចិន');
      setAssignedClasses(editingTeacher.assignedClasses || []);
      setStatus(editingTeacher.status || 'active');
      setAvatarUrl(editingTeacher.avatarUrl || PRESET_AVATARS[0]);
      setAddress(editingTeacher.address || '');
      setJoinDate(editingTeacher.joinDate || new Date().toISOString().split('T')[0]);
      setNotes(editingTeacher.notes || '');
    } else {
      const nextNum = existingTeachersCount + 1;
      setTeacherCode(`T-${String(nextNum).padStart(3, '0')}`);
      setFullNameKhmer('');
      setFullNameEn('');
      setChineseName('');
      setGender('M');
      setPhone('');
      setEmail('');
      setDegreeKhmer('អនុបណ្ឌិត (Master)');
      setSpecialization('គរុកោសល្យភាសាចិន');
      setAssignedClasses([]);
      setStatus('active');
      setAvatarUrl(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
      setAddress('រាជធានីភ្នំពេញ');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setErrorMsg('');
  }, [editingTeacher, existingTeachersCount, isOpen]);

  if (!isOpen) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) setAvatarUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleClassAssignment = (classId: string) => {
    if (assignedClasses.includes(classId)) {
      setAssignedClasses(assignedClasses.filter((id) => id !== classId));
    } else {
      setAssignedClasses([...assignedClasses, classId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameKhmer.trim()) {
      setErrorMsg('សូមបញ្ចូលឈ្មោះគ្រូបង្រៀនជាភាសាខ្មែរ');
      return;
    }

    const teacherData: Teacher = {
      id: editingTeacher ? editingTeacher.id : `t-${Date.now()}`,
      teacherCode: teacherCode.trim() || `T-${Date.now().toString().slice(-3)}`,
      fullNameKhmer: fullNameKhmer.trim(),
      fullNameEn: fullNameEn.trim(),
      chineseName: chineseName.trim(),
      gender,
      phone: phone.trim(),
      email: email.trim(),
      degreeKhmer,
      specialization: specialization.trim(),
      assignedClasses,
      status,
      avatarUrl,
      address: address.trim(),
      joinDate,
      notes: notes.trim()
    };

    onSave(teacherData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {isEditing ? 'កែប្រែព័ត៌មានគ្រូបង្រៀន' : 'បន្ថែមគ្រូបង្រៀនថ្មី (Add Teacher)'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                វិទ្យាស្ថានគរុកោសល្យភាសាចិន (CPI)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <div className="relative group shrink-0">
              <img
                src={avatarUrl}
                alt="Teacher Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px]"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                <span>ប្ដូររូប</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                ជ្រើសរើសរូបតំណាងគំរូ ឬ Upload រូបផ្ទាល់ខ្លួន៖
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      avatarUrl === url
                        ? 'border-indigo-600 scale-105 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 flex items-center gap-1 shrink-0"
                >
                  <Upload className="w-3 h-3 text-indigo-500" />
                  <span>Upload</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Teacher Code */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                អត្តលេខគ្រូ (Teacher Code) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value)}
                placeholder="ឧ. T-007"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ភេទ (Gender)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('M')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    gender === 'M'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  ប្រុស (Male)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('F')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    gender === 'F'
                      ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-500 text-pink-600 dark:text-pink-400'
                      : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  ស្រី (Female)
                </button>
              </div>
            </div>

            {/* Full Name Khmer */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ឈ្មោះជាភាសាខ្មែរ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullNameKhmer}
                onChange={(e) => setFullNameKhmer(e.target.value)}
                placeholder="ឧ. សុខ ចាន់ថា"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Chinese Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ឈ្មោះជាអក្សរចិន (Chinese Name)
              </label>
              <input
                type="text"
                value={chineseName}
                onChange={(e) => setChineseName(e.target.value)}
                placeholder="ឧ. 索占达"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Full Name English */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ឈ្មោះជាអក្សរឡាតាំង (Latin Name)
              </label>
              <input
                type="text"
                value={fullNameEn}
                onChange={(e) => setFullNameEn(e.target.value)}
                placeholder="ឧ. Sok Chantha"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                លេខទូរស័ព្ទ (Phone)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="ឧ. 012 345 678"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                អ៊ីមែល (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ឧ. chantha@cpi.edu.kh"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Degree */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                កម្រិតសញ្ញាបត្រ (Degree Level)
              </label>
              <select
                value={degreeKhmer}
                onChange={(e) => setDegreeKhmer(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="បរិញ្ញាបត្រ (Bachelor)">បរិញ្ញាបត្រ (Bachelor)</option>
                <option value="អនុបណ្ឌិត (Master)">អនុបណ្ឌិត (Master)</option>
                <option value="បណ្ឌិត (PhD)">បណ្ឌិត (PhD)</option>
                <option value="សាស្ត្រាចារ្យ (Professor)">សាស្ត្រាចារ្យ (Professor)</option>
              </select>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ឯកទេសបង្រៀន (Specialization)
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="ឧ. គរុកោសល្យភាសាចិន & វេយ្យាករណ៍"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ស្ថានភាពបម្រើការ (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'leave' | 'inactive')}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="active">កំពុងបង្រៀន (Active)</option>
                <option value="leave">កំពុងសុំច្បាប់ (On Leave)</option>
                <option value="inactive">ផ្អាកបង្រៀន (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Assigned Classes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              ថ្នាក់រៀនដែលទទួលបន្ទុក ឬបង្រៀន (Assigned Classes)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
              {classes.length === 0 ? (
                <p className="text-xs text-zinc-400">មិនទាន់មានថ្នាក់រៀននៅឡើយទេ</p>
              ) : (
                classes.map((cls) => {
                  const isAssigned = assignedClasses.includes(cls.id);
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => toggleClassAssignment(cls.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAssigned
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{cls.nameKhmer}</span>
                      {isAssigned && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Address & Join Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ថ្ងៃចូលបម្រើការងារ (Join Date)
              </label>
              <input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                អាសយដ្ឋានបច្ចុប្បន្ន (Address)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ឧ. រាជធានីភ្នំពេញ"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              កំណត់សម្គាល់បន្ថែម (Notes)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ព័ត៌មានបន្ថែមអំពីគ្រូបង្រៀន..."
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              បោះបង់ (Cancel)
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'រក្សាទុកការកែប្រែ' : 'បញ្ចូលគ្រូបង្រៀន (Save Teacher)'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
