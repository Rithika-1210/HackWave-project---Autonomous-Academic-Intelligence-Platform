import React, { useEffect, useState } from 'react';
import {
  examinationsApi, departmentsApi, subjectsApi, resourcesApi
} from '@/services/api';
import {
  Examination, Department, Subject, Classroom
} from '@/types';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
  FileCheck2, Plus, Search, Filter, Edit, Trash2, CalendarDays,
  Clock, MapPin, AlertCircle, CheckCircle2
} from 'lucide-react';
import { getDepartmentSemesters, getDepartmentYears, getSemestersForYear } from '@/utils/academicSemesters';

export const ExaminationManagement: React.FC = () => {
  const [exams, setExams] = useState<Examination[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [halls, setHalls] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [semFilter, setSemFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExam, setEditingExam] = useState<Examination | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form
  const [name, setName] = useState<string>('');
  const [examType, setExamType] = useState<string>('Mid-Term');
  const [deptId, setDeptId] = useState<number>(1);
  const [subjectId, setSubjectId] = useState<number>(1);
  const [semester, setSemester] = useState<number>(6);
  const [examDate, setExamDate] = useState<string>('2026-10-15');
  const [startTime, setStartTime] = useState<string>('09:30');
  const [endTime, setEndTime] = useState<string>('11:30');
  const [classroomId, setClassroomId] = useState<number>(1);
  const [status, setStatus] = useState<string>('Scheduled');

  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'exam_cell' || user?.role === 'hod' || user?.role === 'faculty';

  const activeDept = departments.find(d => d.id === (deptFilter ? Number(deptFilter) : (user?.department_id || undefined)));
  const availableSemesters = getDepartmentSemesters(activeDept?.code || activeDept?.name);
  const availableYears = getDepartmentYears(activeDept?.code || activeDept?.name);

  const modalDept = departments.find(d => d.id === deptId);
  const modalSemesters = getDepartmentSemesters(modalDept?.code || modalDept?.name);
  const modalYears = getDepartmentYears(modalDept?.code || modalDept?.name);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eData, dData, sData, rData] = await Promise.all([
        examinationsApi.getAll({
          department_id: deptFilter ? Number(deptFilter) : undefined,
          semester: semFilter ? Number(semFilter) : undefined,
          search: search || undefined
        }),
        departmentsApi.getAll({ status_filter: 'Active' }),
        subjectsApi.getAll({ status_filter: 'Active' }),
        resourcesApi.getAll({ availability_status: 'Available' }),
      ]);
      setExams(eData);
      setDepartments(dData);
      setSubjects(sData);
      setHalls(rData);

      if (dData.length > 0 && !deptId) setDeptId(dData[0].id);
      if (sData.length > 0 && !subjectId) setSubjectId(sData[0].id);
      if (rData.length > 0 && !classroomId) setClassroomId(rData[0].id);
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
    setEditingExam(null);
    setName('');
    setExamType('Mid-Term');
    setDeptId(departments[0]?.id || 1);
    setSubjectId(subjects[0]?.id || 1);
    setSemester(6);
    setExamDate('2026-10-20');
    setStartTime('09:30');
    setEndTime('11:30');
    setClassroomId(halls[0]?.id || 1);
    setStatus('Scheduled');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ex: Examination) => {
    setEditingExam(ex);
    setName(ex.name);
    setExamType(ex.exam_type);
    setDeptId(ex.department_id);
    setSubjectId(ex.subject_id);
    setSemester(ex.semester);
    setExamDate(ex.exam_date);
    setStartTime(ex.start_time);
    setEndTime(ex.end_time);
    setClassroomId(ex.classroom_id);
    setStatus(ex.status);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!name || startTime >= endTime) {
      setModalError('Valid Exam Title and proper start/end timings are mandatory.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingExam) {
        await examinationsApi.update(editingExam.id, {
          name, exam_type: examType, subject_id: subjectId, department_id: deptId,
          semester, exam_date: examDate, start_time: startTime, end_time: endTime,
          classroom_id: classroomId, status
        });
      } else {
        await examinationsApi.create({
          name, exam_type: examType, subject_id: subjectId, department_id: deptId,
          semester, exam_date: examDate, start_time: startTime, end_time: endTime,
          classroom_id: classroomId, status
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Hall conflict or error saving examination.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ex: Examination) => {
    if (!window.confirm(`Delete examination schedule "${ex.name}"?`)) return;
    try {
      await examinationsApi.delete(ex.id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error removing exam schedule.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <PageHeader
        title="Examination Management"
        subtitle="Mid-term and end-semester schedules, examination halls, and room clash interception."
        icon={FileCheck2}
        actions={canManage && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Examination</span>
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
              placeholder="Search examinations by title or subject..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:border-purple-500"
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
          {user?.role === 'admin' || user?.role === 'exam_cell' ? (
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
            <span className="px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
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

      {/* Examination Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-2 font-mono">Syncing examination schedules...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No examinations found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono">
                <tr>
                  <th className="py-3 px-4">EXAMINATION NAME</th>
                  <th className="py-3 px-4">SUBJECT & CODE</th>
                  <th className="py-3 px-4">YEAR & SEMESTER</th>
                  <th className="py-3 px-4">DATE & TIMING</th>
                  <th className="py-3 px-4">EXAMINATION HALL</th>
                  <th className="py-3 px-4">STATUS</th>
                  {canManage && <th className="py-3 px-4 text-right">ACTIONS</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {ex.name}
                      <span className="block text-[10px] font-mono text-purple-600 font-semibold">{ex.exam_type}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{ex.subject_name}</div>
                      <span className="text-[11px] font-mono text-slate-500">{ex.subject_code}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{ex.department_name}</span>
                      <div className="text-[11px] font-mono text-purple-700 font-bold">
                        Year {Math.ceil(ex.semester / 2)} • Sem {ex.semester}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{ex.exam_date}</div>
                      <div className="text-[11px] text-sky-700 font-semibold">{ex.start_time} - {ex.end_time}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                        <span>{ex.room_number}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{ex.classroom_name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {ex.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(ex)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ex)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? `Edit Examination: ${editingExam.name}` : 'Schedule New Examination'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Examination Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mid-Term: Design & Analysis of Algorithms"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Exam Type</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                <option value="Mid-Term">Mid-Term</option>
                <option value="End-Semester">End-Semester</option>
                <option value="Practical">Practical</option>
                <option value="Internal Assessment">Internal Assessment</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Department *</label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(Number(e.target.value))}
                disabled={user?.role !== 'admin' && user?.role !== 'exam_cell'}
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
              <label className="block text-xs font-bold text-slate-700">Subject *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                {modalSemesters.map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Exam Date *</label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Start Time *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">End Time *</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Allocated Examination Hall *</label>
            <select
              value={classroomId}
              onChange={(e) => setClassroomId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
            >
              {halls.map((h) => (
                <option key={h.id} value={h.id}>{h.name} ({h.room_number}) &mdash; Cap: {h.capacity}</option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <span>The system automatically checks if the selected examination hall is already booked for another examination on this date and time.</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs disabled:opacity-50"
            >
              {submitting ? 'Validating Hall Conflict...' : editingExam ? 'Update Examination' : 'Confirm & Schedule'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
