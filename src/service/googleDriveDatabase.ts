import type {
  AcademicYear,
  AttendanceStatus,
  ClassRoom,
  DailyAttendanceState,
  Generation,
  Major,
  Semester,
  Student,
  Teacher,
  TeacherAttendanceRecord,
  YearLevel
} from '../types';

export const DATABASE_FILENAME = 'cpi_school_database.json';

export interface SchoolDatabasePayload {
  version: string;
  updatedAt: string;
  schoolName: string;
  students: Student[];
  teachers: Teacher[];
  classes: ClassRoom[];
  majors: Major[];
  academicStructure: {
    generations: Generation[];
    academicYears: AcademicYear[];
    yearLevels: YearLevel[];
    semesters: Semester[];
  };
  savedAttendances?: Record<string, Record<string, { status: AttendanceStatus; note?: string }>>;
  studentAttendances?: Record<string, DailyAttendanceState>;
  teacherAttendances?: Record<string, TeacherAttendanceRecord[]>;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
}

/**
 * Searches for existing database JSON file on the user's Google Drive.
 */
export async function findDriveDatabaseFile(accessToken: string): Promise<DriveFileInfo | null> {
  const query = encodeURIComponent(`name = '${DATABASE_FILENAME}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size,webViewLink)&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'មិនអាចស្វែងរកឯកសារនៅលើ Google Drive បានទេ');
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0] as DriveFileInfo;
  }
  return null;
}

/**
 * Saves or updates the entire school database directly on Google Drive.
 */
export async function saveDatabaseToGoogleDrive(
  payload: SchoolDatabasePayload,
  accessToken: string
): Promise<{ fileId: string; modifiedTime: string }> {
  // Check if file already exists
  const existingFile = await findDriveDatabaseFile(accessToken);
  const jsonContent = JSON.stringify(payload, null, 2);

  if (existingFile) {
    // Update existing file
    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`;
    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: jsonContent
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || 'បរាជ័យក្នុងការកែប្រែទិន្នន័យលើ Google Drive');
    }

    const resData = await response.json();
    return {
      fileId: resData.id || existingFile.id,
      modifiedTime: resData.modifiedTime || new Date().toISOString()
    };
  } else {
    // Create new file via multipart upload
    const metadata = {
      name: DATABASE_FILENAME,
      mimeType: 'application/json',
      description: 'មូលដ្ឋានទិន្នន័យប្រព័ន្ធគ្រប់គ្រងសិស្ស និងវត្តមាន វិទ្យាស្ថានគរុកោសល្យភាសាចិន (CPI School Database)'
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      jsonContent +
      closeDelimiter;

    const createUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    const response = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || 'បរាជ័យក្នុងការបង្កើតឯកសារលើ Google Drive');
    }

    const resData = await response.json();
    return {
      fileId: resData.id,
      modifiedTime: resData.modifiedTime || new Date().toISOString()
    };
  }
}

/**
 * Downloads and parses the database JSON file from Google Drive.
 */
export async function loadDatabaseFromGoogleDrive(
  accessToken: string
): Promise<{ fileInfo: DriveFileInfo; data: SchoolDatabasePayload } | null> {
  const existingFile = await findDriveDatabaseFile(accessToken);
  if (!existingFile) return null;

  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`;
  const response = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'មិនអាចទាញយកទិន្នន័យពី Google Drive បានទេ');
  }

  const data: SchoolDatabasePayload = await response.json();
  return {
    fileInfo: existingFile,
    data
  };
}

/**
 * Deletes the database file from Google Drive (MUST be confirmed by user in UI first).
 */
export async function deleteDriveDatabaseFile(fileId: string, accessToken: string): Promise<boolean> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'មិនអាចលុបឯកសារពី Google Drive បានទេ');
  }

  return true;
}
