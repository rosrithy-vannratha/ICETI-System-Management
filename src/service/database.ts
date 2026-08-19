import type {
  AcademicYear,
  AttendanceStatus,
  ClassRoom,
  Generation,
  Major,
  Semester,
  Student,
  TeacherAttendanceRecord,
  YearLevel
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_GENERATIONS,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_YEAR_LEVELS,
  INITIAL_SEMESTERS
} from '../data/mockData';

// LocalStorage Keys
const KEYS = {
  STUDENTS: 'smart_school_students',
  GENERATIONS: 'smart_school_generations',
  ACADEMIC_YEARS: 'smart_school_academic_years',
  YEAR_LEVELS: 'smart_school_year_levels',
  SEMESTERS: 'smart_school_semesters',
  TEACHER_ATTENDANCE: 'smart_school_teacher_attendance',
  BACKUPS: 'smart_school_backups'
};

// Safe LocalStorage Helpers
function getStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setStoredJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to persist to localStorage for key: ${key}`, e);
  }
}

// -------------------------------------------------------------
// 1. STUDENT DATABASE SERVICE (Local Durable Engine)
// -------------------------------------------------------------
export const studentDatabase = {
  list: async (): Promise<Student[]> => {
    const stored = getStoredJson<Student[]>(KEYS.STUDENTS, []);
    if (stored && stored.length > 0) {
      return stored;
    }
    // Initialize with default students
    setStoredJson(KEYS.STUDENTS, INITIAL_STUDENTS);
    return INITIAL_STUDENTS;
  },

  create: async (student: Student): Promise<Student> => {
    const current = getStoredJson<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    const updated = [student, ...current.filter((s) => s.id !== student.id)];
    setStoredJson(KEYS.STUDENTS, updated);
    return student;
  },

  update: async (student: Student): Promise<Student> => {
    const current = getStoredJson<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    const updated = current.map((s) => (s.id === student.id ? student : s));
    setStoredJson(KEYS.STUDENTS, updated);
    return student;
  },

  remove: async (ids: string[]): Promise<{ deleted: number }> => {
    const current = getStoredJson<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    const idSet = new Set(ids);
    const updated = current.filter((s) => !idSet.has(s.id));
    setStoredJson(KEYS.STUDENTS, updated);
    return { deleted: ids.length };
  },

  import: async (students: Student[], mode: 'append' | 'replace'): Promise<Student[]> => {
    if (mode === 'replace') {
      setStoredJson(KEYS.STUDENTS, students);
      return students;
    } else {
      const current = getStoredJson<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
      const existingIds = new Set(current.map((s) => s.id));
      const newItems = students.filter((s) => !existingIds.has(s.id));
      const updated = [...current, ...newItems];
      setStoredJson(KEYS.STUDENTS, updated);
      return updated;
    }
  }
};

// -------------------------------------------------------------
// 2. ACADEMIC STRUCTURE DATABASE SERVICE
// -------------------------------------------------------------
export type AcademicResource = 'generations' | 'academicYears' | 'yearLevels' | 'semesters';
export type AcademicItem = Generation | AcademicYear | YearLevel | Semester;

export interface AcademicStructureData {
  generations: Generation[];
  academicYears: AcademicYear[];
  yearLevels: YearLevel[];
  semesters: Semester[];
}

export const academicDatabase = {
  list: async (): Promise<AcademicStructureData> => {
    const generations = getStoredJson<Generation[]>(KEYS.GENERATIONS, INITIAL_GENERATIONS);
    const academicYears = getStoredJson<AcademicYear[]>(KEYS.ACADEMIC_YEARS, INITIAL_ACADEMIC_YEARS);
    const yearLevels = getStoredJson<YearLevel[]>(KEYS.YEAR_LEVELS, INITIAL_YEAR_LEVELS);
    const semesters = getStoredJson<Semester[]>(KEYS.SEMESTERS, INITIAL_SEMESTERS);

    return {
      generations: generations.length > 0 ? generations : INITIAL_GENERATIONS,
      academicYears: academicYears.length > 0 ? academicYears : INITIAL_ACADEMIC_YEARS,
      yearLevels: yearLevels.length > 0 ? yearLevels : INITIAL_YEAR_LEVELS,
      semesters: semesters.length > 0 ? semesters : INITIAL_SEMESTERS
    };
  },

  create: async <T extends AcademicItem>(resource: AcademicResource, item: T): Promise<T> => {
    const keyMap: Record<AcademicResource, string> = {
      generations: KEYS.GENERATIONS,
      academicYears: KEYS.ACADEMIC_YEARS,
      yearLevels: KEYS.YEAR_LEVELS,
      semesters: KEYS.SEMESTERS
    };
    const defaultMap: Record<AcademicResource, any[]> = {
      generations: INITIAL_GENERATIONS,
      academicYears: INITIAL_ACADEMIC_YEARS,
      yearLevels: INITIAL_YEAR_LEVELS,
      semesters: INITIAL_SEMESTERS
    };

    const targetKey = keyMap[resource];
    const current = getStoredJson<T[]>(targetKey, defaultMap[resource]);
    const updated = [...current.filter((x: any) => x.id !== (item as any).id), item];
    setStoredJson(targetKey, updated);
    return item;
  },

  update: async <T extends AcademicItem>(resource: AcademicResource, item: T): Promise<T> => {
    const keyMap: Record<AcademicResource, string> = {
      generations: KEYS.GENERATIONS,
      academicYears: KEYS.ACADEMIC_YEARS,
      yearLevels: KEYS.YEAR_LEVELS,
      semesters: KEYS.SEMESTERS
    };
    const defaultMap: Record<AcademicResource, any[]> = {
      generations: INITIAL_GENERATIONS,
      academicYears: INITIAL_ACADEMIC_YEARS,
      yearLevels: INITIAL_YEAR_LEVELS,
      semesters: INITIAL_SEMESTERS
    };

    const targetKey = keyMap[resource];
    const current = getStoredJson<T[]>(targetKey, defaultMap[resource]);
    const updated = current.map((x: any) => (x.id === (item as any).id ? item : x));
    setStoredJson(targetKey, updated);
    return item;
  },

  remove: async (resource: AcademicResource, id: string): Promise<{ deleted: number }> => {
    const keyMap: Record<AcademicResource, string> = {
      generations: KEYS.GENERATIONS,
      academicYears: KEYS.ACADEMIC_YEARS,
      yearLevels: KEYS.YEAR_LEVELS,
      semesters: KEYS.SEMESTERS
    };
    const defaultMap: Record<AcademicResource, any[]> = {
      generations: INITIAL_GENERATIONS,
      academicYears: INITIAL_ACADEMIC_YEARS,
      yearLevels: INITIAL_YEAR_LEVELS,
      semesters: INITIAL_SEMESTERS
    };

    const targetKey = keyMap[resource];
    const current = getStoredJson<any[]>(targetKey, defaultMap[resource]);
    const updated = current.filter((x: any) => x.id !== id);
    setStoredJson(targetKey, updated);
    return { deleted: 1 };
  }
};

// -------------------------------------------------------------
// 3. TEACHER ATTENDANCE DATABASE SERVICE
// -------------------------------------------------------------
export const teacherAttendanceDatabase = {
  list: async (date: string): Promise<TeacherAttendanceRecord[]> => {
    const store = getStoredJson<Record<string, TeacherAttendanceRecord[]>>(KEYS.TEACHER_ATTENDANCE, {});
    return store[date] || [];
  },

  save: async (date: string, records: TeacherAttendanceRecord[]): Promise<TeacherAttendanceRecord[]> => {
    const store = getStoredJson<Record<string, TeacherAttendanceRecord[]>>(KEYS.TEACHER_ATTENDANCE, {});
    store[date] = records;
    setStoredJson(KEYS.TEACHER_ATTENDANCE, store);
    return records;
  }
};

// -------------------------------------------------------------
// 4. SYSTEM BACKUP SERVICE
// -------------------------------------------------------------
export interface SystemSnapshot {
  students: Student[];
  classes: ClassRoom[];
  majors: Major[];
  attendances: Record<string, Record<string, { status: AttendanceStatus; note?: string }>>;
}

export const createSystemBackup = async (snapshot: SystemSnapshot): Promise<{ id: number; label: string; createdAt: string }> => {
  const backups = getStoredJson<any[]>(KEYS.BACKUPS, []);
  const newBackup = {
    id: Date.now(),
    label: `Manual backup ${new Date().toISOString()}`,
    createdAt: new Date().toISOString(),
    snapshot
  };
  backups.unshift(newBackup);
  // Keep latest 10 backups
  if (backups.length > 10) backups.length = 10;
  setStoredJson(KEYS.BACKUPS, backups);
  return {
    id: newBackup.id,
    label: newBackup.label,
    createdAt: newBackup.createdAt
  };
};
