import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Teacher, ClassRoom } from '../types';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  Users,
  Trash2,
  Sparkles,
  Info,
  ShieldCheck,
  RefreshCw,
  XCircle,
  GraduationCap,
  Award,
  Phone,
  Mail,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  downloadTeacherTemplate,
  parseTeachersExcelFile
} from '../utils/exportUtils';

interface ImportTeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];
  teachers: Teacher[];
  onImportTeachers: (
    importedTeachers: Omit<Teacher, 'id'>[],
    mode: 'append' | 'replace'
  ) => Promise<void> | void;
}

type DuplicateTeacher = {
  teacher: Omit<Teacher, 'id'>;
  reason: 'duplicate-in-file' | 'already-exists';
};

const normalizeCode = (value: unknown): string => {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, '')
    .toLowerCase();
};

const normalizeText = (value: unknown): string => {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
};

export const ImportTeachersModal: React.FC<ImportTeachersModalProps> = ({
  isOpen,
  onClose,
  classes,
  teachers,
  onImportTeachers
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [parsedTeachers, setParsedTeachers] = useState<Omit<Teacher, 'id'>[]>([]);
  const [validTeachers, setValidTeachers] = useState<Omit<Teacher, 'id'>[]>([]);
  const [duplicateTeachers, setDuplicateTeachers] = useState<DuplicateTeacher[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [filterTab, setFilterTab] = useState<'all' | 'valid' | 'duplicate' | 'error'>('all');
  const [hasValidated, setHasValidated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setParsedTeachers([]);
      setValidTeachers([]);
      setDuplicateTeachers([]);
      setParseErrors([]);
      setIsParsing(false);
      setIsImporting(false);
      setHasValidated(false);
      setFilterTab('all');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  // Validation function
  const validateTeachers = (incomingTeachers: Omit<Teacher, 'id'>[]) => {
    const duplicates: DuplicateTeacher[] = [];
    const valid: Omit<Teacher, 'id'>[] = [];

    const existingCodes = new Set(
      teachers.map((t) => normalizeCode(t.teacherCode)).filter(Boolean)
    );
    const existingKhmerNames = new Set(
      teachers.map((t) => normalizeText(t.fullNameKhmer)).filter(Boolean)
    );

    const seenCodes = new Set<string>();
    const duplicateCodesInFile = new Set<string>();

    // Step 1: Detect duplicates inside the file
    incomingTeachers.forEach((t) => {
      const code = normalizeCode(t.teacherCode);
      if (code) {
        if (seenCodes.has(code)) {
          duplicateCodesInFile.add(code);
        } else {
          seenCodes.add(code);
        }
      }
    });

    // Step 2: Separate duplicates vs valid
    incomingTeachers.forEach((teacher) => {
      const code = normalizeCode(teacher.teacherCode);
      const khmerName = normalizeText(teacher.fullNameKhmer);

      const isDuplicateInFile = code && duplicateCodesInFile.has(code);
      const isAlreadyInSystem =
        (code && existingCodes.has(code)) ||
        (khmerName && existingKhmerNames.has(khmerName));

      if (isDuplicateInFile) {
        duplicates.push({
          teacher,
          reason: 'duplicate-in-file'
        });
      } else if (isAlreadyInSystem && importMode === 'append') {
        duplicates.push({
          teacher,
          reason: 'already-exists'
        });
      } else {
        valid.push(teacher);
      }
    });

    setValidTeachers(valid);
    setDuplicateTeachers(duplicates);
    setHasValidated(true);
  };

  // Handle file select or drop
  const handleFileProcess = async (selectedFile: File) => {
    if (!selectedFile) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    const isExcelOrCsv =
      validTypes.includes(selectedFile.type) ||
      /\.(xlsx|xls|csv)$/i.test(selectedFile.name);

    if (!isExcelOrCsv) {
      setParseErrors([
        'សូមជ្រើសរើសតែប្រភេទឯកសារ Excel (.xlsx, .xls) ឬ CSV (.csv) ប៉ុណ្ណោះ។'
      ]);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setParseErrors([]);

    try {
      const result = await parseTeachersExcelFile(selectedFile, classes);

      setParsedTeachers(result.teachers);
      setParseErrors(result.errors);

      validateTeachers(result.teachers);
    } catch (err: any) {
      setParseErrors([
        err.message || 'មិនអាចអានឯកសារ Excel បានឡើយ។ សូមពិនិត្យទម្រង់ឯកសារឡើងវិញ។'
      ]);
      setParsedTeachers([]);
      setValidTeachers([]);
      setDuplicateTeachers([]);
    } finally {
      setIsParsing(false);
    }
  };

  // Re-validate when import mode changes
  useEffect(() => {
    if (parsedTeachers.length > 0) {
      validateTeachers(parsedTeachers);
    }
  }, [importMode]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setParsedTeachers([]);
    setValidTeachers([]);
    setDuplicateTeachers([]);
    setParseErrors([]);
    setHasValidated(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    const dataToImport = importMode === 'replace' ? parsedTeachers : validTeachers;

    if (dataToImport.length === 0) {
      alert('ពុំមានទិន្នន័យគ្រូបង្រៀនត្រឹមត្រូវសម្រាប់នាំចូលឡើយ។');
      return;
    }

    setIsImporting(true);
    try {
      await onImportTeachers(dataToImport, importMode);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert('មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ។');
    } finally {
      setIsImporting(false);
    }
  };

  // Class Name helper
  const getAssignedClassNames = (classIds?: string[]) => {
    if (!classIds || classIds.length === 0) return [];
    return classIds
      .map((id) => {
        const found = classes.find((c) => c.id === id);
        return found ? found.nameKhmer : id;
      })
      .filter(Boolean);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                នាំចូលទិន្នន័យគ្រូបង្រៀនពី Excel
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold">
                  Import Teachers
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                ផ្ទុកឡើងឯកសារ Excel (.xlsx, .xls) ឬ CSV ដើម្បីបញ្ចូលទិន្នន័យគ្រូបង្រៀនជាច្រើនក្នុងពេលតែមួយ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Template Download Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  ទាញយកទម្រង់គំរូ Excel (Download Official Template)
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  ប្រើប្រាស់ទម្រង់ស្តង់ដារដែលមានក្បាលតារាងត្រឹមត្រូវ (អត្តលេខគ្រូ, ឈ្មោះខ្មែរ, ឈ្មោះឡាតាំង, ឈ្មោះចិន, ភេទ, លេខទូរស័ព្ទ, សញ្ញាបត្រ, ឯកទេស, ថ្នាក់បង្រៀន) ដើម្បីជៀសវាងការខុសទិន្នន័យ។
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={downloadTeacherTemplate}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>ទាញយកគំរូ Excel</span>
            </button>
          </div>

          {/* Upload Area */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]'
                  : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-zinc-50/40 dark:bg-zinc-900/40'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />

              <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                ចុចទីនេះ ឬ អូសទម្លាក់ឯកសារ Excel / CSV
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                គាំទ្រឯកសារ .xlsx, .xls និង .csv ដែលមានតារាងព័ត៌មានគ្រូបង្រៀន
              </p>

              <div className="mt-4 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                ទំហំអតិបរមា: 15MB
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Card */}
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      {file.name}
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      បានអានជោគជ័យ: {parsedTeachers.length} នាក់
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>ប្តូរឯកសារ</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Import Mode Radio Switcher */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 block">
                  ជម្រើសរបៀបនាំចូល (Import Mode)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setImportMode('append')}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      importMode === 'append'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        បន្ថែមទិន្នន័យ (Append)
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        បញ្ចូលគ្រូថ្មីបន្ថែមពីលើបញ្ជីចាស់ និងរំលងទិន្នន័យដែលស្ទួន
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setImportMode('replace')}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      importMode === 'replace'
                        ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        ជំនួសទិន្នន័យទាំងអស់ (Replace All)
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        លុបបញ្ជីគ្រូបង្រៀនចាស់ចោល ហើយជំនួសដោយទិន្នន័យក្នុង Excel នេះ
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    សរុបក្នុង File
                  </div>
                  <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {parsedTeachers.length}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ត្រឹមត្រូវនាំចូលបាន
                  </div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {importMode === 'replace' ? parsedTeachers.length : validTeachers.length}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    ស្ទួន (Duplicates)
                  </div>
                  <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                    {importMode === 'replace' ? 0 : duplicateTeachers.length}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50">
                  <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    កំហុស (Errors)
                  </div>
                  <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                    {parseErrors.length}
                  </div>
                </div>
              </div>

              {/* Error messages if any */}
              {parseErrors.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    រកឃើញបញ្ហាក្នុងឯកសារ Excel:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 max-h-28 overflow-y-auto">
                    {parseErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    មើលទិន្នន័យជាមុន (Preview Data - {parsedTeachers.length} នាក់)
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setFilterTab('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        filterTab === 'all'
                          ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      ទាំងអស់ ({parsedTeachers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('valid')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        filterTab === 'valid'
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                          : 'text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      ត្រឹមត្រូវ ({importMode === 'replace' ? parsedTeachers.length : validTeachers.length})
                    </button>
                    {duplicateTeachers.length > 0 && importMode === 'append' && (
                      <button
                        type="button"
                        onClick={() => setFilterTab('duplicate')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          filterTab === 'duplicate'
                            ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                            : 'text-zinc-500 hover:text-zinc-700'
                        }`}
                      >
                        ស្ទួន ({duplicateTeachers.length})
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-x-auto overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 uppercase font-bold sticky top-0 z-10">
                      <tr>
                        <th className="px-3.5 py-2.5">ល.រ</th>
                        <th className="px-3.5 py-2.5">អត្តលេខ</th>
                        <th className="px-3.5 py-2.5">ឈ្មោះខ្មែរ / ចិន</th>
                        <th className="px-3.5 py-2.5">ឈ្មោះឡាតាំង</th>
                        <th className="px-3.5 py-2.5">ភេទ</th>
                        <th className="px-3.5 py-2.5">កម្រិតសញ្ញាបត្រ</th>
                        <th className="px-3.5 py-2.5">ឯកទេស</th>
                        <th className="px-3.5 py-2.5">លេខទូរស័ព្ទ</th>
                        <th className="px-3.5 py-2.5">ថ្នាក់ទទួលបន្ទុក</th>
                        <th className="px-3.5 py-2.5">ស្ថានភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium text-zinc-800 dark:text-zinc-200">
                      {parsedTeachers.map((t, idx) => {
                        const isDup = duplicateTeachers.some(
                          (d) => normalizeCode(d.teacher.teacherCode) === normalizeCode(t.teacherCode)
                        );

                        if (filterTab === 'valid' && isDup && importMode === 'append') return null;
                        if (filterTab === 'duplicate' && !isDup) return null;

                        const assignedNames = getAssignedClassNames(t.assignedClasses);

                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                              isDup && importMode === 'append' ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                            }`}
                          >
                            <td className="px-3.5 py-2.5 text-zinc-400">{idx + 1}</td>
                            <td className="px-3.5 py-2.5 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                              {t.teacherCode}
                            </td>
                            <td className="px-3.5 py-2.5">
                              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                {t.fullNameKhmer}
                                {t.chineseName && (
                                  <span className="text-zinc-500 font-normal">
                                    ({t.chineseName})
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                              {t.fullNameEn || '-'}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  t.gender === 'F'
                                    ? 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300'
                                    : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                }`}
                              >
                                {t.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                              {t.degreeKhmer}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium border border-indigo-200/60 dark:border-indigo-800/40">
                                {t.specialization}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                              {t.phone}
                            </td>
                            <td className="px-3.5 py-2.5">
                              <div className="flex flex-wrap gap-1 max-w-[180px]">
                                {assignedNames.length > 0 ? (
                                  assignedNames.map((cName, cIdx) => (
                                    <span
                                      key={cIdx}
                                      className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 whitespace-nowrap"
                                    >
                                      {cName}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-zinc-400">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                              {isDup && importMode === 'append' ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  ស្ទួន (Skip)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  ត្រៀមបញ្ចូល
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/80 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            បោះបង់ (Cancel)
          </button>

          <div className="flex items-center gap-2.5">
            {file && (
              <button
                type="button"
                onClick={handleClearFile}
                className="px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                សម្អាត (Clear)
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={
                !file ||
                isParsing ||
                isImporting ||
                (importMode === 'append' ? validTeachers.length === 0 : parsedTeachers.length === 0)
              }
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                !file ||
                isParsing ||
                isImporting ||
                (importMode === 'append' ? validTeachers.length === 0 : parsedTeachers.length === 0)
                  ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
              }`}
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>កំពុងនាំចូល...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    យល់ព្រមនាំចូល (
                    {importMode === 'replace' ? parsedTeachers.length : validTeachers.length} នាក់)
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
