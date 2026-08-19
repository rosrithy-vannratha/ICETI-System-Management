import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Student, ClassRoom } from '../types';
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
  Copy,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  downloadStudentTemplate,
  parseStudentsExcelFile,
} from '../utils/exportUtils';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];

  // សិស្សដែលមានរួចក្នុង System
  students: Student[];

  onImportStudents: (
    importedStudents: Omit<Student, 'id'>[],
    mode: 'append' | 'replace'
  ) => Promise<void> | void;
}

type DuplicateStudent = {
  student: Omit<Student, 'id'>;
  reason: 'duplicate-in-file' | 'already-exists';
};

const normalizeStudentCode = (value: unknown): string => {
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

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
  isOpen,
  onClose,
  classes,
  students,
  onImportStudents,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(
    classes[0]?.id || 'c-12a'
  );

  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [parsedStudents, setParsedStudents] = useState<
    Omit<Student, 'id'>[]
  >([]);

  const [validStudents, setValidStudents] = useState<
    Omit<Student, 'id'>[]
  >([]);

  const [duplicateStudents, setDuplicateStudents] = useState<
    DuplicateStudent[]
  >([]);

  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [importMode, setImportMode] = useState<'append' | 'replace'>(
    'append'
  );

  const [hasValidated, setHasValidated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId]
  );

  /*
   * ---------------------------------------------------------
   * RESET WHEN MODAL CLOSES
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setParsedStudents([]);
      setValidStudents([]);
      setDuplicateStudents([]);
      setParseErrors([]);
      setIsParsing(false);
      setIsImporting(false);
      setHasValidated(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  /*
   * ---------------------------------------------------------
   * VALIDATE DUPLICATES
   * ---------------------------------------------------------
   */
  const validateStudents = (
    incomingStudents: Omit<Student, 'id'>[]
  ) => {
    const errors: string[] = [];
    const duplicates: DuplicateStudent[] = [];
    const valid: Omit<Student, 'id'>[] = [];

    /*
     * Existing student codes in System
     */
    const existingCodes = new Set(
      students
        .map((student) => normalizeStudentCode(student.studentCode))
        .filter(Boolean)
    );

    /*
     * Codes already found in this Excel file
     */
    const seenCodes = new Set<string>();

    /*
     * Keep duplicate codes so we can show them
     */
    const duplicateCodesInFile = new Set<string>();

    /*
     * -------------------------------------------------------
     * STEP 1
     * Find duplicates inside Excel
     * -------------------------------------------------------
     */
    for (const student of incomingStudents) {
      const code = normalizeStudentCode(student.studentCode);

      if (!code) {
        errors.push(
          `មានសិស្សម្នាក់មិនមានអត្តលេខ (${student.fullNameKhmer || 'មិនមានឈ្មោះ'})`
        );
        continue;
      }

      if (seenCodes.has(code)) {
        duplicateCodesInFile.add(code);
      } else {
        seenCodes.add(code);
      }
    }

    /*
     * -------------------------------------------------------
     * STEP 2
     * Validate every student
     * -------------------------------------------------------
     */
    const acceptedCodes = new Set<string>();

    for (const student of incomingStudents) {
      const code = normalizeStudentCode(student.studentCode);

      if (!code) {
        continue;
      }

      /*
       * Duplicate inside Excel
       */
      if (duplicateCodesInFile.has(code)) {
        duplicates.push({
          student,
          reason: 'duplicate-in-file',
        });

        continue;
      }

      /*
       * Already exists in System
       */
      if (existingCodes.has(code)) {
        /*
         * APPEND:
         * Don't import existing student
         */
        if (importMode === 'append') {
          duplicates.push({
            student,
            reason: 'already-exists',
          });

          continue;
        }

        /*
         * REPLACE / UPDATE:
         * Existing student is allowed.
         * The parent handler should perform update logic.
         */
      }

      /*
       * Prevent duplicate after normalization
       */
      if (acceptedCodes.has(code)) {
        duplicates.push({
          student,
          reason: 'duplicate-in-file',
        });

        continue;
      }

      acceptedCodes.add(code);

      valid.push({
        ...student,
        classId: selectedClassId,
        className:
          selectedClass?.nameKhmer || student.className,
      });
    }

    /*
     * -------------------------------------------------------
     * STEP 3
     * Add readable error messages
     * -------------------------------------------------------
     */

    if (duplicateCodesInFile.size > 0) {
      errors.push(
        `រកឃើញអត្តលេខស្ទួនក្នុងឯកសារ ${duplicateCodesInFile.size} អត្តលេខ`
      );
    }

    const existingDuplicateCount = duplicates.filter(
      (item) => item.reason === 'already-exists'
    ).length;

    if (existingDuplicateCount > 0) {
      errors.push(
        `រកឃើញអត្តលេខដែលមានក្នុង System រួច ${existingDuplicateCount} នាក់`
      );
    }

    setValidStudents(valid);
    setDuplicateStudents(duplicates);
    setParseErrors(errors);
    setHasValidated(true);
  };

  /*
   * ---------------------------------------------------------
   * PROCESS EXCEL / CSV
   * ---------------------------------------------------------
   */
  const handleProcessFile = async (selectedFile: File) => {
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();

    const validExtensions = [
      '.xlsx',
      '.xls',
      '.csv',
    ];

    const isValidFile = validExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    if (!isValidFile) {
      setParseErrors([
        'សូមជ្រើសរើសតែឯកសារ Excel (.xlsx, .xls) ឬ CSV (.csv) ប៉ុណ្ណោះ។',
      ]);
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);

    setParseErrors([]);
    setParsedStudents([]);
    setValidStudents([]);
    setDuplicateStudents([]);
    setHasValidated(false);

    try {
      const result = await parseStudentsExcelFile(
        selectedFile,
        selectedClassId,
        selectedClass?.nameKhmer ||
          'ថ្នាក់គរុកោសល្យ ក'
      );

      const studentsFromFile = result.students || [];

      setParsedStudents(studentsFromFile);

      /*
       * Preserve parser errors
       */
      if (result.errors && result.errors.length > 0) {
        setParseErrors(result.errors);
      }

      /*
       * Validate duplicates
       */
      validateStudents(studentsFromFile);
    } catch (err: any) {
      setParseErrors([
        err?.message ||
          'កំហុសមិនស្គាល់ក្នុងការអានឯកសារ',
      ]);

      setParsedStudents([]);
      setValidStudents([]);
      setDuplicateStudents([]);
      setHasValidated(false);
    } finally {
      setIsParsing(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DROP FILE
   * ---------------------------------------------------------
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0
    ) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  /*
   * ---------------------------------------------------------
   * FILE INPUT
   * ---------------------------------------------------------
   */
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (
      e.target.files &&
      e.target.files.length > 0
    ) {
      handleProcessFile(e.target.files[0]);
    }
  };

  /*
   * ---------------------------------------------------------
   * CLEAR
   * ---------------------------------------------------------
   */
  const handleClear = () => {
    setFile(null);
    setParsedStudents([]);
    setValidStudents([]);
    setDuplicateStudents([]);
    setParseErrors([]);
    setHasValidated(false);
    setIsParsing(false);
    setIsImporting(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /*
   * ---------------------------------------------------------
   * CHANGE IMPORT MODE
   *
   * When changing Append <-> Update,
   * revalidate the imported data.
   * ---------------------------------------------------------
   */
  const handleChangeImportMode = (
    mode: 'append' | 'replace'
  ) => {
    setImportMode(mode);

    if (parsedStudents.length > 0) {
      setTimeout(() => {
        /*
         * Re-run validation using new mode
         */
        const errors: string[] = [];
        const duplicates: DuplicateStudent[] = [];
        const valid: Omit<Student, 'id'>[] = [];

        const existingCodes = new Set(
          students
            .map((student) =>
              normalizeStudentCode(student.studentCode)
            )
            .filter(Boolean)
        );

        const seenCodes = new Set<string>();
        const duplicateCodes = new Set<string>();

        /*
         * Find duplicate codes inside file
         */
        parsedStudents.forEach((student) => {
          const code = normalizeStudentCode(
            student.studentCode
          );

          if (!code) return;

          if (seenCodes.has(code)) {
            duplicateCodes.add(code);
          } else {
            seenCodes.add(code);
          }
        });

        const acceptedCodes = new Set<string>();

        parsedStudents.forEach((student) => {
          const code = normalizeStudentCode(
            student.studentCode
          );

          if (!code) {
            errors.push(
              `សិស្ស ${student.fullNameKhmer || 'មិនមានឈ្មោះ'} មិនមានអត្តលេខ`
            );
            return;
          }

          if (duplicateCodes.has(code)) {
            duplicates.push({
              student,
              reason: 'duplicate-in-file',
            });
            return;
          }

          if (
            mode === 'append' &&
            existingCodes.has(code)
          ) {
            duplicates.push({
              student,
              reason: 'already-exists',
            });
            return;
          }

          if (acceptedCodes.has(code)) {
            duplicates.push({
              student,
              reason: 'duplicate-in-file',
            });
            return;
          }

          acceptedCodes.add(code);

          valid.push({
            ...student,
            classId: selectedClassId,
            className:
              selectedClass?.nameKhmer ||
              student.className,
          });
        });

        if (duplicateCodes.size > 0) {
          errors.push(
            `រកឃើញព័ត៌មានស្ទួនក្នុង Excel ${duplicateCodes.size} អត្តលេខ`
          );
        }

        const existingCount = duplicates.filter(
          (item) =>
            item.reason === 'already-exists'
        ).length;

        if (existingCount > 0) {
          errors.push(
            `មានអត្តលេខក្នុង System រួច ${existingCount} នាក់`
          );
        }

        setValidStudents(valid);
        setDuplicateStudents(duplicates);
        setParseErrors(errors);
        setHasValidated(true);
      }, 0);
    }
  };

  /*
   * ---------------------------------------------------------
   * CONFIRM IMPORT
   * ---------------------------------------------------------
   */
  const handleConfirmImport = async () => {
    if (
      validStudents.length === 0 ||
      isParsing ||
      isImporting
    ) {
      return;
    }

    /*
     * Final safety check
     *
     * Check AGAIN immediately before import
     * in case students changed after Excel was loaded.
     */
    const existingCodes = new Set(
      students
        .map((student) =>
          normalizeStudentCode(student.studentCode)
        )
        .filter(Boolean)
    );

    let finalStudents = [...validStudents];

    if (importMode === 'append') {
      finalStudents = finalStudents.filter((student) => {
        const code = normalizeStudentCode(
          student.studentCode
        );

        return !existingCodes.has(code);
      });
    }

    /*
     * Final duplicate protection
     */
    const finalSeen = new Set<string>();

    finalStudents = finalStudents.filter((student) => {
      const code = normalizeStudentCode(
        student.studentCode
      );

      if (!code) return false;

      if (finalSeen.has(code)) {
        return false;
      }

      finalSeen.add(code);
      return true;
    });

    /*
     * Nothing left to import
     */
    if (finalStudents.length === 0) {
      setParseErrors([
        'មិនមានទិន្នន័យថ្មីសម្រាប់នាំចូលទេ។ ព័ត៌មានទាំងអស់មានស្ទួន ឬមានក្នុង System រួចហើយ។',
      ]);

      return;
    }

    setIsImporting(true);

    try {
      await onImportStudents(
        finalStudents,
        importMode
      );

      /*
       * Success animation
       */
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: {
            y: 0.6,
          },
        });
      } catch {
        // Ignore animation error
      }

      handleClear();
      onClose();
    } catch (error: any) {
      setParseErrors([
        error?.message ||
          'មានបញ្ហាក្នុងការនាំចូលទិន្នន័យ',
      ]);
    } finally {
      setIsImporting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * CLOSE
   * ---------------------------------------------------------
   */
  const handleClose = () => {
    if (isImporting) return;

    handleClear();
    onClose();
  };

  /*
   * ---------------------------------------------------------
   * COUNTERS
   * ---------------------------------------------------------
   */
  const duplicateCount = duplicateStudents.length;

  const existingDuplicateCount =
    duplicateStudents.filter(
      (item) =>
        item.reason === 'already-exists'
    ).length;

  const fileDuplicateCount =
    duplicateStudents.filter(
      (item) =>
        item.reason === 'duplicate-in-file'
    ).length;

  /*
   * ---------------------------------------------------------
   * HIDE MODAL
   * ---------------------------------------------------------
   */
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
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
        className="bg-white dark:bg-[#121215] rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative max-h-[94vh] flex flex-col"
      >
        {/* =====================================================
            CLOSE BUTTON
        ====================================================== */}
        <button
          type="button"
          disabled={isImporting}
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all cursor-pointer z-10 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex justify-between items-center pb-5 border-b border-zinc-100 dark:border-zinc-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
                EXCEL BATCH IMPORT
              </span>

              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                នាំចូលបញ្ជីឈ្មោះសិស្សពី Excel / CSV
              </h3>

              <p className="text-[11px] text-zinc-500 mt-1">
                ប្រព័ន្ធនឹងពិនិត្យព័ត៌មានស្ទួន
                មុនពេលនាំចូល
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            SCROLLABLE BODY
        ====================================================== */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">

          {/* ===================================================
              TARGET CLASS + TEMPLATE
          ==================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200 dark:border-zinc-800">

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ថ្នាក់សិក្សាគោលដៅ
              </label>

              <select
                value={selectedClassId}
                disabled={isParsing || isImporting}
                onChange={(e) => {
                  setSelectedClassId(
                    e.target.value
                  );
                }}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:border-indigo-500 outline-none cursor-pointer disabled:opacity-50"
              >
                {classes.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.nameKhmer} ({c.academicYear})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={downloadStudentTemplate}
                disabled={
                  isParsing ||
                  isImporting
                }
                className="w-full py-2 px-3.5 bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />

                <span>
                  ទាញយកគំរូ Excel (.xlsx)
                  ទាំង ១១ ចំណុច
                </span>
              </button>
            </div>
          </div>

          {/* ===================================================
              DUPLICATE PROTECTION INFO
          ==================================================== */}
          <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />

              <div>
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                  ការពារព័ត៌មានស្ទួន
                </p>

                <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                  ប្រព័ន្ធនឹងពិនិត្យ
                  <strong> អត្តលេខសិស្ស </strong>
                  ជាមុន។ ប្រសិនបើអត្តលេខមានក្នុង
                  Excel ស្ទួន ឬមានក្នុង System រួច
                  ប្រព័ន្ធនឹងមិននាំចូលព័ត៌មាននោះទេ។
                </p>
              </div>
            </div>
          </div>

          {/* ===================================================
              UPLOAD DROPZONE
          ==================================================== */}
          {!file && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() =>
                setIsDragging(false)
              }
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]'
                  : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-zinc-50/50 dark:bg-zinc-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  ចុចទីនេះ ឬអូសទម្លាក់ឯកសារ
                  Excel / CSV មកទីនេះ
                </p>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  គាំទ្រ .xlsx, .xls និង .csv
                </p>
              </div>

              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold rounded-xl border border-indigo-200 dark:border-indigo-800">
                ជ្រើសរើសឯកសារពីកុំព្យូទ័រ
              </span>
            </div>
          )}

          {/* ===================================================
              FILE SELECTED
          ==================================================== */}
          {file && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>
                      {file.name}
                    </span>

                    <span className="text-[10px] font-mono text-zinc-400">
                      (
                      {(file.size / 1024).toFixed(
                        1
                      )}{' '}
                      KB)
                    </span>
                  </div>

                  <div className="text-[11px] mt-0.5">
                    {isParsing ? (
                      <span className="text-amber-500 font-medium">
                        កំពុងអាន និង
                        ពិនិត្យទិន្នន័យ...
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />

                        អានបាន{' '}
                        {parsedStudents.length}{' '}
                        នាក់
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isImporting}
                onClick={handleClear}
                className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                title="ដកឯកសារចេញ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ===================================================
              SUMMARY
          ==================================================== */}
          {hasValidated &&
            !isParsing &&
            parsedStudents.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                {/* TOTAL */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-500" />

                    <span className="text-[10px] font-bold text-zinc-500">
                      សរុប
                    </span>
                  </div>

                  <div className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1">
                    {parsedStudents.length}
                  </div>
                </div>

                {/* VALID */}
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />

                    <span className="text-[10px] font-bold text-emerald-600">
                      អាច Import
                    </span>
                  </div>

                  <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                    {validStudents.length}
                  </div>
                </div>

                {/* DUPLICATES */}
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                  <div className="flex items-center gap-2">
                    <Copy className="w-4 h-4 text-amber-600" />

                    <span className="text-[10px] font-bold text-amber-600">
                      ស្ទួន
                    </span>
                  </div>

                  <div className="text-xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">
                    {duplicateCount}
                  </div>
                </div>

                {/* ERRORS */}
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />

                    <span className="text-[10px] font-bold text-rose-600">
                      បញ្ហា
                    </span>
                  </div>

                  <div className="text-xl font-extrabold text-rose-700 dark:text-rose-400 mt-1">
                    {parseErrors.length}
                  </div>
                </div>
              </div>
            )}

          {/* ===================================================
              ERRORS / WARNINGS
          ==================================================== */}
          {parseErrors.length > 0 && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/50 space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />

                <span>
                  ចំណាំ / កំហុស ({parseErrors.length})
                </span>
              </div>

              <div className="text-xs text-rose-700 dark:text-rose-300 space-y-1 pl-6">
                {parseErrors
                  .slice(0, 8)
                  .map((err, i) => (
                    <div key={i}>
                      • {err}
                    </div>
                  ))}

                {parseErrors.length > 8 && (
                  <div className="text-[11px] text-rose-500 italic">
                    ...និង{' '}
                    {parseErrors.length - 8}{' '}
                    បញ្ហាផ្សេងទៀត
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================
              DUPLICATE DETAILS
          ==================================================== */}
          {duplicateStudents.length > 0 && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 overflow-hidden">

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-amber-600" />

                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    ព័ត៌មានមិនត្រូវបាន Import
                  </span>
                </div>

                <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                  {fileDuplicateCount > 0 && (
                    <span>
                      ស្ទួនក្នុង Excel:{' '}
                      <strong>
                        {fileDuplicateCount}
                      </strong>
                    </span>
                  )}

                  {fileDuplicateCount > 0 &&
                    existingDuplicateCount > 0 && (
                      <span> · </span>
                    )}

                  {existingDuplicateCount > 0 && (
                    <span>
                      មានក្នុង System:{' '}
                      <strong>
                        {existingDuplicateCount}
                      </strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto bg-white dark:bg-zinc-900">
                {duplicateStudents
                  .slice(0, 100)
                  .map((item, index) => (
                    <div
                      key={`${normalizeStudentCode(
                        item.student.studentCode
                      )}-${index}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <XCircle className="w-4 h-4 text-amber-500 shrink-0" />

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-zinc-900 dark:text-white">
                            {item.student.studentCode}
                          </div>

                          <div className="text-[11px] text-zinc-500 truncate">
                            {item.student.fullNameKhmer ||
                              'មិនមានឈ្មោះ'}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 whitespace-nowrap">
                        {item.reason ===
                        'duplicate-in-file'
                          ? 'ស្ទួនក្នុង Excel'
                          : 'មានក្នុង System'}
                      </span>
                    </div>
                  ))}

                {duplicateStudents.length > 100 && (
                  <div className="p-3 text-center text-[11px] text-zinc-500">
                    បង្ហាញតែ 100 ដំបូង
                    ក្នុងចំណោម{' '}
                    {duplicateStudents.length}{' '}
                    ករណី
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================
              PREVIEW
          ==================================================== */}
          {parsedStudents.length > 0 && (
            <div className="space-y-3">

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />

                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    មើលទិន្នន័យជាមុន
                  </span>

                  <span className="text-[10px] text-zinc-400">
                    ({validStudents.length}{' '}
                    នាក់អាច Import)
                  </span>
                </div>

                {/* IMPORT MODE */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-500 text-[11px]">
                    របៀបបញ្ចូល:
                  </span>

                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">

                    <button
                      type="button"
                      disabled={
                        isParsing ||
                        isImporting
                      }
                      onClick={() =>
                        handleChangeImportMode(
                          'append'
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        importMode === 'append'
                          ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-600'
                      }`}
                    >
                      បន្ថែមថ្មី
                    </button>

                    <button
                      type="button"
                      disabled={
                        isParsing ||
                        isImporting
                      }
                      onClick={() =>
                        handleChangeImportMode(
                          'replace'
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        importMode === 'replace'
                          ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-600'
                      }`}
                      title="ជំនួសព័ត៌មានដែលមានអត្តលេខដូចគ្នា"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>

              {/* UPDATE INFO */}
              {importMode === 'replace' && (
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50">
                  <div className="flex gap-2">
                    <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />

                    <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                      <strong>Update:</strong>{' '}
                      ប្រសិនបើអត្តលេខមានក្នុង
                      System រួច
                      ប្រព័ន្ធអាចប្រើ
                      `onImportStudents`
                      ដើម្បី Update។
                    </p>
                  </div>
                </div>
              )}

              {/* TABLE */}
              <div className="max-h-64 overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                <table className="w-full text-left border-collapse text-xs">

                  <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800/95 text-[11px] font-bold uppercase text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700 z-10">
                    <tr>
                      <th className="p-3">
                        ល.រ
                      </th>

                      <th className="p-3">
                        អត្តលេខ
                      </th>

                      <th className="p-3">
                        ឈ្មោះខ្មែរ
                      </th>

                      <th className="p-3">
                        ឈ្មោះចិន
                      </th>

                      <th className="p-3">
                        ភេទ
                      </th>

                      <th className="p-3">
                        ជំនាញ
                      </th>

                      <th className="p-3">
                        ជំនាន់ & ឆ្នាំ
                      </th>

                      <th className="p-3">
                        វេន
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">

                    {validStudents.map(
                      (s, idx) => (
                        <tr
                          key={`${normalizeStudentCode(
                            s.studentCode
                          )}-${idx}`}
                          className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="p-3 font-mono text-zinc-400 text-[11px]">
                            #{idx + 1}
                          </td>

                          <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {s.studentCode}
                          </td>

                          <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                            {s.fullNameKhmer}
                          </td>

                          <td className="p-3 font-sans font-bold text-rose-600 dark:text-rose-400">
                            {s.chineseName ||
                              '—'}
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                s.gender ===
                                'M'
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : 'bg-pink-500/10 text-pink-500'
                              }`}
                            >
                              {s.gender ===
                              'M'
                                ? 'ប្រុស'
                                : 'ស្រី'}
                            </span>
                          </td>

                          <td className="p-3 text-[11px] text-zinc-600 dark:text-zinc-300">
                            {s.major}
                          </td>

                          <td className="p-3 text-[11px] text-zinc-500">
                            {s.generation} ·{' '}
                            {s.yearLevel}
                          </td>

                          <td className="p-3 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            {s.shift}
                          </td>
                        </tr>
                      )
                    )}

                    {validStudents.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="p-8 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <XCircle className="w-8 h-8 text-rose-400" />

                            <span className="text-xs font-bold text-zinc-500">
                              មិនមានទិន្នន័យថ្មី
                              សម្រាប់ Import
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-5 border-t border-zinc-100 dark:border-zinc-800 mt-4">

          <div className="text-xs text-zinc-400">
            {parsedStudents.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1">

                <span>
                  សរុប:{' '}
                  <strong className="text-zinc-800 dark:text-zinc-200">
                    {parsedStudents.length}
                  </strong>
                </span>

                <span className="text-emerald-600">
                  អាច Import:{' '}
                  <strong>
                    {validStudents.length}
                  </strong>
                </span>

                <span className="text-amber-600">
                  ស្ទួន:{' '}
                  <strong>
                    {duplicateStudents.length}
                  </strong>
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3 w-full sm:w-auto">

            <button
              type="button"
              disabled={isImporting}
              onClick={handleClose}
              className="px-5 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={
                validStudents.length === 0 ||
                isParsing ||
                isImporting
              }
              onClick={handleConfirmImport}
              className={`px-6 py-2.5 rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                validStudents.length === 0 ||
                isParsing ||
                isImporting
                  ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 active:scale-95'
              }`}
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />

                  <span>
                    កំពុងនាំចូល...
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />

                  <span>
                    បញ្ជាក់ការនាំចូល (
                    {validStudents.length}
                    )
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
