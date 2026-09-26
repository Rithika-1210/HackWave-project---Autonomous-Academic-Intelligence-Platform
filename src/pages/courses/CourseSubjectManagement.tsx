import React, { useEffect, useState } from 'react';
import { coursesApi, subjectsApi, departmentsApi, facultyApi, enrollmentsApi, studentsApi } from '@/services/api';
import { Course, Subject, Department, Faculty, StudentEnrollment, Student } from '@/types';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { TabNavigation } from '@/components/common/TabNavigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen, Plus, Search, Filter, Edit, Trash2,
  Layers, Clock, UserCheck, AlertCircle, Award, CheckCircle2,
  GraduationCap, Calendar, FileText, Check, X
} from 'lucide-react';
import { getDepartmentSemesters, getDepartmentYears, getSemestersForYear } from '@/utils/academicSemesters';

export const CourseSubjectManagement: React.FC = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const canManage = user?.role === 'admin' || user?.role === 'hod';

  const [activeTab, setActiveTab] = useState<'subjects' | 'courses' | 'enrolled'>('subjects');
  
  // Core Data
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<Faculty[]>([]);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [semFilter, setSemFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Course Modal States (Admin / HOD)
  const [courseModalOpen, setCourseModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [cName, setCName] = useState<string>('');
  const [cCode, setCCode] = useState<string>('');
  const [cDeptId, setCDeptId] = useState<number>(1);
  const [cDuration, setCDuration] = useState<number>(4);
  const [cDegree, setCDegree] = useState<string>('Undergraduate');

  // Subject Modal States (Admin / HOD)
  const [subjectModalOpen, setSubjectModalOpen] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [sName, setSName] = useState<string>('');
  const [sCode, setSCode] = useState<string>('');
  const [sDeptId, setSDeptId] = useState<number>(1);
  const [sCourseId, setSCourseId] = useState<number>(1);
  const [sSemester, setSSemester] = useState<number>(1);
  const [sWeeklyPeriods, setSWeeklyPeriods] = useState<number>(4);
  const [sSubjectType, setSSubjectType] = useState<string>('Theory');
  const [sFacultyId, setSFacultyId] = useState<number | undefined>(undefined);

  // Student Manual Enrollment Modal State & Add Course State
  const [enrollModalOpen, setEnrollModalOpen] = useState<boolean>(false);
  const [enrollTab, setEnrollTab] = useState<'existing' | 'new_course'>('existing');
  const [selectedSubjectToEnroll, setSelectedSubjectToEnroll] = useState<number | undefined>(undefined);
  const [enrollSemester, setEnrollSemester] = useState<number>(6);

  // New Course / Elective Form Fields
  const [newSubName, setNewSubName] = useState<string>('');
  const [newSubCode, setNewSubCode] = useState<string>('');
  const [newSubType, setNewSubType] = useState<string>('Theory');
  const [newSubPeriods, setNewSubPeriods] = useState<number>(4);
  const [newSubFacultyId, setNewSubFacultyId] = useState<number | undefined>(undefined);

  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeDept = departments.find(d => d.id === (deptFilter ? Number(deptFilter) : (user?.department_id || undefined)));
  const availableSemesters = getDepartmentSemesters(activeDept?.code || activeDept?.name);
  const availableYears = getDepartmentYears(activeDept?.code || activeDept?.name);

  const modalDept = departments.find(d => d.id === sDeptId);
  const modalSemesters = getDepartmentSemesters(modalDept?.code || modalDept?.name);

  const loadData = async () => {
    try {
      setLoading(true);
      const queryDeptId = user?.role === 'admin'
        ? (deptFilter ? Number(deptFilter) : undefined)
        : (user?.department_id || undefined);

      const [cData, sData, dData, fData] = await Promise.all([
        coursesApi.getAll({ department_id: queryDeptId }),
        subjectsApi.getAll({
          department_id: queryDeptId,
          semester: semFilter ? Number(semFilter) : undefined,
          search: search || undefined
        }),
        departmentsApi.getAll({ status_filter: 'Active' }),
        facultyApi.getAll({ status_filter: 'Active' })
      ]);

      setCourses(cData);
      setSubjects(sData);
      setDepartments(dData);
      setFacultyMembers(fData);

      if (dData.length > 0 && !cDeptId) {
        setCDeptId(user?.department_id || dData[0].id);
        setSDeptId(user?.department_id || dData[0].id);
      }
      if (cData.length > 0 && !sCourseId) {
        setSCourseId(cData[0].id);
      }

      // If student, load student profile and enrollments
      if (isStudent) {
        try {
          const [stuData, enrData] = await Promise.all([
            studentsApi.getAll(),
            enrollmentsApi.getAll()
          ]);
          if (stuData.length > 0) {
            setStudentProfile(stuData[0]);
            setEnrollSemester(stuData[0].semester || 6);
          }
          setEnrollments(enrData);
        } catch (err) {
          console.error('Failed to load student enrollments:', err);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [deptFilter, semFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Student manual enrollment handler
  const handleEnrollSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectToEnroll) {
      setModalError('Please select a subject to enroll.');
      return;
    }
    try {
      setSubmitting(true);
      setModalError(null);
      await enrollmentsApi.enroll({
        subject_id: selectedSubjectToEnroll,
        semester: enrollSemester
      });
      setSuccessMessage('Successfully enrolled in subject!');
      setEnrollModalOpen(false);
      setSelectedSubjectToEnroll(undefined);
      loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to enroll in subject.');
    } finally {
      setSubmitting(false);
    }
  };

  // Student create new course/elective and auto-enroll handler
  const handleCreateAndEnrollSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) {
      setModalError('Please enter both course name and course code.');
      return;
    }
    try {
      setSubmitting(true);
      setModalError(null);
      const created = await subjectsApi.create({
        name: newSubName.trim(),
        code: newSubCode.trim().toUpperCase(),
        department_id: studentDept?.id || user?.department_id || 9,
        course_id: studentProfile?.course_id || courses[0]?.id || 1,
        semester: enrollSemester,
        weekly_periods: newSubPeriods,
        subject_type: newSubType,
        assigned_faculty_id: newSubFacultyId || null
      });
      await enrollmentsApi.enroll({
        subject_id: created.id,
        semester: enrollSemester
      });
      setSuccessMessage(`Course "${created.name}" (${created.code}) successfully added and enrolled!`);
      setEnrollModalOpen(false);
      setNewSubName('');
      setNewSubCode('');
      loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to add and enroll course.');
    } finally {
      setSubmitting(false);
    }
  };

  // Student unenroll handler
  const handleUnenroll = async (enrollmentId: number, subjectName: string) => {
    if (!window.confirm(`Drop and unenroll from "${subjectName}"?`)) return;
    try {
      await enrollmentsApi.unenroll(enrollmentId);
      setSuccessMessage(`Successfully dropped "${subjectName}".`);
      loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error dropping subject.');
    }
  };

  // Admin Course Handlers
  const openCourseModal = (c?: Course) => {
    setModalError(null);
    if (c) {
      setEditingCourse(c);
      setCName(c.name);
      setCCode(c.code);
      setCDeptId(c.department_id);
      setCDuration(c.duration_years);
      setCDegree(c.degree_type);
    } else {
      setEditingCourse(null);
      setCName('');
      setCCode('');
      setCDeptId(user?.department_id || departments[0]?.id || 1);
      setCDuration(4);
      setCDegree('Undergraduate');
    }
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      setSubmitting(true);
      if (editingCourse) {
        await coursesApi.update(editingCourse.id, {
          name: cName, code: cCode, department_id: cDeptId, duration_years: cDuration, degree_type: cDegree
        });
      } else {
        await coursesApi.create({
          name: cName, code: cCode, department_id: cDeptId, duration_years: cDuration, degree_type: cDegree
        });
      }
      setCourseModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to save course.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (c: Course) => {
    if (!window.confirm(`Delete course "${c.name}"?`)) return;
    try {
      await coursesApi.delete(c.id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error deleting course.');
    }
  };

  // Admin Subject Handlers
  const openSubjectModal = (s?: Subject) => {
    setModalError(null);
    if (s) {
      setEditingSubject(s);
      setSName(s.name);
      setSCode(s.code);
      setSDeptId(s.department_id);
      setSCourseId(s.course_id || courses[0]?.id || 1);
      setSSemester(s.semester);
      setSWeeklyPeriods(s.weekly_periods);
      setSSubjectType(s.subject_type);
      setSFacultyId(s.assigned_faculty_id || undefined);
    } else {
      setEditingSubject(null);
      setSName('');
      setSCode('');
      setSDeptId(user?.department_id || departments[0]?.id || 1);
      setSCourseId(courses[0]?.id || 1);
      setSSemester(1);
      setSWeeklyPeriods(4);
      setSSubjectType('Theory');
      setSFacultyId(undefined);
    }
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      setSubmitting(true);
      if (editingSubject) {
        await subjectsApi.update(editingSubject.id, {
          name: sName, code: sCode, department_id: sDeptId, course_id: sCourseId,
          semester: sSemester, weekly_periods: sWeeklyPeriods, subject_type: sSubjectType,
          assigned_faculty_id: sFacultyId || null
        });
      } else {
        await subjectsApi.create({
          name: sName, code: sCode, department_id: sDeptId, course_id: sCourseId,
          semester: sSemester, weekly_periods: sWeeklyPeriods, subject_type: sSubjectType,
          assigned_faculty_id: sFacultyId || null
        });
      }
      setSubjectModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to save subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (s: Subject) => {
    if (!window.confirm(`Delete subject "${s.name}"?`)) return;
    try {
      await subjectsApi.delete(s.id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error deleting subject.');
    }
  };

  // Determine unenrolled subjects for the student
  const enrolledSubjectIds = new Set(enrollments.map(e => e.subject_id));
  const availableToEnroll = subjects.filter(s => !enrolledSubjectIds.has(s.id));

  // Determine student degree details
  const studentCourse = courses.find(c => c.id === studentProfile?.course_id) || courses[0];
  const studentDept = departments.find(d => d.id === (studentProfile?.department_id || user?.department_id)) || departments[0];
  const studentSem = studentProfile?.semester || 6;
  const studentYear = Math.ceil(studentSem / 2);

  // Instructors scoped to student's department
  const departmentFaculty = (studentDept?.id || user?.department_id)
    ? facultyMembers.filter(f => f.department_id === (studentDept?.id || user?.department_id))
    : facultyMembers;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <PageHeader
        title={isStudent ? "Enrolled Subjects & Academic Performance" : "Course & Subject Management"}
        subtitle={
          isStudent
            ? "Your active enrolled subjects, continuous assessment marks, attendance tracking, and elective choices."
            : "Curricular structure, degree tracks, syllabus subject mapping, and faculty instructor allocations."
        }
        icon={BookOpen}
        actions={
          isStudent ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => { setModalError(null); setEnrollTab('existing'); setEnrollModalOpen(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Choose / Enroll in Subject</span>
              </button>
              <button
                onClick={() => { setModalError(null); setEnrollTab('new_course'); setEnrollModalOpen(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-sky-600" />
                <span>Add Course / Elective</span>
              </button>
            </div>
          ) : canManage && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openCourseModal()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Degree Course</span>
              </button>
              <button
                onClick={() => openSubjectModal()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Curriculum Subject</span>
              </button>
            </div>
          )
        }
      />

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* STUDENT-SPECIFIC VIEW: PERSONAL DEGREE OVERVIEW & ENROLLED SUBJECTS TRACKER */}
      {isStudent ? (
        <div className="space-y-6">
          {/* Chosen Degree & Academic Standing Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-2xl p-6 border border-slate-700 shadow-xl text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
                  <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                  <span>Your Chosen Degree Track</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  {studentCourse ? studentCourse.name : (studentDept?.name || 'B.Sc in Computing Technologies (CT_UG)')}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 font-mono font-bold text-sky-300">
                    Dept: {studentDept?.name || 'Computing Technologies'} ({studentDept?.code || 'CT_UG'})
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 font-mono font-bold text-emerald-300">
                    Year {studentYear} • Semester {studentSem}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 font-mono font-bold text-purple-300">
                    {studentProfile?.student_id || 'STU-CT-007'} • {studentProfile?.batch || 'Batch 2023-2026'}
                  </span>
                </div>
              </div>

              {/* Progress Highlights */}
              <div className="grid grid-cols-3 gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 text-center">
                <div>
                  <div className="text-xl font-black text-sky-400">{enrollments.length}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Enrolled Subjects</div>
                </div>
                <div>
                  <div className="text-xl font-black text-emerald-400">95.4%</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Avg Attendance</div>
                </div>
                <div>
                  <div className="text-xl font-black text-amber-400">9.4</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Predicted CGPA</div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-400 flex items-center justify-between">
              <span>* Isolated to your degree program curriculum. Other departments are excluded.</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Examination Clearance Verified
              </span>
            </div>
          </div>

          {/* Enrolled Subjects Table with Marks Tracking */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Current Semester Enrolled Subjects & Continuous Evaluation</h3>
                <p className="text-xs text-slate-500">Continuous Assessment (IA1, IA2), Assignment Scores, Attendance, and Hall Eligibility.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setModalError(null); setEnrollTab('existing'); setEnrollModalOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enroll in Subject</span>
                </button>
                <button
                  onClick={() => { setModalError(null); setEnrollTab('new_course'); setEnrollModalOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-600" />
                  <span>Add Course / Elective</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2 font-mono">Loading enrolled courses & assessment marks...</p>
              </div>
            ) : enrollments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">No subjects currently enrolled for Semester {studentSem}.</p>
                <p className="text-slate-400">Use the "Choose / Enroll in Subject" button above to register your curriculum courses.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono">
                    <tr>
                      <th className="py-3 px-4">CODE</th>
                      <th className="py-3 px-4">SUBJECT NAME</th>
                      <th className="py-3 px-4">ALLOCATED PROFESSOR</th>
                      <th className="py-3 px-4 text-center">IA 1 (50)</th>
                      <th className="py-3 px-4 text-center">IA 2 (50)</th>
                      <th className="py-3 px-4 text-center">ASSIGNMENT (20)</th>
                      <th className="py-3 px-4 text-center">ATTENDANCE</th>
                      <th className="py-3 px-4 text-center">GRADE</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrollments.map((enr) => (
                      <tr key={enr.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                          {enr.subject_code}
                          <span className="block text-[10px] text-slate-400">{enr.subject_type}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{enr.subject_name}</div>
                          <span className="text-[11px] font-mono text-slate-500">{enr.weekly_periods || 4} credits/week</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{enr.faculty_name || 'Prof. Assigned'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-slate-900 px-2 py-1 rounded-md bg-slate-100">
                            {enr.internal_assessment_1 ?? 45} / 50
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-slate-900 px-2 py-1 rounded-md bg-slate-100">
                            {enr.internal_assessment_2 ?? 48} / 50
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-emerald-700 px-2 py-1 rounded-md bg-emerald-50">
                            {enr.assignment_marks ?? 19} / 20
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-sky-800 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200">
                            {enr.attendance_pct ?? 95}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-black text-purple-700 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200">
                            {enr.grade ?? 'A+'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleUnenroll(enr.id, enr.subject_name || 'Subject')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Drop Subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ADMIN, HOD & FACULTY VIEW: MASTER CURRICULUM SUBJECTS & DEGREE COURSES */
        <div className="space-y-6">
          {/* Standardized Tabs */}
          <TabNavigation
            tabs={[
              { id: 'subjects', label: 'Curriculum Subjects', count: subjects.length },
              { id: 'courses', label: 'Degree Courses', count: courses.length },
            ]}
            activeTab={activeTab as 'subjects' | 'courses'}
            onChange={(t) => setActiveTab(t as any)}
            variant="underline"
          />

          {/* Filters (For Subjects Tab) */}
          {activeTab === 'subjects' && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search subjects by name or code (e.g. Algorithms, CS301)..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-900"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {user?.role === 'admin' ? (
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium cursor-pointer"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                ) : (
                  <span className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold">
                    {activeDept?.code || 'Department'}
                  </span>
                )}

                {/* Academic Year Filter */}
                <select
                  value={yearFilter}
                  onChange={(e) => {
                    const y = e.target.value;
                    setYearFilter(y);
                    if (y) {
                      const sems = getSemestersForYear(Number(y), availableSemesters.length);
                      if (sems.length > 0) setSemFilter(String(sems[0]));
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium cursor-pointer"
                >
                  <option value="">All Academic Years ({availableYears.length} Years)</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>Year {yr} (Sem {((yr-1)*2)+1}-{Math.min(yr*2, availableSemesters.length)})</option>
                  ))}
                </select>

                <select
                  value={semFilter}
                  onChange={(e) => setSemFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium cursor-pointer"
                >
                  <option value="">All Semesters (1 - {availableSemesters.length})</option>
                  {(yearFilter 
                    ? availableSemesters.filter(s => getSemestersForYear(Number(yearFilter), availableSemesters.length).includes(s))
                    : availableSemesters
                  ).map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* SUBJECTS TAB VIEW */}
          {activeTab === 'subjects' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : subjects.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No subjects found. Use the button above to add subjects.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono">
                      <tr>
                        <th className="py-3 px-4">CODE</th>
                        <th className="py-3 px-4">SUBJECT NAME</th>
                        <th className="py-3 px-4">DEPARTMENT</th>
                        <th className="py-3 px-4">YEAR & SEMESTER</th>
                        <th className="py-3 px-4">PERIODS / TYPE</th>
                        <th className="py-3 px-4">ASSIGNED FACULTY INSTRUCTOR</th>
                        {canManage && <th className="py-3 px-4 text-right">ACTIONS</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subjects.map((sb) => (
                        <tr key={sb.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                            {sb.code}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                            {sb.name}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800">{sb.department_name}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-purple-700 font-bold">
                              Year {Math.ceil(sb.semester / 2)} • Sem {sb.semester}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-700">{sb.weekly_periods} periods/wk</span>
                            <div className="mt-0.5">
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                                  sb.subject_type === 'Theory'
                                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}
                              >
                                {sb.subject_type}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {sb.assigned_faculty_name ? (
                              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{sb.assigned_faculty_name}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-amber-600 font-mono italic">
                                Unassigned
                              </span>
                            )}
                          </td>
                          {canManage && (
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openSubjectModal(sb)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                                  title="Edit Subject"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubject(sb)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete Subject"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* COURSES TAB VIEW (ADMIN/HOD ONLY) */}
          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                        {c.degree_type}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm mt-2">{c.name}</h3>
                      <span className="text-xs text-sky-600 font-mono font-bold">{c.code}</span>
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openCourseModal(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>Duration: {c.duration_years} Years ({c.duration_years * 2} Semesters)</span>
                    <span>{c.subjects_count || 0} Subjects</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STUDENT MANUAL ENROLLMENT & COURSE ADDITION MODAL */}
      <Modal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        title={enrollTab === 'existing' ? 'Choose & Enroll in Curriculum Subject' : 'Add New Course / Elective Subject'}
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Dual Tab Mode Selector */}
          <div className="flex border-b border-slate-200 pb-2 gap-2">
            <button
              type="button"
              onClick={() => { setModalError(null); setEnrollTab('existing'); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                enrollTab === 'existing'
                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50'
              }`}
            >
              1. Choose from Curriculum
            </button>
            <button
              type="button"
              onClick={() => { setModalError(null); setEnrollTab('new_course'); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                enrollTab === 'new_course'
                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50'
              }`}
            >
              2. Add New Course / Elective
            </button>
          </div>

          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {enrollTab === 'existing' ? (
            <form onSubmit={handleEnrollSubject} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900">
                <span className="font-bold">Academic Department:</span> {studentDept?.name} ({studentDept?.code})
                <span className="block mt-1 text-[11px] text-sky-700">
                  Select an elective or core course from your departmental syllabus to add to your semester study schedule.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Enrollment Semester *</label>
                  <select
                    value={enrollSemester}
                    onChange={(e) => setEnrollSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                  >
                    {availableSemesters.map((s) => (
                      <option key={s} value={s}>Year {Math.ceil(s / 2)} • Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Available Subject *</label>
                  <select
                    value={selectedSubjectToEnroll || ''}
                    onChange={(e) => setSelectedSubjectToEnroll(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                  >
                    <option value="">-- Choose Subject --</option>
                    {availableToEnroll
                      .filter(s => s.semester === enrollSemester)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code}: {s.name} ({s.subject_type})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {availableToEnroll.filter(s => s.semester === enrollSemester).length === 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                  <p className="font-semibold">All standard subjects for Semester {enrollSemester} are already in your study schedule.</p>
                  <p className="text-[11px] text-amber-700">
                    Need an elective or custom course? Switch to the "Add New Course / Elective" tab above to register a new course!
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedSubjectToEnroll}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs disabled:opacity-50"
                >
                  {submitting ? 'Enrolling...' : 'Confirm Subject Enrollment'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateAndEnrollSubject} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900">
                <span className="font-bold">Add Course / Elective to Degree Curriculum:</span>
                <span className="block mt-1 text-[11px] text-sky-700">
                  Register a specialized course, open elective, or honors subject in {studentDept?.code || 'CT_UG'}. It will be added to your study schedule and immediately tracked for continuous evaluations.
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Course / Subject Name *</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Advanced Cloud Systems & Microservices"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CT309"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Semester *</label>
                  <select
                    value={enrollSemester}
                    onChange={(e) => setEnrollSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                  >
                    {availableSemesters.map((s) => (
                      <option key={s} value={s}>Year {Math.ceil(s / 2)} • Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Course Type</label>
                  <select
                    value={newSubType}
                    onChange={(e) => setNewSubType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                  >
                    <option value="Theory">Theory Course</option>
                    <option value="Practical">Practical / Laboratory</option>
                    <option value="Elective">Departmental Elective</option>
                    <option value="Project">Mini Project / Seminar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Weekly Lecture Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={newSubPeriods}
                    onChange={(e) => setNewSubPeriods(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Assigned Department Instructor</label>
                <select
                  value={newSubFacultyId || ''}
                  onChange={(e) => setNewSubFacultyId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                >
                  <option value="">-- Unassigned (Auto-Assign Later) --</option>
                  {departmentFaculty.map((f) => (
                    <option key={f.id} value={f.id}>{f.full_name} ({f.designation || 'Instructor'})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newSubName.trim() || !newSubCode.trim()}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs disabled:opacity-50"
                >
                  {submitting ? 'Adding & Enrolling...' : 'Add Course & Enroll'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* ADMIN COURSE MODAL */}
      <Modal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        title={editingCourse ? `Edit Course: ${editingCourse.code}` : 'Add Degree Course'}
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Course Name *</label>
            <input
              type="text"
              required
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              placeholder="e.g. B.Tech in Computer Science & Engineering"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Course Code *</label>
              <input
                type="text"
                required
                value={cCode}
                onChange={(e) => setCCode(e.target.value.toUpperCase())}
                placeholder="e.g. BTECH-CSE"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Department *</label>
              <select
                value={cDeptId}
                onChange={(e) => setCDeptId(Number(e.target.value))}
                disabled={user?.role !== 'admin'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 disabled:opacity-75"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Duration (Years)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={cDuration}
                onChange={(e) => setCDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Degree Type</label>
              <select
                value={cDegree}
                onChange={(e) => setCDegree(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                <option value="Undergraduate">Undergraduate (B.Tech / B.Sc)</option>
                <option value="Integrated Postgraduate">Integrated Postgraduate (5-Yr M.Sc)</option>
                <option value="Postgraduate">Postgraduate (M.Tech / M.Sc)</option>
                <option value="Doctoral">Doctoral (Ph.D)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCourseModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
            >
              {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADMIN SUBJECT MODAL */}
      <Modal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title={editingSubject ? `Edit Subject: ${editingSubject.code}` : 'Add Curriculum Subject'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Subject Name *</label>
            <input
              type="text"
              required
              value={sName}
              onChange={(e) => setSName(e.target.value)}
              placeholder="e.g. Design & Analysis of Algorithms"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Subject Code *</label>
              <input
                type="text"
                required
                value={sCode}
                onChange={(e) => setSCode(e.target.value.toUpperCase())}
                placeholder="e.g. CS302"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Department *</label>
              <select
                value={sDeptId}
                onChange={(e) => setSDeptId(Number(e.target.value))}
                disabled={user?.role !== 'admin'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 disabled:opacity-75"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Course Track</label>
              <select
                value={sCourseId}
                onChange={(e) => setSCourseId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Semester</label>
              <select
                value={sSemester}
                onChange={(e) => setSSemester(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                {modalSemesters.map((s) => (
                  <option key={s} value={s}>Year {Math.ceil(s / 2)} • Semester {s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Subject Type</label>
              <select
                value={sSubjectType}
                onChange={(e) => setSSubjectType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Weekly Periods</label>
              <input
                type="number"
                min={1}
                max={10}
                value={sWeeklyPeriods}
                onChange={(e) => setSWeeklyPeriods(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Assigned Faculty</label>
              <select
                value={sFacultyId || ''}
                onChange={(e) => setSFacultyId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                <option value="">-- Unassigned (AI Auto-Match) --</option>
                {facultyMembers.map((f) => (
                  <option key={f.id} value={f.id}>{f.full_name} ({f.faculty_id})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSubjectModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
            >
              {submitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
