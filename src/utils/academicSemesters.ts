/**
 * Institutional Academic Semester & Year Rules:
 * - Engineering Departments (B.Tech 4 Years): 8 Semesters (1 to 8) -> Years 1, 2, 3, 4
 * - Computing Technologies UG (B.Sc 3 Years): 6 Semesters (1 to 6) -> Years 1, 2, 3
 * - Computing Technologies PG (Integrated M.Sc 5 Years): 10 Semesters (1 to 10) -> Years 1, 2, 3, 4, 5
 */

export function getDepartmentSemesters(deptCodeOrName?: string | null, courseCode?: string | null): number[] {
  const clean = (deptCodeOrName || '').toUpperCase().trim();
  const cClean = (courseCode || '').toUpperCase().trim();

  // Explicit CT_PG / Integrated M.Sc check
  if (
    clean.includes('CT_PG') || 
    cClean.includes('CT_PG') || 
    clean.includes('M.SC') || 
    cClean.includes('M.SC') || 
    clean.includes('MSC') || 
    cClean.includes('MSC') || 
    clean.includes('INTEGRATED') || 
    cClean.includes('INTEGRATED')
  ) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  // Computing Technologies UG (B.Sc 3 Years)
  if (
    clean.includes('CT_UG') || 
    cClean.includes('CT_UG') || 
    clean.includes('B.SC') || 
    cClean.includes('B.SC') || 
    clean.includes('BSC') || 
    cClean.includes('BSC') ||
    clean === 'CT' ||
    clean.includes('COMPUTING TECHNOLOGIES')
  ) {
    return [1, 2, 3, 4, 5, 6];
  }

  // All 12 Engineering Departments (CSE, IT, ECE, EEE, MECH, CIVIL, DSAI, AIML, BME, CHEM, MCT, AERO)
  // Strictly 4-year engineering = 8 Semesters
  return [1, 2, 3, 4, 5, 6, 7, 8];
}

export function getDepartmentYears(deptCodeOrName?: string | null, courseCode?: string | null): number[] {
  const semesters = getDepartmentSemesters(deptCodeOrName, courseCode);
  const totalYears = Math.ceil(semesters.length / 2);
  return Array.from({ length: totalYears }, (_, i) => i + 1);
}

export function getYearForSemester(sem: number): number {
  return Math.ceil(sem / 2);
}

export function getSemestersForYear(year: number, maxSemester: number = 8): number[] {
  const sem1 = (year - 1) * 2 + 1;
  const sem2 = (year - 1) * 2 + 2;
  const sems: number[] = [];
  if (sem1 <= maxSemester) sems.push(sem1);
  if (sem2 <= maxSemester) sems.push(sem2);
  return sems;
}
