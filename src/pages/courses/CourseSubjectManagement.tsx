import React, { useEffect, useState } from 'react';
import { coursesApi, subjectsApi, departmentsApi, facultyApi } from '@/services/api';
import { Course, Subject, Department, Faculty } from '@/types';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { TabNavigation } from '@/components/common/TabNavigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen, Plus, Search, Filter, Edit, Trash2,
  Layers, Clock, UserCheck, AlertCircle
} from 'lucide-react';

export const CourseSubjectManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subjects' | 'courses'>('subjects');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [semFilter, setSemFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Course Modal States
  const [courseModalOpen, setCourseModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [cName, setCName] = useState<string>('');
  const [cCode, setCCode] = useState<string>('');
  const [cDeptId, setCDeptId] = useState<number>(1);
  const [cDuration, setCDuration] = useState<number>(4);
  const [cDegree, setCDegree] = useState<string>('Undergraduate');

  // Subject Modal States
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

  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'hod';

  const loadData = async () => {
    try {
      setLoading(true);
      const [cData, sData, dData, fData] = await Promise.all([
        coursesApi.getAll({ department_id: deptFilter ? Number(deptFilter) : undefined }),
        subjectsApi.getAll({
          department_id: deptFilter ? Number(deptFilter) : undefined,
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
        setCDeptId(dData[0].id);
        setSDeptId(dData[0].id);
      }
      if (cData.length > 0 && !sCourseId) {
        setSCourseId(cData[0].id);
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

  // Course Handlers
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
      setCDeptId(departments[0]?.id || 1);
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

  // Subject Handlers
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
      setSDeptId(departments[0]?.id || 1);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Standardized Header */}
      <PageHeader
        title="Course & Subject Management"
        subtitle="Curricular structure, degree tracks, syllabus subject mapping, and faculty instructor allocations."
        icon={BookOpen}
        actions={canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openCourseModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Degree Course</span>
            </button>
            <button
              onClick={() => openSubjectModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Curriculum Subject</span>
            </button>
          </div>
        )}
      />

      {/* Standardized Tabs */}
      <TabNavigation
        tabs={[
          { id: 'subjects', label: 'Curriculum Subjects', count: subjects.length },
          { id: 'courses', label: 'Degree Courses', count: courses.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
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

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.code}</option>
              ))}
            </select>

            <select
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
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
                    <th className="py-3 px-4">DEPARTMENT & SEMESTER</th>
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
                        <div className="text-[11px] text-slate-500 font-mono">Semester {sb.semester}</div>
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
                            Unassigned (Stage 2 AI Matching Ready)
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

      {/* COURSES TAB VIEW */}
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
                <span>Duration: {c.duration_years} Years</span>
                <span>{c.subjects_count || 0} Subjects</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COURSE MODAL */}
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
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
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
                max={6}
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

      {/* SUBJECT MODAL */}
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
              placeholder="e.g. Artificial Intelligence & Heuristics"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
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
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
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
                <option value="">-- Unassigned (Auto Match) --</option>
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
