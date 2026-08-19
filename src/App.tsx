/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Student,
  Teacher,
  ClassRoom,
  Major,
  AttendanceStatus,
  Generation,
  AcademicYear,
  YearLevel,
  Semester,
  DriveSyncStatus
} from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_MAJORS,
  INITIAL_GENERATIONS,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_YEAR_LEVELS,
  INITIAL_SEMESTERS,
  APP_ASSETS
} from './data/mockData';
import { Sidebar, NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AttendanceWorkspace } from './components/AttendanceWorkspace';
import { ReportsView } from './components/ReportsView';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { TeachersView } from './components/TeachersView';
import { ClassesView } from './components/ClassesView';
import { MajorsView } from './components/MajorsView';
import { LoginScreen } from './components/LoginScreen';
import { StudentProfileModal } from './components/StudentProfileModal';
import { AddStudentModal } from './components/AddStudentModal';
import { TeacherFormModal } from './components/TeacherFormModal';
import { ImportStudentsModal } from './components/ImportStudentsModal';
import { ImportTeachersModal } from './components/ImportTeachersModal';
import { SettingsModal } from './components/SettingsModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { AcademicStructureView } from './components/AcademicStructureView';
import { motion, AnimatePresence } from 'motion/react';
import { academicDatabase, attendanceDatabase, classesDatabase, createSystemBackup, seedInitialCloudDataIfEmpty, studentDatabase, teachersDatabase } from './service/database';
import { initAuth } from './service/googleAuth';
import { generateId } from './utils/idGenerator';
import type { SchoolDatabasePayload } from './service/googleDriveDatabase';

