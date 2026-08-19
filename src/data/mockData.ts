import type {
  AcademicYear,
  ClassRoom,
  Generation,
  Major,
  MonthlyTrendData,
  Semester,
  Student,
  Teacher,
  YearLevel
} from '../types';
import schoolLogoImg from '../assets/images/icetilogo.jpg';
import adminAvatarImg from '../assets/images/admin_avatar_1787026378402.jpg';

export const APP_ASSETS = {
  loginLogo: schoolLogoImg,
  schoolLogo: schoolLogoImg,
  adminAvatar: adminAvatarImg,
  userAvatar: adminAvatarImg,
  teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

export const MONTHLY_TREND_DATA: MonthlyTrendData[] = [
  { monthKhmer: 'តុលា', monthEn: 'Oct', rate: 96 },
  { monthKhmer: 'វិច្ឆិកា', monthEn: 'Nov', rate: 94 },
  { monthKhmer: 'ធ្នូ', monthEn: 'Dec', rate: 92 },
  { monthKhmer: 'មករា', monthEn: 'Jan', rate: 95 },
  { monthKhmer: 'កុម្ភៈ', monthEn: 'Feb', rate: 97 },
  { monthKhmer: 'មីនា', monthEn: 'Mar', rate: 93 },
  { monthKhmer: 'មេសា', monthEn: 'Apr', rate: 91 },
  { monthKhmer: 'ឧសភា', monthEn: 'May', rate: 98, isCurrent: true }
];

export const INITIAL_GENERATIONS: Generation[] = [
  { id: 'gen-1', nameKhmer: 'ជំនាន់ទី ១', nameEn: 'Generation 1', startYear: '2023', endYear: '2027', status: 'active', description: 'និស្សិតចូលរៀនឆ្នាំ ២០២៣' },
  { id: 'gen-2', nameKhmer: 'ជំនាន់ទី ២', nameEn: 'Generation 2', startYear: '2024', endYear: '2028', status: 'active', description: 'និស្សិតចូលរៀនឆ្នាំ ២០២៤' },
  { id: 'gen-3', nameKhmer: 'ជំនាន់ទី ៣', nameEn: 'Generation 3', startYear: '2025', endYear: '2029', status: 'active', description: 'និស្សិតចូលរៀនឆ្នាំ ២០២៥' },
  { id: 'gen-4', nameKhmer: 'ជំនាន់ទី ៤', nameEn: 'Generation 4', startYear: '2026', endYear: '2030', status: 'active', description: 'និស្សិតចូលរៀនឆ្នាំ ២០២៦ (បច្ចុប្បន្ន)' }
];

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'ay-2024', nameKhmer: '2024-2025', nameEn: '2024-2025', startDate: '2024-10-01', endDate: '2025-07-31', isCurrent: false, description: 'ឆ្នាំសិក្សា ២០២៤-២០២៥' },
  { id: 'ay-2025', nameKhmer: '2025-2026', nameEn: '2025-2026', startDate: '2025-10-01', endDate: '2026-07-31', isCurrent: false, description: 'ឆ្នាំសិក្សា ២០២៥-២០២៦' },
  { id: 'ay-2026', nameKhmer: '2026-2027', nameEn: '2026-2027', startDate: '2026-10-01', endDate: '2027-07-31', isCurrent: true, description: 'ឆ្នាំសិក្សា ២០២៦-២០២៧ (បច្ចុប្បន្ន)' }
];

export const INITIAL_YEAR_LEVELS: YearLevel[] = [
  { id: 'yl-1', nameKhmer: 'ឆ្នាំទី ១', nameEn: 'Year 1', levelNumber: 1, description: 'ថ្នាក់ឆ្នាំទី ១ មូលដ្ឋាន' },
  { id: 'yl-2', nameKhmer: 'ឆ្នាំទី ២', nameEn: 'Year 2', levelNumber: 2, description: 'ថ្នាក់ឆ្នាំទី ២ មធ្យម' },
  { id: 'yl-3', nameKhmer: 'ឆ្នាំទី ៣', nameEn: 'Year 3', levelNumber: 3, description: 'ថ្នាក់ឆ្នាំទី ៣ ឯកទេស' },
  { id: 'yl-4', nameKhmer: 'ឆ្នាំទី ៤', nameEn: 'Year 4', levelNumber: 4, description: 'ថ្នាក់ឆ្នាំទី ៤ គរុកោសល្យ និងបញ្ចប់ការសិក្សា' }
];

