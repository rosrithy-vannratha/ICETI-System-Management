import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Database,
  ShieldCheck,
  HardDrive,
  FileJson,
  Calendar,
  Sparkles,
  Lock,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DriveSyncStatus } from '../types';
import { googleSignIn, googleLogout, getCurrentGoogleUser } from '../service/googleAuth';
import {
  findDriveDatabaseFile,
  loadDatabaseFromGoogleDrive,
  saveDatabaseToGoogleDrive,
  SchoolDatabasePayload,
  DATABASE_FILENAME
} from '../service/googleDriveDatabase';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: DriveSyncStatus;
  onSyncStatusChange: (status: DriveSyncStatus) => void;
  getPayloadForDrive: () => SchoolDatabasePayload;
  onRestoreFromDrive: (payload: SchoolDatabasePayload) => Promise<void> | void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  onSyncStatusChange,
  getPayloadForDrive,
  onRestoreFromDrive
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [driveFileInfo, setDriveFileInfo] = useState<{ id: string; modifiedTime: string; size?: string } | null>(null);

  // Load drive file info when modal opens and user is connected
  useEffect(() => {
    if (isOpen && syncStatus.isConnected) {
      checkDriveFile();
    }
  }, [isOpen, syncStatus.isConnected]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const checkDriveFile = async () => {
    try {
      const user = getCurrentGoogleUser();
      if (!user) return;
      // We can also retrieve the accessToken from cached token
      const { getAccessToken } = await import('../service/googleAuth');
      const token = await getAccessToken();
      if (token) {
        const file = await findDriveDatabaseFile(token);
        if (file) {
          setDriveFileInfo({
            id: file.id,
            modifiedTime: file.modifiedTime,
            size: file.size
          });
        }
      }
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        onSyncStatusChange({
          isConnected: true,
          userEmail: result.user.email || undefined,
          userName: result.user.displayName || undefined,
          userPhoto: result.user.photoURL || undefined,
          isSyncing: false,
          error: null
        });
        showToast('បានភ្ជាប់ជាមួយ Google Drive ដោយជោគជ័យ!');
        // Check for existing database file in Drive
        const file = await findDriveDatabaseFile(result.accessToken);
        if (file) {
          setDriveFileInfo({
            id: file.id,
            modifiedTime: file.modifiedTime,
            size: file.size
          });
        }
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMessage(err.message || 'បរាជ័យក្នុងការភ្ជាប់គណនី Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleLogout();
      onSyncStatusChange({
        isConnected: false,
        userEmail: undefined,
        userName: undefined,
        userPhoto: undefined,
        isSyncing: false,
        error: null
      });
      setDriveFileInfo(null);
      showToast('បានផ្តាច់ការភ្ជាប់ជាមួយ Google Drive');
    } catch (err: any) {
      setErrorMessage(err.message || 'មិនអាចផ្តាច់គណនីបានទេ');
    }
  };

  const handleSaveToDrive = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const { getAccessToken } = await import('../service/googleAuth');
      let token = await getAccessToken();

      if (!token) {
        const res = await googleSignIn();
        token = res?.accessToken || null;
      }

      if (!token) {
        throw new Error('សូមចូលគណនី Google ជាមុនសិន');
      }

      const payload = getPayloadForDrive();
      const saveResult = await saveDatabaseToGoogleDrive(payload, token);

      const nowIso = new Date().toISOString();
      onSyncStatusChange({
        ...syncStatus,
        lastSyncedAt: nowIso,
        fileId: saveResult.fileId,
        isSyncing: false,
        error: null
      });

      setDriveFileInfo({
        id: saveResult.fileId,
        modifiedTime: saveResult.modifiedTime
      });

      showToast('បានរក្សាទុកទិន្នន័យទៅ Google Drive ដោយជោគជ័យ!');
    } catch (err: any) {
      console.error('Save to Drive Error:', err);
      setErrorMessage(err.message || 'បរាជ័យក្នុងការរក្សាទុកទិន្នន័យលើ Google Drive');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteRestore = async () => {
    setIsRestoring(true);
    setErrorMessage(null);
    try {
      const { getAccessToken } = await import('../service/googleAuth');
      let token = await getAccessToken();

      if (!token) {
        const res = await googleSignIn();
        token = res?.accessToken || null;
      }

      if (!token) {
        throw new Error('សូមចូលគណនី Google ជាមុនសិន');
      }

      const result = await loadDatabaseFromGoogleDrive(token);
      if (!result) {
        throw new Error('រកមិនឃើញឯកសារទិន្នន័យនៅលើ Google Drive របស់អ្នកឡើយ');
      }

      await onRestoreFromDrive(result.data);
      setShowRestoreConfirm(false);
      showToast('បានទាញយកទិន្នន័យពី Google Drive និងធ្វើសមកាលកម្មរួចរាល់!');
    } catch (err: any) {
      console.error('Restore Error:', err);
      setErrorMessage(err.message || 'បរាជ័យក្នុងការទាញយកទិន្នន័យពី Google Drive');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Google Drive Database</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Cloud Sync
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                រក្សាទុក និងធ្វើសមកាលកម្មទិន្នន័យសាលាជាមួយ Google Drive របស់អ្នក
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

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Connection Status Section */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            {syncStatus.isConnected ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {syncStatus.userPhoto ? (
                    <img
                      src={syncStatus.userPhoto}
                      alt="Google User"
                      className="w-11 h-11 rounded-2xl object-cover border border-zinc-300 dark:border-zinc-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                      G
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {syncStatus.userName || 'ភ្ជាប់រួចរាល់'}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      {syncStatus.userEmail || 'Google Drive Connected'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogout}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ផ្តាច់គណនី (Disconnect)</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    មិនទាន់ភ្ជាប់គណនី Google នៅឡើយទេ
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-sm mx-auto">
                    សូមភ្ជាប់គណនី Google ដើម្បីរក្សាទុកមូលដ្ឋានទិន្នន័យសាលាលើ Google Drive ដោយស្វ័យប្រវត្ត
                  </p>
                </div>

                {/* Google Sign-in Button with official styling */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSigningIn}
                    className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 shadow-sm transition-all cursor-pointer font-medium text-xs sm:text-sm text-zinc-700 dark:text-zinc-200"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>{isSigningIn ? 'កំពុងភ្ជាប់...' : 'Sign in with Google (ភ្ជាប់ Drive)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drive File & Sync Status Details */}
          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <FileJson className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold">ឈ្មោះឯកសារទិន្នន័យ៖</span>
                </div>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {DATABASE_FILENAME}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold">ធ្វើសមកាលកម្មចុងក្រោយ៖</span>
                </div>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {syncStatus.lastSyncedAt
                    ? new Date(syncStatus.lastSyncedAt).toLocaleString('km-KH')
                    : driveFileInfo?.modifiedTime
                    ? new Date(driveFileInfo.modifiedTime).toLocaleString('km-KH')
                    : 'មិនទាន់មានទិន្នន័យ (Never)'}
                </span>
              </div>

              {driveFileInfo?.id && (
                <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-zinc-500">Google Drive File ID:</span>
                  <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[200px]">
                    {driveFileInfo.id}
                  </span>
                </div>
              )}
            </div>

            {/* Sync Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Save to Drive */}
              <button
                type="button"
                onClick={handleSaveToDrive}
                disabled={isSaving}
                className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-3 transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  {isSaving ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs sm:text-sm">
                    {isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកទៅ Google Drive'}
                  </div>
                  <div className="text-[11px] text-indigo-100 opacity-90">
                    Backup ទៅកាន់ Cloud
                  </div>
                </div>
              </button>

              {/* Restore from Drive */}
              <button
                type="button"
                onClick={() => setShowRestoreConfirm(true)}
                disabled={isRestoring}
                className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center gap-3 transition-all border border-zinc-200 dark:border-zinc-700 cursor-pointer disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  {isRestoring ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs sm:text-sm">
                    {isRestoring ? 'កំពុងទាញយក...' : 'ទាញយកពី Google Drive'}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Restore ទិន្នន័យមកក្នុង App
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>ទិន្នន័យត្រូវបានរក្សាទុកដោយសុវត្ថិភាពលើ Google Drive ផ្ទាល់ខ្លួនរបស់អ្នក</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 cursor-pointer"
          >
            បិទ
          </button>
        </div>

        {/* Restore Confirmation Dialog (User Confirmation Mandate) */}
        <AnimatePresence>
          {showRestoreConfirm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    តើអ្នកចង់ទាញយកទិន្នន័យពី Google Drive មែនទេ?
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                    ការទាញយកទិន្នន័យនេះ នឹងជំនួសទិន្នន័យបច្ចុប្បន្ន (សិស្ស គ្រូបង្រៀន ថ្នាក់រៀន និងវត្តមាន) ជាមួយទិន្នន័យចុងក្រោយដែលបានរក្សាទុកលើ Google Drive។
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRestoreConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteRestore}
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    យល់ព្រម ទាញយក
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
