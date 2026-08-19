export type AttendanceStatus = 'present' | 'permission' | 'absent' | 'late';

export type UserRole = 'admin' | 'teacher';

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  fullNameKhmer: string;
  fullNameEn?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  roleTitleKhmer?: string;
  assignedClass?: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt?: string;
}

export interface Teacher {
  id: string;
  teacherCode: string;          // ១. អត្តលេខគ្រូ (e.g. T-001)
  fullNameKhmer: string;        // ២. ឈ្មោះខ្មែរ (e.g. សុខ ចាន់ថា)
  fullNameEn?: string;          // ៣. ឈ្មោះឡាតាំង (e.g. Sok Chantha)
  chineseName?: string;         // ៤. ឈ្មោះចិន (e.g. 索占达)
  gender: 'M' | 'F';            // ៥. ភេទ
  phone: string;                // ៦. លេខទូរស័ព្ទ
  email?: string;               // ៧. អ៊ីមែល
  degreeKhmer: string;          // ៨. កម្រិតសញ្ញាបត្រ (បរិញ្ញាបត្រ, អនុបណ្ឌិត, បណ្ឌិត)
  specialization: string;       // ៩. ឯកទេសបង្រៀន (ភាសាចិនទូទៅ, គរុកោសល្យ, ពាណិជ្ជកម្ម, បកប្រែ)
  assignedClasses?: string[];   // ១០. ថ្នាក់ដែលត្រូវបង្រៀន
  status: 'active' | 'leave' | 'inactive'; // ១១. ស្ថានភាព
  avatarUrl?: string;
  nationalId?: string;
  joinDate?: string;
  address?: string;
  notes?: string;
}

export interface DriveSyncStatus {
  isConnected: boolean;
  userEmail?: string;
  userName?: string;
  userPhoto?: string;
  lastSyncedAt?: string;
  isSyncing: boolean;
  fileId?: string;
  error?: string | null;
}

export interface Student {
  id: string;
  studentCode: string;      // ១. អត្តលេខ
  fullNameKhmer: string;    // ២. ឈ្មោះខ្មែរ
  fullNameEn: string;       // ៣. ឈ្មោះឡាតាំង
  chineseName: string;      // ៤. ឈ្មោះចិន
  gender: 'M' | 'F';        // ៥. ភេទ
  dob: string;              // ៦. ថ្ងៃខែកំណើត
  major: string;            // ៧. ជំនាញ
  generation: string;       // ៨. ជំនាន់
  yearLevel: string;        // ៩. ឆ្នាំ
  semester: string;         // ១០. ឆមាស
  shift: string;            // ១១. វេនសិក្សា
  classId: string;
  className: string;
  avatarUrl: string;
  initialKhmer: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
}

export interface ClassRoom {
  id: string;
  nameKhmer: string;
  grade: string;
  roomNumber: string;
  teacherName: string;
  totalStudents: number;
  academicYear: string;
  major?: string;
  shift?: string;
  generation?: string;
  semester?: string;
}

export interface Major {
  id: string;
  code: string;
  nameKhmer: string;
  nameChinese?: string;
  nameEn?: string;
  degreeLevel?: string;
  durationYears?: number;
  description?: string;
}

export interface Generation {
  id: string;
  nameKhmer: string; // e.g. "ជំនាន់ទី ៣"
  nameEn?: string;
  startYear?: string;
  endYear?: string;
  status: 'active' | 'graduated' | 'upcoming';
  description?: string;
}

export interface AcademicYear {
  id: string;
  nameKhmer: string; // e.g. "2026-2027"
  nameEn?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface YearLevel {
  id: string;
  nameKhmer: string; // e.g. "ឆ្នាំទី ៤"
  nameEn?: string;
  levelNumber: number;
  description?: string;
}

export interface Semester {
  id: string;
  nameKhmer: string; // e.g. "ឆមាសទី ១"
  nameEn?: string;
  semesterNumber: number;
  isCurrent: boolean;
  description?: string;
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  recordedAt?: string;
}

export interface DailyAttendanceState {
  date: string;
  classId: string;
  records: Record<string, AttendanceRecord>;
  submittedAt?: string;
  submittedBy?: string;
}

export interface TeacherAttendanceRecord {
  teacherName: string;
  attendanceDate: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  note?: string;
  recordedBy?: string;
}

export interface MonthlyTrendData {
  monthKhmer: string;
  monthEn: string;
  rate: number;
  isCurrent?: boolean;
}

export interface StudentReportSummary {
  student: Student;
  presentCount: number;
  absentCount: number;
  permissionCount: number;
  lateCount: number;
  totalDays: number;
  ratePercentage: number;
}
