import React, { useState } from 'react';
import { Student } from '../types';
import { APP_ASSETS } from '../data/mockData';
import {
  AlertTriangle,
  X,
  Printer,
  Phone,
  Send,
  UserX,
  FileWarning,
  CheckCircle2,
  Copy,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AttendanceWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  atRiskStudents: {
    student: Student;
    absentCount: number;
    permissionCount: number;
    lateCount: number;
    datesMissed: string[];
  }[];
  onOpenStudentModal?: (student: Student) => void;
}

export const AttendanceWarningModal: React.FC<AttendanceWarningModalProps> = ({
  isOpen,
  onClose,
  atRiskStudents,
  onOpenStudentModal
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    atRiskStudents[0]?.student.id || ''
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentItem =
    atRiskStudents.find((item) => item.student.id === selectedStudentId) ||
    atRiskStudents[0];

  const handlePrintWarningLetter = () => {
    window.print();
  };

  const handleCopyNotice = () => {
    if (!currentItem) return;
    const text = `[លិខិតជូនដំណឹងអវត្តមាន - វិទ្យាស្ថានគរុកោសល្យភាសាចិន]
សូមគោរពជូនចំពោះអាណាព្យាបាលសិស្ស ${currentItem.student.fullNameKhmer} (${currentItem.student.studentCode})
ថ្នាក់៖ ${currentItem.student.className} | ជំនាញ៖ ${currentItem.student.major}
សិស្សខាងលើបានអវត្តមានឥតច្បាប់សរុប ${currentItem.absentCount} ដង (លើសកម្រិតកំណត់ ៥ ដង)។
សូមអាណាព្យាបាលទាក់ទងមកវិទ្យាស្ថានជាបន្ទាន់តាមទូរស័ព្ទ៖ 023 888 999 ដើម្បីពិភាក្សាអំពីលទ្ធផលសិក្សារបស់សិស្ស។`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-800/80">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md border border-rose-500/20">
                  ATTENDANCE ALERT
                </span>
                <span className="text-xs font-bold text-zinc-500">
                  {atRiskStudents.length} នាក់
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                ការតាមដានសិស្សអវត្តមានលើសពី ៥ ដង (ហានិភ័យធ្លាក់វត្តមាន)
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {atRiskStudents.length === 0 ? (
          <div className="p-12 text-center my-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              ពុំមានសិស្សអវត្តមានលើសពី ៥ ដងឡើយ!
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              សិស្សទាំងអស់មានអត្រាវត្តមានល្អប្រសើរ មិនទាន់ឈានដល់កម្រិតព្រមានទេ។
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 overflow-y-auto flex-1">
            {/* Left: Students List */}
            <div className="lg:col-span-5 space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                បញ្ជីសិស្សមានហានិភ័យ ({atRiskStudents.length})
              </div>
              {atRiskStudents.map((item) => {
                const isSelected = item.student.id === currentItem?.student.id;
                return (
                  <div
                    key={item.student.id}
                    onClick={() => setSelectedStudentId(item.student.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20'
                        : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.student.avatarUrl}
                        alt={item.student.fullNameKhmer}
                        className="w-10 h-10 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {item.student.fullNameKhmer}
                          </span>
                          {item.student.chineseName && (
                            <span className="text-[10px] text-rose-500 font-sans font-bold">
                              {item.student.chineseName}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {item.student.studentCode} · {item.student.className}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                        {item.absentCount} ដង
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Formal Warning Notice & Letter */}
            {currentItem && (
              <div className="lg:col-span-7 flex flex-col bg-zinc-50 dark:bg-zinc-900/80 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800">
                {/* Official Letterhead */}
                <div className="bg-white dark:bg-[#18181d] p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs space-y-4">
                  <div className="text-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      ព្រះរាជាណាចក្រកម្ពុជា
                    </h4>
                    <h5 className="text-[11px] font-bold text-zinc-500 mb-1">
                      ជាតិ សាសនា ព្រះមហាក្សត្រ
                    </h5>
                    <div className="w-12 h-0.5 bg-indigo-500 mx-auto mb-2" />
                    <h3 className="text-sm font-extrabold text-[#00288e] dark:text-[#8da4ff]">
                      វិទ្យាស្ថានគរុកោសល្យភាសាចិន (ICETI)
                    </h3>
                    <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1 uppercase tracking-wider">
                      លិខិតជូនដំណឹង និងព្រមានអវត្តមានសិក្សា
                    </div>
                  </div>

                  {/* Student Details in Letter */}
                  <div className="text-xs space-y-2 text-zinc-800 dark:text-zinc-200">
                    <p>
                      សូមគោរពជម្រាបជូន <strong>អាណាព្យាបាលសិស្ស</strong>៖
                    </p>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-zinc-400">ឈ្មោះសិស្ស៖ </span>
                        <strong>{currentItem.student.fullNameKhmer} ({currentItem.student.fullNameEn})</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400">អត្តលេខ៖ </span>
                        <strong className="font-mono">{currentItem.student.studentCode}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400">ថ្នាក់រៀន៖ </span>
                        <strong>{currentItem.student.className}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400">ជំនាញ៖ </span>
                        <strong>{currentItem.student.major}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400">ទូរស័ព្ទអាណាព្យាបាល៖ </span>
                        <strong className="text-indigo-600 dark:text-indigo-400">{currentItem.student.parentPhone || '098 765 432'}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400">វេនសិក្សា៖ </span>
                        <strong>{currentItem.student.shift}</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs">
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>ស្ថានភាពអវត្តមាន៖ សរុប {currentItem.absentCount} ដង (ឥតច្បាប់)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                        យោងតាមបទបញ្ជាផ្ទៃក្នុងរបស់វិទ្យាស្ថានគរុកោសល្យភាសាចិន សិស្សដែលអវត្តមានឥតច្បាប់លើសពី ៥ ដងក្នុងមួយឆមាស នឹងត្រូវប្រឈមមុខនឹងការដកសិទ្ធិប្រឡងបញ្ចប់ឆមាស។
                      </p>
                    </div>

                    {currentItem.datesMissed.length > 0 && (
                      <div className="text-[11px] text-zinc-500">
                        កាលបរិច្ឆេទអវត្តមាន៖{' '}
                        <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                          {currentItem.datesMissed.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${currentItem.student.parentPhone || '098765432'}`}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>ហៅទូរស័ព្ទទៅអាណាព្យាបាល</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyNotice}
                      className="px-3 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'បានចម្លងរួច!' : 'ចម្លងសារ SMS/Telegram'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handlePrintWarningLetter}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>បោះពុម្ពលិខិតព្រមាន</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
