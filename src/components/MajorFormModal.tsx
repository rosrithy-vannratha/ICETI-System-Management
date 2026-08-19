import React, { useState, useEffect } from 'react';
import { Major } from '../types';
import { X, Award, Check, BookOpen, Clock, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface MajorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMajor: (majorData: Omit<Major, 'id'>, editId?: string) => void;
  initialData?: Major | null;
}

export const MajorFormModal: React.FC<MajorFormModalProps> = ({
  isOpen,
  onClose,
  onSaveMajor,
  initialData
}) => {
  const isEditing = Boolean(initialData);

  const [code, setCode] = useState('');
  const [nameKhmer, setNameKhmer] = useState('');
  const [nameChinese, setNameChinese] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('បរិញ្ញាបត្រ (Bachelor)');
  const [durationYears, setDurationYears] = useState<number>(4);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setNameKhmer(initialData.nameKhmer || '');
      setNameChinese(initialData.nameChinese || '');
      setNameEn(initialData.nameEn || '');
      setDegreeLevel(initialData.degreeLevel || 'បរិញ្ញាបត្រ (Bachelor)');
      setDurationYears(initialData.durationYears || 4);
      setDescription(initialData.description || '');
    } else {
      setCode('');
      setNameKhmer('');
      setNameChinese('');
      setNameEn('');
      setDegreeLevel('បរិញ្ញាបត្រ (Bachelor)');
      setDurationYears(4);
      setDescription('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!nameKhmer.trim()) {
      newErrors.nameKhmer = 'សូមបញ្ចូលឈ្មោះជំនាញជាភាសាខ្មែរ';
    }
    if (!code.trim()) {
      newErrors.code = 'សូមបញ្ចូលកូដសម្គាល់ជំនាញ (ឧទាហរណ៍៖ CP-01)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSaveMajor(
      {
        code: code.trim().toUpperCase(),
        nameKhmer: nameKhmer.trim(),
        nameChinese: nameChinese.trim(),
        nameEn: nameEn.trim(),
        degreeLevel,
        durationYears: Number(durationYears) || 4,
        description: description.trim()
      },
      initialData?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/80">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block">
                {isEditing ? 'EDIT MAJOR' : 'NEW MAJOR'}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white">
                {isEditing ? 'កែប្រែព័ត៌មានជំនាញ' : 'បន្ថែមជំនាញសិក្សាថ្មី'}
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
          {/* Major Code & Khmer Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                កូដជំនាញ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
                }}
                placeholder="CP-01"
                className={`w-full bg-zinc-100 dark:bg-zinc-900 border rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  errors.code
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-zinc-200 dark:border-zinc-700 focus:border-indigo-500'
                }`}
              />
              {errors.code && (
                <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.code}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ឈ្មោះជំនាញ (ភាសាខ្មែរ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nameKhmer}
                onChange={(e) => {
                  setNameKhmer(e.target.value);
                  if (errors.nameKhmer) setErrors((prev) => ({ ...prev, nameKhmer: '' }));
                }}
                placeholder="ឧទាហរណ៍៖ គរុកោសល្យភាសាចិន"
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
          </div>

          {/* Chinese Name & English Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ឈ្មោះជំនាញចិន (中文名称)
              </label>
              <input
                type="text"
                value={nameChinese}
                onChange={(e) => setNameChinese(e.target.value)}
                placeholder="ឧទាហរណ៍៖ 国际中文教育"
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ឈ្មោះជំនាញជាឡាតាំង (English Name)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="ឧទាហរណ៍៖ Chinese Pedagogy"
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          {/* Degree Level & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                កម្រិតសញ្ញាបត្រ (Degree Level)
              </label>
              <select
                value={degreeLevel}
                onChange={(e) => setDegreeLevel(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-medium focus:border-indigo-500 outline-none cursor-pointer transition-all"
              >
                <option value="បរិញ្ញាបត្រ (Bachelor)">បរិញ្ញាបត្រ (Bachelor)</option>
                <option value="បរិញ្ញាបត្រជាន់ខ្ពស់ (Master)">បរិញ្ញាបត្រជាន់ខ្ពស់ (Master)</option>
                <option value="បរិញ្ញាបត្ររង (Associate)">បរិញ្ញាបត្ររង (Associate)</option>
                <option value="វិញ្ញាបនបត្រជំនាញ (Certificate)">វិញ្ញាបនបត្រជំនាញ (Certificate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                រយៈពេលបណ្តុះបណ្តាល (ឆ្នាំ)
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value) || 4)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              ការពិពណ៌នាអំពីជំនាញ (Description)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ព័ត៌មានសង្ខេបអំពីកម្មវិធីសិក្សា និងគោលបំណងបណ្តុះបណ្តាល..."
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            />
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
              <span>{isEditing ? 'រក្សាទុកការកែប្រែ' : 'បន្ថែមជំនាញ'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
