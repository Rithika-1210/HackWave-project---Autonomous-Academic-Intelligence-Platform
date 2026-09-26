/**
 * Institutional Academic Semester Rules
 * - Engineering Departments (B.Tech 4 Years): 8 Semesters (1 to 8)
 * - Computing Technologies UG (B.Sc 3 Years): 6 Semesters (1 to 6)
 * - Computing Technologies PG (Integrated M.Sc 5 Years): 10 Semesters (1 to 10)
 */

export function getDepartmentSemesters(deptCodeOrName?: string | null, courseCode?: string | null): number[] {
  if (!deptCodeOrName) {
    return [1, 2, 3, 4, 5, 6, 7, 8];
  }

  const clean = deptCodeOrName.toUpperCase().trim();
  const cClean = courseCode ? courseCode.toUpperCase().trim() : '';

  if (cClean === 'CT_UG' || cClean.includes('B.SC') || cClean.includes('BSC')) {
    return [1, 2, 3, 4, 5, 6];
  }

  if (cClean === 'CT_PG' || cClean.includes('M.SC') || cClean.includes('MSC') || cClean.includes('INTEGRATED')) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  if (clean === 'CT' || clean.includes('COMPUTING TECHNOLOGIES')) {
    // If CT department is selected without explicit course filter, allow up to 10 semesters (covering both UG and PG)
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  // All 12 Engineering Departments (CSE, IT, ECE, EEE, MECH, CIVIL, DSAI, AIML, BME, CHEM, MCT, AERO)
  // Strictly 4-year engineering = 8 Semesters
  return [1, 2, 3, 4, 5, 6, 7, 8];
}
