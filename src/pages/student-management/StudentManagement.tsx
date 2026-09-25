import React, { useEffect, useState } from 'react';
import { studentsApi, departmentsApi, coursesApi } from '@/services/api';
import { Student, Department, Course } from '@/types';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
  GraduationCap, Plus, Search, Filter, Edit, Trash2, Mail, Phone,
  AlertCircle, CheckCircle2
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [semFilter, setSemFilter] = useState<string>('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [studentId, setStudentId] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [deptId, setDeptId] = useState<number>(1);
  const [courseId, setCourseId] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);
  const [batch, setBatch] = useState<string>('Batch 2022-2026');
  const [enrollmentYear, setEnrollmentYear] = useState<number>(2022);
  const [status, setStatus] = useState<string>('Active');
  const [createAccount, setCreateAccount] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('Student@2026!');
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'hod';

  const loadData = async () => {
    try {
      setLoading(true);
      const [stuData, deptData, courseData] = await Promise.all([
        studentsApi.getAll({
          department_id: deptFilter ? Number(deptFilter) : undefined,
          semester: semFilter ? Number(semFilter) : undefined,
          search: search || undefined
        }),
        departmentsApi.getAll({ status_filter: 'Active' }),
        coursesApi.getAll({ status_filter: 'Active' })
      ]);
      setStudents(stuData);
      setDepartments(deptData);
      setCourses(courseData);
      if (deptData.length > 0 && !deptId) setDeptId(deptData[0].id);
      if (courseData.length > 0 && !courseId) setCourseId(courseData[0].id);
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

  const openCreateModal = () => {
    setEditingStudent(null);
    setStudentId(`STU-${new Date().getFullYear()}-CS${Math.floor(100 + Math.random() * 900)}`);
    setFullName('');
    setEmail('');
    setPhone('');
    setDeptId(departments[0]?.id || 1);
    setCourseId(courses[0]?.id || 1);
    setSemester(1);
    setBatch('Batch 2022-2026');
    setEnrollmentYear(new Date().getFullYear());
    setStatus('Active');
    setCreateAccount(true);
    setPassword('Student@2026!');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setStudentId(s.student_id);
    setFullName(s.full_name);
    setEmail(s.email);
    setPhone(s.phone || '');
    setDeptId(s.department_id);
    setCourseId(s.course_id || courses[0]?.id || 1);
    setSemester(s.semester);
    setBatch(s.batch);
    setEnrollmentYear(s.enrollment_year);
    setStatus(s.status);
    setCreateAccount(false);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!fullName || !email || !studentId) {
      setModalError('Full Name, Email, and Student ID are mandatory.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingStudent) {
        await studentsApi.update(editingStudent.id, {
          full_name: fullName,
          email,
          phone,
          department_id: deptId,
          course_id: courseId,
          semester,
          batch,
          enrollment_year: enrollmentYear,
          status
        });
      } else {
        await studentsApi.create({
          student_id: studentId,
          full_name: fullName,
          email,
          phone,
          department_id: deptId,
          course_id: courseId,
          semester,
          batch,
          enrollment_year: enrollmentYear,
          status,
          create_user_account: createAccount,
          password
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to save student record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (s: Student) => {
    if (!window.confirm(`Are you sure you want to delete student record "${s.full_name}"?`)) return;
    try {
      await studentsApi.delete(s.id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error deleting student record.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title & Actions */}
      <PageHeader
        title="Student Management"
        subtitle="Maintain institutional student enrollments, cohort batches, semester progression, and profiles."
        icon={GraduationCap}
        actions={canManage && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student Record</span>
          </button>
        )}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, roll number, or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:border-sky-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-900 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-sky-500 font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <select
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-sky-500 font-medium"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-2 font-mono">Loading students from database...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Student Records Found</h3>
            <p className="text-xs text-slate-500 mt-1">Adjust filters or create a new student entry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono">
                <tr>
                  <th className="py-3 px-4">ROLL NUMBER</th>
                  <th className="py-3 px-4">FULL NAME</th>
                  <th className="py-3 px-4">DEGREE & DEPT</th>
                  <th className="py-3 px-4">SEMESTER & BATCH</th>
                  <th className="py-3 px-4">CONTACT</th>
                  <th className="py-3 px-4">STATUS</th>
                  {canManage && <th className="py-3 px-4 text-right">ACTIONS</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                      {s.student_id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {s.full_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.course_name || 'B.Tech'}</div>
                      <div className="text-[11px] text-slate-500">{s.department_name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-700">Sem {s.semester}</span>
                      <div className="text-[11px] text-slate-500">{s.batch}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      <div>{s.email}</div>
                      {s.phone && <div className="text-[10px] text-slate-400">{s.phone}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                          s.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                            title="Edit Student"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(s)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.student_id}` : 'Enroll New Student'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Roll Number / Student ID *</label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. STU-2022-CS055"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Department *</label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rithika"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Institutional Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@aaip.edu"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 91234 56789"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Academic Program</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Current Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Batch Code</label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Batch 2022-2026"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          {!editingStudent && (
            <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-sky-950">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600"
                />
                <span>Create Student Portal credentials with default password</span>
              </label>
              {createAccount && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-sky-200 text-xs text-slate-800 font-mono"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving to Database...' : editingStudent ? 'Update Student' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