export const INITIAL_SEMESTERS: Semester[] = [
  { id: 'sem-1', nameKhmer: 'ឆមាសទី ១', nameEn: 'Semester 1', semesterNumber: 1, isCurrent: true, description: 'ឆមាសទី ១ នៃឆ្នាំសិក្សា' },
  { id: 'sem-2', nameKhmer: 'ឆមាសទី ២', nameEn: 'Semester 2', semesterNumber: 2, isCurrent: false, description: 'ឆមាសទី ២ នៃឆ្នាំសិក្សា' }
];

export const INITIAL_MAJORS: Major[] = [
  {
    id: 'm-pedagogy',
    code: 'EDU-CHN',
    nameKhmer: 'គរុកោសល្យភាសាចិន',
    nameChinese: '国际中文教育',
    nameEn: 'Chinese Language Pedagogy',
    degreeLevel: 'បរិញ្ញាបត្រ (Bachelor)',
    durationYears: 4,
    description: 'បណ្តុះបណ្តាលគ្រូបង្រៀនភាសាចិនកម្រិតវិជ្ជាជីវៈខ្ពស់'
  },
  {
    id: 'm-business',
    code: 'BUS-CHN',
    nameKhmer: 'ភាសាចិនពាណិជ្ជកម្ម',
    nameChinese: '商务中文',
    nameEn: 'Business Chinese',
    degreeLevel: 'បរិញ្ញាបត្រ (Bachelor)',
    durationYears: 4,
    description: 'ភាសាចិនសម្រាប់ពាណិជ្ជកម្ម អន្តរជាតិ និងទំនាក់ទំនងសេដ្ឋកិច្ច'
  },
  {
    id: 'm-translation',
    code: 'TRA-CHN',
    nameKhmer: 'បកប្រែភាសាចិន',
    nameChinese: '汉柬翻译',
    nameEn: 'Chinese Translation & Interpretation',
    degreeLevel: 'បរិញ្ញាបត្រ (Bachelor)',
    durationYears: 4,
    description: 'ជំនាញបកប្រែផ្ទាល់មាត់ និងឯកសារផ្លូវការ'
  }
];

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'c-12a',
    nameKhmer: 'គរុកោសល្យ ឆ្នាំទី ៤ - ក',
    grade: 'ឆ្នាំទី ៤',
    roomNumber: 'A-301',
    teacherName: 'លោកគ្រូ សុខ ចាន់ថា',
    totalStudents: 8,
    academicYear: '2026-2027'
  },
  {
    id: 'c-12b',
    nameKhmer: 'គរុកោសល្យ ឆ្នាំទី ៤ - ខ',
    grade: 'ឆ្នាំទី ៤',
    roomNumber: 'A-302',
    teacherName: 'អ្នកគ្រូ គង់ សុភាព',
    totalStudents: 6,
    academicYear: '2026-2027'
  },
  {
    id: 'c-11a',
    nameKhmer: 'ភាសាចិនពាណិជ្ជកម្ម ឆ្នាំទី ៣',
    grade: 'ឆ្នាំទី ៣',
    roomNumber: 'B-201',
    teacherName: 'លោកគ្រូ ហេង ពិសិដ្ឋ',
    totalStudents: 5,
    academicYear: '2026-2027'
  },
  {
    id: 'c-10a',
    nameKhmer: 'បកប្រែភាសាចិន ឆ្នាំទី ២',
    grade: 'ឆ្នាំទី ២',
    roomNumber: 'B-102',
    teacherName: 'អ្នកគ្រូ លី គឹមលាង',
    totalStudents: 4,
    academicYear: '2026-2027'
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-1',
    teacherCode: 'T-001',
    fullNameKhmer: 'សុខ ចាន់ថា',
    fullNameEn: 'Sok Chantha',
    chineseName: '索占达',
    gender: 'M',
    phone: '012 345 678',
    email: 'chantha.sok@cpi.edu.kh',
    degreeKhmer: 'អនុបណ្ឌិត (Master in Teaching Chinese)',
    specialization: 'គរុកោសល្យភាសាចិន និងវេយ្យាករណ៍កម្រិតខ្ពស់',
    assignedClasses: ['c-12a'],
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinDate: '2022-09-01',
    address: 'រាជធានីភ្នំពេញ'
  },
  {
    id: 't-2',
    teacherCode: 'T-002',
    fullNameKhmer: 'គង់ សុភាព',
    fullNameEn: 'Kong Sopheap',
    chineseName: '孔淑萍',
    gender: 'F',
    phone: '098 765 432',
    email: 'sopheap.kong@cpi.edu.kh',
    degreeKhmer: 'អនុបណ្ឌិត (Master in Chinese Linguistics)',
    specialization: 'សូរសព្ទវិទ្យា និងអក្សរសាស្ត្រចិន',
    assignedClasses: ['c-12b'],
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    joinDate: '2023-01-15',
    address: 'រាជធានីភ្នំពេញ'
  },
  {
    id: 't-3',
    teacherCode: 'T-003',
    fullNameKhmer: 'ហេង ពិសិដ្ឋ',
    fullNameEn: 'Heng Piseth',
    chineseName: '王培森',
    gender: 'M',
    phone: '017 888 999',
    email: 'piseth.heng@cpi.edu.kh',
    degreeKhmer: 'បណ្ឌិត (PhD in International Business & Chinese)',
    specialization: 'ភាសាចិនពាណិជ្ជកម្ម និងសេដ្ឋកិច្ចអន្តរជាតិ',
    assignedClasses: ['c-11a'],
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinDate: '2021-10-01',
    address: 'ខេត្តកណ្តាល'
  },
  {
    id: 't-4',
    teacherCode: 'T-004',
    fullNameKhmer: 'លី គឹមលាង',
    fullNameEn: 'Ly Kimleang',
    chineseName: '李金莲',
    gender: 'F',
    phone: '085 222 333',
    email: 'kimleang.ly@cpi.edu.kh',
    degreeKhmer: 'បរិញ្ញាបត្រជាន់ខ្ពស់ (Master in Translation)',
    specialization: 'បកប្រែផ្ទាល់មាត់ ខ្មែរ-ចិន និងការទូត',
    assignedClasses: ['c-10a'],
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    joinDate: '2023-08-01',
    address: 'រាជធានីភ្នំពេញ'
  },
  {
    id: 't-5',
    teacherCode: 'T-005',
    fullNameKhmer: 'ចេង វ៉ាន់នី',
    fullNameEn: 'Cheng Vanny',
    chineseName: '郑万妮',
    gender: 'F',
    phone: '011 555 444',
    email: 'vanny.cheng@cpi.edu.kh',
    degreeKhmer: 'បរិញ្ញាបត្រ (Bachelor in Education)',
    specialization: 'វិធីសាស្ត្របង្រៀនកុមារ និងសិល្បៈវប្បធម៌ចិន',
    assignedClasses: [],
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    joinDate: '2024-02-01',
    address: 'ខេត្តសៀមរាប'
  },
  {
    id: 't-6',
    teacherCode: 'T-006',
    fullNameKhmer: 'ម៉ី ស្រីមុំ',
    fullNameEn: 'Mey Sreymom',
    chineseName: '梅素梦',
    gender: 'F',
    phone: '096 777 888',
    email: 'sreymom.mey@cpi.edu.kh',
    degreeKhmer: 'អនុបណ្ឌិត (Master of Arts)',
    specialization: 'វប្បធម៌ និងប្រវត្តិសាស្ត្រចិន-អាស៊ីអាគ្នេយ៍',
    assignedClasses: [],
    status: 'leave',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    joinDate: '2022-11-15',
    address: 'ខេត្តកំពត'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's-1',
    studentCode: 'CPI-2026-001',
    fullNameKhmer: 'សុខ ចាន់ដារា',
    fullNameEn: 'Sok Chandara',
    chineseName: '苏达拉',
    gender: 'M',
    dob: '2004-03-15',
    major: 'គរុកោសល្យភាសាចិន',
    generation: 'ជំនាន់ទី ៤',
    yearLevel: 'ឆ្នាំទី ៤',
    semester: 'ឆមាសទី ១',
    shift: 'ព្រឹក (Morning)',
    classId: 'c-12a',
    className: 'គរុកោសល្យ ឆ្នាំទី ៤ - ក',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    initialKhmer: 'ដា',
    phone: '012 345 678',
    parentName: 'សុខ គឹមហុង',
    parentPhone: '012 999 888',
    address: 'រាជធានីភ្នំពេញ'
  },
  {
    id: 's-2',
    studentCode: 'CPI-2026-002',
    fullNameKhmer: 'គង់ ស្រីលីន',
    fullNameEn: 'Kong Sreylin',
    chineseName: '孔丽琳',
    gender: 'F',
    dob: '2004-07-22',
    major: 'គរុកោសល្យភាសាចិន',
    generation: 'ជំនាន់ទី ៤',
    yearLevel: 'ឆ្នាំទី ៤',
    semester: 'ឆមាសទី ១',
    shift: 'ព្រឹក (Morning)',
    classId: 'c-12a',
    className: 'គរុកោសល្យ ឆ្នាំទី ៤ - ក',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    initialKhmer: 'លីន',
    phone: '098 765 432',
    parentName: 'គង់ វណ្ណា',
    parentPhone: '098 111 222',
    address: 'ខេត្តកណ្តាល'
  },
  {
    id: 's-3',
    studentCode: 'CPI-2026-003',
    fullNameKhmer: 'ចាន់ ពិសិដ្ឋ',
    fullNameEn: 'Chan Piseth',
    chineseName: '陈必胜',
    gender: 'M',
    dob: '2004-11-05',
    major: 'គរុកោសល្យភាសាចិន',
    generation: 'ជំនាន់ទី ៤',
    yearLevel: 'ឆ្នាំទី ៤',
    semester: 'ឆមាសទី ១',
    shift: 'ព្រឹក (Morning)',
    classId: 'c-12a',
    className: 'គរុកោសល្យ ឆ្នាំទី ៤ - ក',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    initialKhmer: 'សិដ្ឋ',
    phone: '088 555 666',
    parentName: 'ចាន់ ធារ៉ា',
    parentPhone: '088 333 444',
    address: 'ខេត្តកំពង់ចាម'
  },
  {
    id: 's-4',
    studentCode: 'CPI-2026-004',
    fullNameKhmer: 'លី គឹមហួរ',
    fullNameEn: 'Ly Kimhour',
    chineseName: '李金华',
    gender: 'M',
    dob: '2004-01-30',
    major: 'គរុកោសល្យភាសាចិន',
    generation: 'ជំនាន់ទី ៤',
    yearLevel: 'ឆ្នាំទី ៤',
    semester: 'ឆមាសទី ១',
    shift: 'ព្រឹក (Morning)',
    classId: 'c-12a',
    className: 'គរុកោសល្យ ឆ្នាំទី ៤ - ក',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    initialKhmer: 'ហួរ',
    phone: '017 123 789',
    parentName: 'លី សេងហុង',
    parentPhone: '017 999 111',
    address: 'រាជធានីភ្នំពេញ'
  },
  {
    id: 's-5',
    studentCode: 'CPI-2026-005',
    fullNameKhmer: 'អ៊ឹង សុវណ្ណារ៉ា',
    fullNameEn: 'Eung Sovannara',
    chineseName: '应万娜',
    gender: 'F',
    dob: '2004-09-18',
    major: 'គរុកោសល្យភាសាចិន',
    generation: 'ជំនាន់ទី ៤',
    yearLevel: 'ឆ្នាំទី ៤',
    semester: 'ឆមាសទី ១',
    shift: 'ព្រឹក (Morning)',
    classId: 'c-12a',
    className: 'គរុកោសល្យ ឆ្នាំទី ៤ - ក',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    initialKhmer: 'រ៉ា',
    phone: '096 888 777',
    parentName: 'អ៊ឹង សុផល',
    parentPhone: '096 222 333',
    address: 'ខេត្តបាត់ដំបង'
  },
  {
    id: 's-6',
    studentCode: 'CPI-2026-006',
    fullNameKhmer: 'ជា វ៉ាន់នី',
    fullNameEn: 'Chea Vanny',
    chineseName: '谢万尼',
    gender: 'M',
    dob: '2004-04-10',
    major: 'គរុកោសល្យភាសាចិន',
    generation: 'ជំនាន់ទី ៤',
    yearLevel: 'ឆ្នាំទី ៤',
    semester: 'ឆមាសទី ១',
    shift: 'ព្រឹក (Morning)',
    classId: 'c-12a',
    className: 'គរុកោសល្យ ឆ្នាំទី ៤ - ក',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    initialKhmer: 'នី',
    phone: '010 333 999',
    parentName: 'ជា ប៊ុនថន',
    parentPhone: '010 888 777',
    address: 'ខេត្តសៀមរាប'
  },
  {
    id: 's-7',
    studentCode: 'CPI-2026-007',
    fullNameKhmer: 'ម៉ី សុខលី',
    fullNameEn: 'Mey Sokhly',
    chineseName: '梅素丽',
    gender: 'F',
    dob: '2004-12-01',
    major: 'គរុកោសល្យភាសាចិន',
    generation: 'ជំនាន់ទី ៤',
    yearLevel: 'ឆ្នាំទី ៤',
    semester: 'ឆមាសទី ១',
    shift: 'ព្រឹក (Morning)',
    classId: 'c-12a',
    className: 'គរុកោសល្យ ឆ្នាំទី ៤ - ក',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    initialKhmer: 'លី',
    phone: '077 444 555',
    parentName: 'ម៉ី សម្បត្តិ',
    parentPhone: '077 666 555',
    address: 'ខេត្តកំពត'
  },
  {
    id: 's-8',
    studentCode: 'CPI-2026-008',
    fullNameKhmer: 'ទ្រី សុភាព',
    fullNameEn: 'Try Sopheap',
    chineseName: '郑素萍',
    gender: 'F',
    dob: '2004-06-14',
    major: 'គរុកោសល្យភាសាចិន',
    generation: 'ជំនាន់ទី ៤',
    yearLevel: 'ឆ្នាំទី ៤',
    semester: 'ឆមាសទី ១',
    shift: 'ព្រឹក (Morning)',
    classId: 'c-12a',
    className: 'គរុកោសល្យ ឆ្នាំទី ៤ - ក',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    initialKhmer: 'ភាព',
    phone: '085 222 111',
    parentName: 'ទ្រី គឹមឡេង',
    parentPhone: '085 777 888',
    address: 'រាជធានីភ្នំពេញ'
  },
  {
    id: 's-9',
    studentCode: 'CPI-2026-009',
    fullNameKhmer: 'ផន ពិសី',
    fullNameEn: 'Phorn Pisey',
    chineseName: '潘碧茜',
    gender: 'F',
    dob: '2004-08-19',
    major: 'គរុកោសល្យភាសាចិន',
    generation: 'ជំនាន់ទី ៤',
    yearLevel: 'ឆ្នាំទី ៤',
    semester: 'ឆមាសទី ១',
    shift: 'ព្រឹក (Morning)',
    classId: 'c-12b',
    className: 'គរុកោសល្យ ឆ្នាំទី ៤ - ខ',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    initialKhmer: 'សី',
    phone: '012 888 333',
    parentName: 'ផន វិបុល',
    parentPhone: '012 444 333',
    address: 'ខេត្តកណ្តាល'
  },
  {
    id: 's-10',
    studentCode: 'CPI-2026-010',
    fullNameKhmer: 'ឡាយ វីរៈ',
    fullNameEn: 'Lay Virak',
    chineseName: '赖伟拉克',
    gender: 'M',
    dob: '2004-02-28',
    major: 'គរុកោសល្យភាសាចិន',
    generation: 'ជំនាន់ទី ៤',
    yearLevel: 'ឆ្នាំទី ៤',
    semester: 'ឆមាសទី ១',
    shift: 'ព្រឹក (Morning)',
    classId: 'c-12b',
    className: 'គរុកោសល្យ ឆ្នាំទី ៤ - ខ',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    initialKhmer: 'រៈ',
    phone: '093 111 555',
    parentName: 'ឡាយ ចាន់ថន',
    parentPhone: '093 666 777',
    address: 'ខេត្តតាកែវ'
  }
];
