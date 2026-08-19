import React, { useState, useRef } from 'react';
import {
  X,
  Settings,
  School,
  Bell,
  Clock,
  Shield,
  Globe,
  Check,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Upload,
  Camera,
  Image as ImageIcon,
  UserCheck,
  DatabaseBackup
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APP_ASSETS } from '../data/mockData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  adminAvatar?: string;
  onUpdateAdminAvatar?: (url: string) => void;
  onDeleteAllStudents?: () => Promise<void> | void;
  onResetSampleData?: () => Promise<void> | void;
  onCreateBackup?: () => Promise<void> | void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
  adminAvatar,
  onUpdateAdminAvatar,
  onDeleteAllStudents,
  onResetSampleData,
  onCreateBackup
}) => {
  const [schoolName, setSchoolName] = useState('វិទ្យាស្ថានគរុកោសល្យភាសាចិន');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [lateThreshold, setLateThreshold] = useState('08:30');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentAvatar = adminAvatar || APP_ASSETS.userAvatar;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result && onUpdateAdminAvatar) {
          onUpdateAdminAvatar(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleExecuteClearAll = async () => {
    if (onDeleteAllStudents) {
      await onDeleteAllStudents();
    }
    setShowConfirmClearAll(false);
  };

  const handleExecuteReset = async () => {
    if (onResetSampleData) {
      await onResetSampleData();
    }
    setShowConfirmReset(false);
  };

  const handleCreateBackup = async () => {
    if (!onCreateBackup) return;
    setBackupStatus('saving');
    try {
      await onCreateBackup();
      setBackupStatus('saved');
    } catch {
      setBackupStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-5 border-b border-zinc-100 dark:border-zinc-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block">
                PREFERENCES
              </span>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                ការកំណត់ប្រព័ន្ធ & រូបភាព Admin
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

        <form onSubmit={handleSave} className="space-y-4">
          {/* Admin Avatar Section */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              រូបភាពគណនី Admin (Admin Avatar)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={currentAvatar}
                  alt="Admin"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="ប្តូររូបភាព"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>ផ្ទុករូបភាពថ្មី (Upload Photo)</span>
                </button>
                <p className="text-[11px] text-zinc-400">
                  ជ្រើសរើសរូបភាព JPG/PNG ពីកុំព្យូទ័រ ដើម្បីប្តូររូបតំណាង Admin
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              ឈ្មោះគ្រឹះស្ថានសិក្សា
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ឆ្នាំសិក្សា
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ម៉ោងកំណត់យឺត
              </label>
              <input
                type="time"
                value={lateThreshold}
                onChange={(e) => setLateThreshold(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  រូបរាងងងឹត (Dark Mode)
                </div>
                <div className="text-[11px] text-zinc-400">
                  ប្តូរផ្ទៃបង្ហាញទៅជារូបរាងងងឹត ឬភ្លឺ
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleDarkMode}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  darkMode ? 'bg-indigo-600 justify-end' : 'bg-zinc-300 dark:bg-zinc-700 justify-start'
                }`}
              >
                <motion.div
                  layout
                  className="w-4 h-4 rounded-full bg-white shadow-md"
                />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-1">
              តំបន់គ្រប់គ្រងទិន្នន័យ (Data Management)
            </div>

            {onCreateBackup && (
              <button
                type="button"
                onClick={handleCreateBackup}
                disabled={backupStatus === 'saving'}
                className="w-full px-3 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                <DatabaseBackup className="w-4 h-4" />
                <span>
                  {backupStatus === 'saving' && 'កំពុង Backup...'}
                  {backupStatus === 'saved' && 'Backup បានជោគជ័យ'}
                  {backupStatus === 'error' && 'Backup មិនបានជោគជ័យ'}
                  {backupStatus === 'idle' && 'Backup ទិន្នន័យប្រព័ន្ធទាំងមូល'}
                </span>
              </button>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="flex-1 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>កំណត់ទិន្នន័យដើមឡើងវិញ</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmClearAll(true)}
                className="flex-1 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>លុបបញ្ជីសិស្សទាំងអស់</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>បានរក្សាទុក!</span>
                </>
              ) : (
                <span>រក្សាទុកការផ្លាស់ប្តូរ</span>
              )}
            </button>
          </div>
        </form>

        {/* Confirmation Modals */}
        <AnimatePresence>
          {showConfirmClearAll && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-center text-zinc-900 dark:text-white mb-1">
                  តើអ្នកប្រាកដថាចង់លុបទិន្នន័យសិស្សទាំងអស់?
                </h4>
                <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mb-5">
                  ទិន្នន័យសិស្សទាំងអស់នឹងត្រូវលុបចេញពីប្រព័ន្ធ។
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmClearAll(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteClearAll}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
                  >
                    លុបទាំងអស់
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {showConfirmReset && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-center text-zinc-900 dark:text-white mb-1">
                  កំណត់ទិន្នន័យគំរូឡើងវិញ?
                </h4>
                <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mb-5">
                  ប្រព័ន្ធនឹងផ្ទុកទិន្នន័យសិស្ស និងថ្នាក់រៀនគំរូដើមរបស់វិទ្យាស្ថានឡើងវិញ។
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteReset}
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-500"
                  >
                    កំណត់ឡើងវិញ
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
