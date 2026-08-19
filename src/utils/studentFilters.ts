import { Student } from '../types';

export interface StudentDirectoryFilters {
  searchTerm: string;
  major: string;
  yearLevel: string;
  shift: string;
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
    ? ['M', 'Male', 'ប្រុស']
    : ['F', 'Female', 'ស្រី'];
};

const getCoreAttributeValues = (student: Student): string[] => [
  student.studentCode,
  student.fullNameKhmer,
  student.fullNameEn,
  student.chineseName,
  ...getGenderSearchValues(student.gender),
  student.dob,
  student.major,
  student.generation,
  student.yearLevel,
  student.semester,
  student.shift
];

const matchesSelectedValue = (studentValue: string, selectedValue: string): boolean => {
  return selectedValue === ALL_FILTER_VALUE
    || normalizeFilterValue(studentValue) === normalizeFilterValue(selectedValue);
};

export const matchesStudentDirectoryFilters = (
  student: Student,
  filters: StudentDirectoryFilters
): boolean => {
  const queryTokens = normalizeFilterValue(filters.searchTerm).split(' ').filter(Boolean);
  const searchableValues = getCoreAttributeValues(student).map(normalizeFilterValue);
  const matchesSearch = queryTokens.every((token) =>
    searchableValues.some((value) => value.includes(token))
  );

  return matchesSearch
    && matchesSelectedValue(student.major, filters.major)
    && matchesSelectedValue(student.yearLevel, filters.yearLevel)
    && matchesSelectedValue(student.shift, filters.shift);
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