export default function App() {
  // Authentication State - Default to Login Screen on initial entry
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem('smart_school_auth_logged_in');
      return savedAuth === 'true';
    } catch {
      return false;
    }
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const savedRole = localStorage.getItem('smart_school_auth_role') as UserRole;
      return savedRole || 'admin';
    } catch {
      return 'admin';
    }
  });
  const [userName, setUserName] = useState<string>(() => {
    try {
      const savedName = localStorage.getItem('smart_school_auth_user');
      return savedName || 'អ្នកគ្រប់គ្រង (Admin)';
    } catch {
      return 'អ្នកគ្រប់គ្រង (Admin)';
    }
  });
  const [adminAvatar, setAdminAvatar] = useState<string>(() => {
    try {
      const savedAvatar = localStorage.getItem('smart_school_admin_avatar');
      return savedAvatar || APP_ASSETS.adminAvatar;
    } catch {
      return APP_ASSETS.adminAvatar;
    }
  });

  const handleUpdateAdminAvatar = (url: string) => {
    setAdminAvatar(url);
    try {
      localStorage.setItem('smart_school_admin_avatar', url);
    } catch {
      // safe fallback
    }
  };

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('attendance');

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Global search
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState<boolean>(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isImportExcelOpen, setIsImportExcelOpen] = useState<boolean>(false);
  const [isImportTeachersOpen, setIsImportTeachersOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDriveSyncOpen, setIsDriveSyncOpen] = useState<boolean>(false);
  const [databaseError, setDatabaseError] = useState<string>('');

  // Google Drive Database Sync State
  const [driveSyncStatus, setDriveSyncStatus] = useState<DriveSyncStatus>({
    isConnected: false,
    isSyncing: false,
    error: null
  });

  // Data state with localStorage persistence
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('smart_school_students');
      if (saved) {
        const parsed: Student[] = JSON.parse(saved);
        // Ensure all 11 fields exist by merging with INITIAL_STUDENTS defaults
        return parsed.map((s) => {
          const matchInitial = INITIAL_STUDENTS.find((init) => init.id === s.id);
          return {
            ...matchInitial,
            ...s,
            chineseName: s.chineseName || matchInitial?.chineseName || '',
            major: s.major || matchInitial?.major || 'គរុកោសល្យភាសាចិន',
            generation: s.generation || matchInitial?.generation || 'ជំនាន់ទី ៣',
            yearLevel: s.yearLevel || matchInitial?.yearLevel || 'ឆ្នាំទី ៤',
            semester: s.semester || matchInitial?.semester || 'ឆមាសទី ១',
            shift: s.shift || matchInitial?.shift || 'វេនព្រឹក',
            dob: s.dob || matchInitial?.dob || '2004-05-15'
          };
        });
      }
      return INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem('smart_school_teachers');
      return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
    } catch {
      return INITIAL_TEACHERS;
    }
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem('smart_school_classes');
      return saved ? JSON.parse(saved) : INITIAL_CLASSES;
    } catch {
      return INITIAL_CLASSES;
    }
  });

  const [majors, setMajors] = useState<Major[]>(() => {
    try {
      const saved = localStorage.getItem('smart_school_majors');
      return saved ? JSON.parse(saved) : INITIAL_MAJORS;
    } catch {
      return INITIAL_MAJORS;
    }
  });

  const [generations, setGenerations] = useState<Generation[]>(INITIAL_GENERATIONS);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(INITIAL_ACADEMIC_YEARS);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>(INITIAL_YEAR_LEVELS);
  const [semesters, setSemesters] = useState<Semester[]>(INITIAL_SEMESTERS);

  const [savedAttendances, setSavedAttendances] = useState<
    Record<string, Record<string, { status: AttendanceStatus; note?: string }>>
  >(() => {
    try {
      const saved = localStorage.getItem('smart_school_attendance');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let cancelled = false;
    let unsubStudents: (() => void) | undefined;
    let unsubTeachers: (() => void) | undefined;
    let unsubClasses: (() => void) | undefined;

    const initializeDataAndSubscriptions = async () => {
      try {
        // Seed initial data to Firestore if cloud is completely empty
        await seedInitialCloudDataIfEmpty();

        const [databaseStudents, databaseTeachers, databaseClasses, academicData, databaseAttendances] = await Promise.allSettled([
          studentDatabase.list(),
          teachersDatabase.list(),
          classesDatabase.list(),
          academicDatabase.list(),
          attendanceDatabase.getAll()
        ]);

        if (cancelled) return;

        if (databaseStudents.status === 'fulfilled' && databaseStudents.value.length > 0) {
          setStudents(databaseStudents.value);
        }
        if (databaseTeachers.status === 'fulfilled' && databaseTeachers.value.length > 0) {
          setTeachers(databaseTeachers.value);
        }
        if (databaseClasses.status === 'fulfilled' && databaseClasses.value.length > 0) {
          setClasses(databaseClasses.value);
        }
        if (academicData.status === 'fulfilled') {
          setGenerations(academicData.value.generations);
          setAcademicYears(academicData.value.academicYears);
          setYearLevels(academicData.value.yearLevels);
          setSemesters(academicData.value.semesters);
          if (academicData.value.majors && academicData.value.majors.length > 0) {
            setMajors(academicData.value.majors);
          }
        }
        if (databaseAttendances.status === 'fulfilled' && Object.keys(databaseAttendances.value).length > 0) {
          setSavedAttendances(databaseAttendances.value);
        }
        setDatabaseError('');

        // Subscribe to real-time updates from Firestore
        unsubStudents = studentDatabase.subscribe((updatedStudents) => {
          if (!cancelled && updatedStudents.length > 0) {
            setStudents(updatedStudents);
          }
        });

        unsubTeachers = teachersDatabase.subscribe((updatedTeachers) => {
          if (!cancelled && updatedTeachers.length > 0) {
            setTeachers(updatedTeachers);
          }
        });

        unsubClasses = classesDatabase.subscribe((updatedClasses) => {
          if (!cancelled && updatedClasses.length > 0) {
            setClasses(updatedClasses);
          }
        });
      } catch (error) {
        if (!cancelled) {
          setDatabaseError(error instanceof Error ? error.message : 'មិនអាចទាញទិន្នន័យពី Database បានទេ។');
        }
      }
    };

    initializeDataAndSubscriptions();
    return () => {
      cancelled = true;
      if (unsubStudents) unsubStudents();
      if (unsubTeachers) unsubTeachers();
      if (unsubClasses) unsubClasses();
    };
  }, []);

  // Dark mode class sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist students
  useEffect(() => {
    try {
      localStorage.setItem('smart_school_students', JSON.stringify(students));
    } catch {
      // safe fallback
    }
  }, [students]);

  // Persist classes
  useEffect(() => {
    try {
      localStorage.setItem('smart_school_classes', JSON.stringify(classes));
    } catch {
      // safe fallback
    }
  }, [classes]);

  // Persist majors
  useEffect(() => {
    try {
      localStorage.setItem('smart_school_majors', JSON.stringify(majors));
    } catch {
      // safe fallback
    }
  }, [majors]);

  // Persist teachers
  useEffect(() => {
    try {
      localStorage.setItem('smart_school_teachers', JSON.stringify(teachers));
    } catch {
      // safe fallback
    }
  }, [teachers]);

  // Persist attendances
  useEffect(() => {
    try {
      localStorage.setItem('smart_school_attendance', JSON.stringify(savedAttendances));
    } catch {
      // safe fallback
    }
  }, [savedAttendances]);

  // Listen to Google Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setDriveSyncStatus((prev) => ({
          ...prev,
          isConnected: true,
          userEmail: user.email || undefined,
          userName: user.displayName || undefined,
          userPhoto: user.photoURL || undefined,
          error: null
        }));
      },
      () => {
        setDriveSyncStatus((prev) => ({
          ...prev,
          isConnected: false,
          userEmail: undefined,
          userName: undefined,
          userPhoto: undefined
        }));
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogin = (role: UserRole, name: string) => {
    setUserRole(role);
    setUserName(name);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('smart_school_auth_logged_in', 'true');
      localStorage.setItem('smart_school_auth_role', role);
      localStorage.setItem('smart_school_auth_user', name);
    } catch {
      // safe fallback
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem('smart_school_auth_logged_in');
      localStorage.removeItem('smart_school_auth_role');
      localStorage.removeItem('smart_school_auth_user');
    } catch {
      // safe fallback
    }
  };

  // Teacher Handlers
  const handleAddTeacher = async (newTeacher: Teacher) => {
    setTeachers((prev) => [newTeacher, ...prev]);
    await teachersDatabase.save(newTeacher);
  };

  const handleUpdateTeacher = async (updatedTeacher: Teacher) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
    );
    await teachersDatabase.save(updatedTeacher);
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    await teachersDatabase.remove(teacherId);
  };

  const handleImportTeachers = async (
    importedTeachers: Omit<Teacher, 'id'>[],
    mode: 'append' | 'replace'
  ) => {
    const formattedWithIds: Teacher[] = importedTeachers.map((t, idx) => ({
      ...t,
      id: generateId('teacher')
    }));

    if (mode === 'replace') {
      setTeachers(formattedWithIds);
    } else {
      setTeachers((prev) => [...formattedWithIds, ...prev]);
    }
    for (const t of formattedWithIds) {
      teachersDatabase.save(t);
    }
  };

  // Google Drive Database Payload
  const getSchoolPayload = (): SchoolDatabasePayload => {
    return {
      version: '1.0',
      updatedAt: new Date().toISOString(),
      schoolName: 'វិទ្យាស្ថានគរុកោសល្យភាសាចិន',
      students,
      teachers,
      classes,
      majors,
      academicStructure: {
        generations,
        academicYears,
        yearLevels,
        semesters
      },
      savedAttendances
    };
  };

  // Restore Database from Google Drive
  const handleRestoreFromDrive = async (payload: SchoolDatabasePayload) => {
    if (payload.students) {
      await studentDatabase.import(payload.students, 'replace');
      setStudents(payload.students);
    }
    if (payload.teachers) {
      setTeachers(payload.teachers);
      for (const t of payload.teachers) teachersDatabase.save(t);
    }
    if (payload.classes) {
      setClasses(payload.classes);
      for (const c of payload.classes) classesDatabase.save(c);
    }
    if (payload.majors) setMajors(payload.majors);
    if (payload.academicStructure) {
      if (payload.academicStructure.generations) setGenerations(payload.academicStructure.generations);
      if (payload.academicStructure.academicYears) setAcademicYears(payload.academicStructure.academicYears);
      if (payload.academicStructure.yearLevels) setYearLevels(payload.academicStructure.yearLevels);
      if (payload.academicStructure.semesters) setSemesters(payload.academicStructure.semesters);
    }
    if (payload.savedAttendances) {
      setSavedAttendances(payload.savedAttendances);
    }
  };

  const handleSaveAttendance = async (
    classId: string,
    date: string,
    records: Record<string, { status: AttendanceStatus; note?: string }>
  ) => {
    const key = `${classId}_${date}`;
    setSavedAttendances((prev) => ({
      ...prev,
      [key]: records
    }));
    await attendanceDatabase.saveRecord(classId, date, records);
  };

  const handleAddGeneration = async (data: Omit<Generation, 'id'>) => {
    const created = await academicDatabase.create('generations', { ...data, id: generateId('gen') });
    setGenerations((current) => [...current, created]);
  };

  const handleUpdateGeneration = async (item: Generation) => {
    const updated = await academicDatabase.update('generations', item);
    setGenerations((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
  };

  const handleDeleteGeneration = async (id: string) => {
    await academicDatabase.remove('generations', id);
    setGenerations((current) => current.filter((entry) => entry.id !== id));
  };

  const handleAddAcademicYear = async (data: Omit<AcademicYear, 'id'>) => {
    const created = await academicDatabase.create('academicYears', { ...data, id: generateId('ay') });
    setAcademicYears((current) => [...current, created]);
  };

  const handleUpdateAcademicYear = async (item: AcademicYear) => {
    const updated = await academicDatabase.update('academicYears', item);
    setAcademicYears((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
  };

  const handleDeleteAcademicYear = async (id: string) => {
    await academicDatabase.remove('academicYears', id);
    setAcademicYears((current) => current.filter((entry) => entry.id !== id));
  };

  const handleAddYearLevel = async (data: Omit<YearLevel, 'id'>) => {
    const created = await academicDatabase.create('yearLevels', { ...data, id: generateId('yl') });
    setYearLevels((current) => [...current, created]);
  };

  const handleUpdateYearLevel = async (item: YearLevel) => {
    const updated = await academicDatabase.update('yearLevels', item);
    setYearLevels((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
  };

  const handleDeleteYearLevel = async (id: string) => {
    await academicDatabase.remove('yearLevels', id);
    setYearLevels((current) => current.filter((entry) => entry.id !== id));
  };

  const handleAddSemester = async (data: Omit<Semester, 'id'>) => {
    const created = await academicDatabase.create('semesters', { ...data, id: generateId('sem') });
    setSemesters((current) => [...current, created]);
  };

  const handleUpdateSemester = async (item: Semester) => {
    const updated = await academicDatabase.update('semesters', item);
    setSemesters((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
  };

  const handleDeleteSemester = async (id: string) => {
    await academicDatabase.remove('semesters', id);
    setSemesters((current) => current.filter((entry) => entry.id !== id));
  };

  const handleAddClass = async (newClassData: Omit<ClassRoom, 'id'>) => {
    const newClass: ClassRoom = {
      ...newClassData,
      id: generateId('c')
    };
    setClasses((prev) => [...prev, newClass]);
    await classesDatabase.save(newClass);
  };

  const handleUpdateClass = async (updatedClass: ClassRoom) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
    );
    await classesDatabase.save(updatedClass);
    // If class name changed, also update students who have that class
    setStudents((prev) =>
      prev.map((s) => {
        if (s.classId === updatedClass.id) {
          return { ...s, className: updatedClass.nameKhmer };
        }
        return s;
      })
    );
  };

  const handleDeleteClass = async (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    await classesDatabase.remove(classId);
  };

  const handleAddMajor = async (newMajorData: Omit<Major, 'id'>) => {
    const newMajor: Major = {
      ...newMajorData,
      id: generateId('m')
    };
    setMajors((prev) => [...prev, newMajor]);
    await academicDatabase.create('majors', newMajor);
  };

  const handleUpdateMajor = async (updatedMajor: Major) => {
    const oldMajor = majors.find((m) => m.id === updatedMajor.id);
    setMajors((prev) =>
      prev.map((m) => (m.id === updatedMajor.id ? updatedMajor : m))
    );
    await academicDatabase.update('majors', updatedMajor);
    // If major name changed, also update students with old major name
    if (oldMajor && oldMajor.nameKhmer !== updatedMajor.nameKhmer) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.major === oldMajor.nameKhmer || s.major === oldMajor.code) {
            return { ...s, major: updatedMajor.nameKhmer };
          }
          return s;
        })
      );
    }
  };

  const handleDeleteMajor = async (majorId: string) => {
    setMajors((prev) => prev.filter((m) => m.id !== majorId));
    await academicDatabase.remove('majors', majorId);
  };

  const handleAddStudent = async (newStudentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: generateId('s')
    };
    const createdStudent = await studentDatabase.create(newStudent);
    setStudents((prev) => [createdStudent, ...prev]);
    setDatabaseError('');
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    const savedStudent = await studentDatabase.update(updatedStudent);
    setStudents((prev) => prev.map((student) => student.id === savedStudent.id ? savedStudent : student));
    setSelectedStudentForModal(savedStudent);
    setDatabaseError('');
  };

  const handleDeleteStudent = async (id: string) => {
    await studentDatabase.remove([id]);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    if (selectedStudentForModal?.id === id) {
      setSelectedStudentForModal(null);
    }
  };

  const handleDeleteMultipleStudents = async (ids: string[]) => {
    await studentDatabase.remove(ids);
    const idSet = new Set(ids);
    setStudents((prev) => prev.filter((s) => !idSet.has(s.id)));
    if (selectedStudentForModal && idSet.has(selectedStudentForModal.id)) {
      setSelectedStudentForModal(null);
    }
  };

  const handleDeleteAllStudents = async () => {
    if (students.length > 0) {
      await studentDatabase.remove(students.map((student) => student.id));
    }
    setStudents([]);
    setSelectedStudentForModal(null);
  };

  const handleResetSampleData = async () => {
    if (students.length > 0) {
      await studentDatabase.remove(students.map((student) => student.id));
    }
    const savedStudents = await studentDatabase.import(INITIAL_STUDENTS, 'replace');
    setStudents(savedStudents);
    setClasses(INITIAL_CLASSES);
    setMajors(INITIAL_MAJORS);
  };

  const handleImportStudents = async (
    importedStudents: Omit<Student, 'id'>[],
    mode: 'append' | 'replace'
  ) => {
    const existingByCode = new Map<string, Student>(students.map((student) => [student.studentCode.trim().toLowerCase(), student]));
    const values = importedStudents.map((student) => ({
      ...student,
      id: existingByCode.get(student.studentCode.trim().toLowerCase())?.id || generateId('s')
    }));
    const savedStudents = await studentDatabase.import(values, mode);
    setStudents(savedStudents);
  };

  const handleCreateBackup = async () => {
    await createSystemBackup({ students, classes, majors, attendances: savedAttendances });
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 min-h-screen flex transition-colors duration-200 selection:bg-indigo-500 selection:text-white antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        userName={userName}
        adminAvatar={adminAvatar}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          userRole={userRole}
          userName={userName}
          adminAvatar={adminAvatar}
          onUpdateAdminAvatar={handleUpdateAdminAvatar}
          onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenDriveSync={() => setIsDriveSyncOpen(true)}
          driveSyncStatus={driveSyncStatus}
          onSelectTab={setCurrentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* View Content Router */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {databaseError && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
              {databaseError} ទិន្នន័យក្នុងឧបករណ៍នៅតែអាចមើលបាន ប៉ុន្តែការផ្លាស់ប្ដូរថ្មីមិនទាន់អាចរក្សាទុកបានទេ។
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {currentTab === 'attendance' && (
                <AttendanceWorkspace
                  students={students}
                  classes={classes}
                  recordedBy={userName}
                  onSaveAttendance={handleSaveAttendance}
                  savedAttendances={savedAttendances}
                  onOpenStudentModal={setSelectedStudentForModal}
                />
              )}

              {currentTab === 'reports' && (
                <ReportsView
                  students={students}
                  teachers={teachers}
                  classes={classes}
                  majors={majors}
                  generations={generations}
                  academicYears={academicYears}
                  yearLevels={yearLevels}
                  semesters={semesters}
                  savedAttendances={savedAttendances}
                  onOpenStudentModal={setSelectedStudentForModal}
                  onOpenTeacherModal={(teacher) => {
                    setEditingTeacher(teacher);
                    setIsAddTeacherOpen(true);
                  }}
                />
              )}

              {currentTab === 'dashboard' && (
                <DashboardView
                  students={students}
                  classes={classes}
                  userRole={userRole}
                  userName={userName}
                  onNavigate={setCurrentTab}
                  onOpenAddStudent={() => setIsAddStudentOpen(true)}
                  onOpenImportExcel={() => setIsImportExcelOpen(true)}
                />
              )}

              {currentTab === 'students' && (
                <StudentsView
                  students={students}
                  classes={classes}
                  majors={majors}
                  onOpenStudentModal={setSelectedStudentForModal}
                  onOpenAddStudent={() => setIsAddStudentOpen(true)}
                  onOpenImportExcel={() => setIsImportExcelOpen(true)}
                  onDeleteStudent={handleDeleteStudent}
                  onDeleteMultipleStudents={handleDeleteMultipleStudents}
                  onDeleteAllStudents={handleDeleteAllStudents}
                />
              )}

              {currentTab === 'teachers' && (
                <TeachersView
                  teachers={teachers}
                  classes={classes}
                  onAddTeacher={() => {
                    setEditingTeacher(null);
                    setIsAddTeacherOpen(true);
                  }}
                  onImportExcel={() => setIsImportTeachersOpen(true)}
                  onEditTeacher={(teacher) => {
                    setEditingTeacher(teacher);
                    setIsAddTeacherOpen(true);
                  }}
                  onDeleteTeacher={handleDeleteTeacher}
                  onNavigateToAttendance={() => setCurrentTab('attendance')}
                />
              )}

              {currentTab === 'classes' && (
                <ClassesView
                  classes={classes}
                  students={students}
                  onSelectClassToRecord={(classId) => {
                    setCurrentTab('attendance');
                  }}
                  onAddClass={handleAddClass}
                  onUpdateClass={handleUpdateClass}
                  onDeleteClass={handleDeleteClass}
                />
              )}

              {currentTab === 'majors' && (
                <MajorsView
                  majors={majors}
                  students={students}
                  onAddMajor={handleAddMajor}
                  onUpdateMajor={handleUpdateMajor}
                  onDeleteMajor={handleDeleteMajor}
                />
              )}
              {currentTab === 'terms' && (
                <AcademicStructureView
                  generations={generations}
                  academicYears={academicYears}
                  yearLevels={yearLevels}
                  semesters={semesters}
                  students={students}
                  classes={classes}
                  onAddGeneration={handleAddGeneration}
                  onUpdateGeneration={handleUpdateGeneration}
                  onDeleteGeneration={handleDeleteGeneration}
                  onAddAcademicYear={handleAddAcademicYear}
                  onUpdateAcademicYear={handleUpdateAcademicYear}
                  onDeleteAcademicYear={handleDeleteAcademicYear}
                  onAddYearLevel={handleAddYearLevel}
                  onUpdateYearLevel={handleUpdateYearLevel}
                  onDeleteYearLevel={handleDeleteYearLevel}
                  onAddSemester={handleAddSemester}
                  onUpdateSemester={handleUpdateSemester}
                  onDeleteSemester={handleDeleteSemester}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <StudentProfileModal
        student={selectedStudentForModal}
        onClose={() => setSelectedStudentForModal(null)}
        onDeleteStudent={handleDeleteStudent}
        onUpdateStudent={handleUpdateStudent}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        classes={classes}
        majors={majors}
        onAddStudent={handleAddStudent}
      />

      <TeacherFormModal
        isOpen={isAddTeacherOpen}
        onClose={() => {
          setIsAddTeacherOpen(false);
          setEditingTeacher(null);
        }}
        onSave={(teacher) => {
          if (editingTeacher) {
            handleUpdateTeacher(teacher);
          } else {
            handleAddTeacher(teacher);
          }
        }}
        editingTeacher={editingTeacher}
        classes={classes}
        existingTeachersCount={teachers.length}
      />

      <ImportStudentsModal
        isOpen={isImportExcelOpen}
        onClose={() => setIsImportExcelOpen(false)}
        classes={classes}
        students={students}
        onImportStudents={handleImportStudents}
      />

      <ImportTeachersModal
        isOpen={isImportTeachersOpen}
        onClose={() => setIsImportTeachersOpen(false)}
        classes={classes}
        teachers={teachers}
        onImportTeachers={handleImportTeachers}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        adminAvatar={adminAvatar}
        onUpdateAdminAvatar={handleUpdateAdminAvatar}
        onDeleteAllStudents={handleDeleteAllStudents}
        onResetSampleData={handleResetSampleData}
        onCreateBackup={handleCreateBackup}
      />

      <GoogleDriveSyncModal
        isOpen={isDriveSyncOpen}
        onClose={() => setIsDriveSyncOpen(false)}
        syncStatus={driveSyncStatus}
        onSyncStatusChange={setDriveSyncStatus}
        getPayloadForDrive={getSchoolPayload}
        onRestoreFromDrive={handleRestoreFromDrive}
      />
    </div>
  );
}
