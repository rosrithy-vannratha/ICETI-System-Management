import { Student } from '../types';

export interface StudentDirectoryFilters {
  searchTerm: string;
  major: string;
  yearLevel: string;
  shift: string;
  className?: string;
  generation?: string;
  gender?: string;
}

const ALL_FILTER_VALUE = 'all';
const KHMER_DIGITS = '០១២៣៤៥៦៧៨៩';

export const normalizeFilterValue = (value: unknown): string => {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[០-៩]/g, (digit) => String(KHMER_DIGITS.indexOf(digit)))
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase();
};

const getGenderSearchValues = (gender: Student['gender']): string[] => {
  return gender === 'M'
    ? ['m', 'male', 'ប្រុស']
    : ['f', 'female', 'ស្រី'];
};

const getCoreAttributeValues = (student: Student): string[] => [
  student.studentCode || '',
  student.fullNameKhmer || '',
  student.fullNameEn || '',
  student.chineseName || '',
  ...getGenderSearchValues(student.gender),
  student.dob || '',
  student.major || '',
  student.generation || '',
  student.yearLevel || '',
  student.semester || '',
  student.shift || '',
  student.className || '',
  student.phone || '',
  student.parentName || ''
];

const matchesSelectedValue = (studentValue: string | undefined, selectedValue: string | undefined): boolean => {
  if (!selectedValue || selectedValue === ALL_FILTER_VALUE) return true;
  if (!studentValue) return false;

  const normStudent = normalizeFilterValue(studentValue);
  const normSelected = normalizeFilterValue(selectedValue);

  if (normStudent === normSelected) return true;
  if (normStudent.includes(normSelected) || normSelected.includes(normStudent)) return true;

  // Specific semantic checks for Shifts (ព្រឹក/Morning, រសៀល/Afternoon, យប់/Evening, ចុងសប្តាហ៍/Weekend)
  if (normSelected.includes('ព្រឹក') && (normStudent.includes('ព្រឹក') || normStudent.includes('morning'))) return true;
  if (normSelected.includes('រសៀល') && (normStudent.includes('រសៀល') || normStudent.includes('afternoon'))) return true;
  if (normSelected.includes('យប់') && (normStudent.includes('យប់') || normStudent.includes('night') || normStudent.includes('evening'))) return true;
  if (normSelected.includes('ចុងសប្តាហ៍') && (normStudent.includes('ចុងសប្តាហ៍') || normStudent.includes('weekend'))) return true;

  return false;
};

const matchesGender = (studentGender: Student['gender'], selectedGender: string | undefined): boolean => {
  if (!selectedGender || selectedGender === ALL_FILTER_VALUE) return true;
  const normSelected = normalizeFilterValue(selectedGender);
  if (normSelected === 'm' || normSelected === 'male' || normSelected.includes('ប្រុស')) {
    return studentGender === 'M';
  }
  if (normSelected === 'f' || normSelected === 'female' || normSelected.includes('ស្រី')) {
    return studentGender === 'F';
  }
  return true;
};

export const matchesStudentDirectoryFilters = (
  student: Student,
  filters: StudentDirectoryFilters
): boolean => {
  // Search Term matching across all token keywords
  const queryTokens = normalizeFilterValue(filters.searchTerm).split(' ').filter(Boolean);
  const searchableValues = getCoreAttributeValues(student).map(normalizeFilterValue);
  const matchesSearch = queryTokens.every((token) =>
    searchableValues.some((value) => value.includes(token))
  );

  return (
    matchesSearch &&
    matchesSelectedValue(student.major, filters.major) &&
    matchesSelectedValue(student.yearLevel, filters.yearLevel) &&
    matchesSelectedValue(student.shift, filters.shift) &&
    matchesSelectedValue(student.className || student.classId, filters.className) &&
    matchesSelectedValue(student.generation, filters.generation) &&
    matchesGender(student.gender, filters.gender)
  );
};

export const getStudentFilterOptions = (
  configuredValues: string[],
  studentValues: string[]
): string[] => {
  const options = new Map<string, string>();

  [...configuredValues, ...studentValues].forEach((value) => {
    const trimmedValue = value?.trim();
    const normalizedValue = normalizeFilterValue(trimmedValue);

    if (trimmedValue && normalizedValue && !options.has(normalizedValue)) {
      options.set(normalizedValue, trimmedValue);
    }
  });

  return Array.from(options.values()).sort((first, second) =>
    first.localeCompare(second, ['km', 'en'], { numeric: true })
  );
};
