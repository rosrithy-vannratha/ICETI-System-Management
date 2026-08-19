import type {
  AcademicYear,
  AttendanceStatus,
  ClassRoom,
  Generation,
  Major,
  Semester,
  Student,
  Teacher,
  TeacherAttendanceRecord,
  YearLevel
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_MAJORS,
  INITIAL_GENERATIONS,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_YEAR_LEVELS,
  INITIAL_SEMESTERS
} from '../data/mockData';
import { firestoreDatabase, testFirestoreConnection } from './firebase';

// LocalStorage Keys
const KEYS = {
  STUDENTS: 'smart_school_students',
  TEACHERS: 'smart_school_teachers',
  CLASSES: 'smart_school_classes',
  MAJORS: 'smart_school_majors',
  GENERATIONS: 'smart_school_generations',
  ACADEMIC_YEARS: 'smart_school_academic_years',
  YEAR_LEVELS: 'smart_school_year_levels',
  SEMESTERS: 'smart_school_semesters',
  ATTENDANCE: 'smart_school_attendance',
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
// 1. STUDENT DATABASE SERVICE (Firestore + Local Sync)
// -------------------------------------------------------------
export const studentDatabase = {
  list: async (): Promise<Student[]> => {
    try {
      const cloudStudents = await firestoreDatabase.getAll<Student>('students');
      if (cloudStudents && cloudStudents.length > 0) {
        setStoredJson(KEYS.STUDENTS, cloudStudents);
        return cloudStudents;
      }
    } catch (e) {
      console.warn('Firestore fetch students fallback to local cache:', e);
    }
    const stored = getStoredJson<Student[]>(KEYS.STUDENTS, []);
    if (stored && stored.length > 0) {
      return stored;
    }
    setStoredJson(KEYS.STUDENTS, INITIAL_STUDENTS);
    return INITIAL_STUDENTS;
  },

  create: async (student: Student): Promise<Student> => {
    const current = getStoredJson<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    const updated = [student, ...current.filter((s) => s.id !== student.id)];
    setStoredJson(KEYS.STUDENTS, updated);

    // Sync to Firestore in background
    firestoreDatabase.setItem('students', student).catch((e) => {
      console.warn('Firestore create student background sync failed:', e);
    });

    return student;
  },

  update: async (student: Student): Promise<Student> => {
    const current = getStoredJson<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    const updated = current.map((s) => (s.id === student.id ? student : s));
    setStoredJson(KEYS.STUDENTS, updated);

    // Sync to Firestore in background
    firestoreDatabase.setItem('students', student).catch((e) => {
      console.warn('Firestore update student background sync failed:', e);
    });

    return student;
  },

  remove: async (ids: string[]): Promise<{ deleted: number }> => {
    const current = getStoredJson<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    const idSet = new Set(ids);
    const updated = current.filter((s) => !idSet.has(s.id));
    setStoredJson(KEYS.STUDENTS, updated);

    // Sync deletion to Firestore in background
    firestoreDatabase.batchDelete('students', ids).catch((e) => {
      console.warn('Firestore delete student background sync failed:', e);
    });

    return { deleted: ids.length };
  },

  import: async (students: Student[], mode: 'append' | 'replace'): Promise<Student[]> => {
    let result: Student[];
    if (mode === 'replace') {
      result = students;
      setStoredJson(KEYS.STUDENTS, students);
    } else {
      const current = getStoredJson<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
      const existingIds = new Set(current.map((s) => s.id));
      const newItems = students.filter((s) => !existingIds.has(s.id));
      result = [...current, ...newItems];
      setStoredJson(KEYS.STUDENTS, result);
    }

    // Sync batch to Firestore
    firestoreDatabase.batchSet('students', students).catch((e) => {
      console.warn('Firestore batch student sync failed:', e);
    });

    return result;
  }
};

// -------------------------------------------------------------
// 2. TEACHERS DATABASE SERVICE (Firestore + Local Sync)
// -------------------------------------------------------------
export const teachersDatabase = {
  list: async (): Promise<Teacher[]> => {
    try {
      const cloudTeachers = await firestoreDatabase.getAll<Teacher>('teachers');
      if (cloudTeachers && cloudTeachers.length > 0) {
        setStoredJson(KEYS.TEACHERS, cloudTeachers);
        return cloudTeachers;
      }
    } catch (e) {
      console.warn('Firestore fetch teachers fallback to local cache:', e);
    }
    return getStoredJson<Teacher[]>(KEYS.TEACHERS, INITIAL_TEACHERS);
  },

  save: async (teacher: Teacher): Promise<Teacher> => {
    const current = getStoredJson<Teacher[]>(KEYS.TEACHERS, INITIAL_TEACHERS);
    const updated = [...current.filter((t) => t.id !== teacher.id), teacher];
    setStoredJson(KEYS.TEACHERS, updated);

    firestoreDatabase.setItem('teachers', teacher).catch((e) => {
      console.warn('Firestore save teacher background sync failed:', e);
    });

    return teacher;
  },

  remove: async (id: string): Promise<void> => {
    const current = getStoredJson<Teacher[]>(KEYS.TEACHERS, INITIAL_TEACHERS);
    const updated = current.filter((t) => t.id !== id);
    setStoredJson(KEYS.TEACHERS, updated);

    firestoreDatabase.deleteItem('teachers', id).catch((e) => {
      console.warn('Firestore delete teacher background sync failed:', e);
    });
  }
};

// -------------------------------------------------------------
// 3. CLASSES DATABASE SERVICE (Firestore + Local Sync)
// -------------------------------------------------------------
export const classesDatabase = {
  list: async (): Promise<ClassRoom[]> => {
    try {
      const cloudClasses = await firestoreDatabase.getAll<ClassRoom>('classes');
      if (cloudClasses && cloudClasses.length > 0) {
        setStoredJson(KEYS.CLASSES, cloudClasses);
        return cloudClasses;
      }
    } catch (e) {
      console.warn('Firestore fetch classes fallback to local cache:', e);
    }
    return getStoredJson<ClassRoom[]>(KEYS.CLASSES, INITIAL_CLASSES);
  },

  save: async (classItem: ClassRoom): Promise<ClassRoom> => {
    const current = getStoredJson<ClassRoom[]>(KEYS.CLASSES, INITIAL_CLASSES);
    const updated = [...current.filter((c) => c.id !== classItem.id), classItem];
    setStoredJson(KEYS.CLASSES, updated);

    firestoreDatabase.setItem('classes', classItem).catch((e) => {
      console.warn('Firestore save class background sync failed:', e);
    });

    return classItem;
  },

  remove: async (id: string): Promise<void> => {
    const current = getStoredJson<ClassRoom[]>(KEYS.CLASSES, INITIAL_CLASSES);
    const updated = current.filter((c) => c.id !== id);
    setStoredJson(KEYS.CLASSES, updated);

    firestoreDatabase.deleteItem('classes', id).catch((e) => {
      console.warn('Firestore delete class background sync failed:', e);
    });
  }
};

// -------------------------------------------------------------
// 4. ACADEMIC STRUCTURE DATABASE SERVICE (Firestore + Local Sync)
// -------------------------------------------------------------
export type AcademicResource = 'generations' | 'academicYears' | 'yearLevels' | 'semesters' | 'majors';
export type AcademicItem = Generation | AcademicYear | YearLevel | Semester | Major;

export interface AcademicStructureData {
  generations: Generation[];
  academicYears: AcademicYear[];
  yearLevels: YearLevel[];
  semesters: Semester[];
  majors?: Major[];
}

export const academicDatabase = {
  list: async (): Promise<AcademicStructureData> => {
    try {
      const [gen, ay, yl, sem, maj] = await Promise.allSettled([
        firestoreDatabase.getAll<Generation>('generations'),
        firestoreDatabase.getAll<AcademicYear>('academicYears'),
        firestoreDatabase.getAll<YearLevel>('yearLevels'),
        firestoreDatabase.getAll<Semester>('semesters'),
        firestoreDatabase.getAll<Major>('majors')
      ]);

      const generations = gen.status === 'fulfilled' && gen.value.length > 0 ? gen.value : getStoredJson<Generation[]>(KEYS.GENERATIONS, INITIAL_GENERATIONS);
      const academicYears = ay.status === 'fulfilled' && ay.value.length > 0 ? ay.value : getStoredJson<AcademicYear[]>(KEYS.ACADEMIC_YEARS, INITIAL_ACADEMIC_YEARS);
      const yearLevels = yl.status === 'fulfilled' && yl.value.length > 0 ? yl.value : getStoredJson<YearLevel[]>(KEYS.YEAR_LEVELS, INITIAL_YEAR_LEVELS);
      const semesters = sem.status === 'fulfilled' && sem.value.length > 0 ? sem.value : getStoredJson<Semester[]>(KEYS.SEMESTERS, INITIAL_SEMESTERS);
      const majors = maj.status === 'fulfilled' && maj.value.length > 0 ? maj.value : getStoredJson<Major[]>(KEYS.MAJORS, INITIAL_MAJORS);

      setStoredJson(KEYS.GENERATIONS, generations);
      setStoredJson(KEYS.ACADEMIC_YEARS, academicYears);
      setStoredJson(KEYS.YEAR_LEVELS, yearLevels);
      setStoredJson(KEYS.SEMESTERS, semesters);
      setStoredJson(KEYS.MAJORS, majors);

      return { generations, academicYears, yearLevels, semesters, majors };
    } catch {
      return {
        generations: getStoredJson<Generation[]>(KEYS.GENERATIONS, INITIAL_GENERATIONS),
        academicYears: getStoredJson<AcademicYear[]>(KEYS.ACADEMIC_YEARS, INITIAL_ACADEMIC_YEARS),
        yearLevels: getStoredJson<YearLevel[]>(KEYS.YEAR_LEVELS, INITIAL_YEAR_LEVELS),
        semesters: getStoredJson<Semester[]>(KEYS.SEMESTERS, INITIAL_SEMESTERS),
        majors: getStoredJson<Major[]>(KEYS.MAJORS, INITIAL_MAJORS)
      };
    }
  },

  create: async <T extends AcademicItem>(resource: AcademicResource, item: T): Promise<T> => {
    const keyMap: Record<AcademicResource, string> = {
      generations: KEYS.GENERATIONS,
      academicYears: KEYS.ACADEMIC_YEARS,
      yearLevels: KEYS.YEAR_LEVELS,
      semesters: KEYS.SEMESTERS,
      majors: KEYS.MAJORS
    };

    const targetKey = keyMap[resource];
    const current = getStoredJson<T[]>(targetKey, []);
    const updated = [...current.filter((x: any) => x.id !== (item as any).id), item];
    setStoredJson(targetKey, updated);

    firestoreDatabase.setItem(resource, item).catch((e) => {
      console.warn(`Firestore create ${resource} sync failed:`, e);
    });

    return item;
  },

  update: async <T extends AcademicItem>(resource: AcademicResource, item: T): Promise<T> => {
    const keyMap: Record<AcademicResource, string> = {
      generations: KEYS.GENERATIONS,
      academicYears: KEYS.ACADEMIC_YEARS,
      yearLevels: KEYS.YEAR_LEVELS,
      semesters: KEYS.SEMESTERS,
      majors: KEYS.MAJORS
    };

    const targetKey = keyMap[resource];
    const current = getStoredJson<T[]>(targetKey, []);
    const updated = current.map((x: any) => (x.id === (item as any).id ? item : x));
    setStoredJson(targetKey, updated);

    firestoreDatabase.setItem(resource, item).catch((e) => {
      console.warn(`Firestore update ${resource} sync failed:`, e);
    });

    return item;
  },

  remove: async (resource: AcademicResource, id: string): Promise<{ deleted: number }> => {
    const keyMap: Record<AcademicResource, string> = {
      generations: KEYS.GENERATIONS,
      academicYears: KEYS.ACADEMIC_YEARS,
      yearLevels: KEYS.YEAR_LEVELS,
      semesters: KEYS.SEMESTERS,
      majors: KEYS.MAJORS
    };

    const targetKey = keyMap[resource];
    const current = getStoredJson<any[]>(targetKey, []);
    const updated = current.filter((x: any) => x.id !== id);
    setStoredJson(targetKey, updated);

    firestoreDatabase.deleteItem(resource, id).catch((e) => {
      console.warn(`Firestore delete ${resource} sync failed:`, e);
    });

    return { deleted: 1 };
  }
};

// -------------------------------------------------------------
// 5. ATTENDANCE DATABASE SERVICE (Firestore + Local Sync)
// -------------------------------------------------------------
export const attendanceDatabase = {
  saveRecord: async (
    classId: string,
    date: string,
    records: Record<string, { status: AttendanceStatus; note?: string }>
  ) => {
    const key = `${classId}_${date}`;
    const all = getStoredJson<Record<string, Record<string, { status: AttendanceStatus; note?: string }>>>(
      KEYS.ATTENDANCE,
      {}
    );
    all[key] = records;
    setStoredJson(KEYS.ATTENDANCE, all);

    firestoreDatabase.saveAttendanceRecord(classId, date, records).catch((e) => {
      console.warn('Firestore save attendance sync failed:', e);
    });
  },

  getAll: async () => {
    try {
      const cloud = await firestoreDatabase.getAllAttendances();
      if (cloud && Object.keys(cloud).length > 0) {
        setStoredJson(KEYS.ATTENDANCE, cloud);
        return cloud;
      }
    } catch (e) {
      console.warn('Firestore fetch attendances fallback to local cache:', e);
    }
    return getStoredJson<Record<string, Record<string, { status: AttendanceStatus; note?: string }>>>(
      KEYS.ATTENDANCE,
      {}
    );
  }
};

// -------------------------------------------------------------
// 6. TEACHER ATTENDANCE DATABASE SERVICE
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
// 7. SYSTEM BACKUP SERVICE
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
  if (backups.length > 10) backups.length = 10;
  setStoredJson(KEYS.BACKUPS, backups);
  return {
    id: newBackup.id,
    label: newBackup.label,
    createdAt: newBackup.createdAt
  };
};
