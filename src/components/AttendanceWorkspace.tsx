import React, { useState } from 'react';
import { GraduationCap, UsersRound } from 'lucide-react';
import type { AttendanceStatus, ClassRoom, Student } from '../types';
import { AttendanceView } from './AttendanceView';
import { TeacherAttendanceView } from './TeacherAttendanceView';

interface AttendanceWorkspaceProps {
  students: Student[];
  classes: ClassRoom[];
  recordedBy: string;
  onSaveAttendance: (classId: string, date: string, records: Record<string, { status: AttendanceStatus; note?: string }>) => void;
  savedAttendances: Record<string, Record<string, { status: AttendanceStatus; note?: string }>>;
  onOpenStudentModal?: (student: Student) => void;
}

export const AttendanceWorkspace: React.FC<AttendanceWorkspaceProps> = (props) => {
  const [mode, setMode] = useState<'students' | 'teachers'>('students');
  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <button type="button" onClick={() => setMode('students')} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${mode === 'students' ? 'bg-zinc-900 text-white dark:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
          <GraduationCap className="h-4 w-4" /> វត្តមានសិស្ស
        </button>
        <button type="button" onClick={() => setMode('teachers')} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${mode === 'teachers' ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
          <UsersRound className="h-4 w-4" /> វត្តមានគ្រូ
        </button>
      </div>
      {mode === 'students' ? <AttendanceView {...props} /> : <TeacherAttendanceView classes={props.classes} recordedBy={props.recordedBy} />}
    </div>
  );
};
