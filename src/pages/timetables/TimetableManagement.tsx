import React, { useEffect, useState } from 'react';
import {
  timetablesApi, departmentsApi, subjectsApi, facultyApi, resourcesApi
} from '@/services/api';
import {
  TimetableEntry, Department, Subject, Faculty, Classroom
} from '@/types';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { TabNavigation } from '@/components/common/TabNavigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  CalendarDays, Plus, Filter, Trash2, Clock, MapPin,
  UserCheck, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetableManagement: React.FC = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<Faculty[]>([]);
  const [rooms, setRooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [semFilter, setSemFilter] = useState<string>('6');
  const [facultyFilter, setFacultyFilter] = useState<string>('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields
  const [deptId, setDeptId] = useState<number>(1);
  const [semester, setSemester] = useState<number>(6);
  const [batch, setBatch] = useState<string>('Section A');
  const [subjectId, setSubjectId] = useState<number>(1);
  const [facultyId, setFacultyId] = useState<number>(1);
  const [classroomId, setClassroomId] = useState<number>(1);
  const [dayOfWeek, setDayOfWeek] = useState<string>('Monday');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');

  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'hod';

  const loadData = async () => {
    try {
      setLoading(true);
      const [tData, dData, sData, fData, rData] = await Promise.all([
        timetablesApi.getEntries({
          department_id: deptFilter ? Number(deptFilter) : undefined,
          semester: semFilter ? Number(semFilter) : undefined,
          faculty_id: facultyFilter ? Number(facultyFilter) : undefined,
          day_of_week: selectedDay !== 'All' ? selectedDay : undefined,
        }),
        departmentsApi.getAll({ status_filter: 'Active' }),
        subjectsApi.getAll({ status_filter: 'Active' }),
        facultyApi.getAll({ status_filter: 'Active' }),
        resourcesApi.getAll({ availability_status: 'Available' }),
      ]);
      setEntries(tData);
      setDepartments(dData);
      setSubjects(sData);
      setFacultyMembers(fData);
      setRooms(rData);

      if (dData.length > 0 && !deptId) setDeptId(dData[0].id);
      if (sData.length > 0 && !subjectId) setSubjectId(sData[0].id);
      if (fData.length > 0 && !facultyId) setFacultyId(fData[0].id);
      if (rData.length > 0 && !classroomId) setClassroomId(rData[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDay, deptFilter, semFilter, facultyFilter]);

  const openCreateModal = () => {
    setModalError(null);
    setDeptId(departments[0]?.id || 1);
    setSemester(6);
    setBatch('Section A');
    setSubjectId(subjects[0]?.id || 1);
    setFacultyId(facultyMembers[0]?.id || 1);
    setClassroomId(rooms[0]?.id || 1);
    setDayOfWeek('Monday');
    setStartTime('09:00');
    setEndTime('10:00');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (startTime >= endTime) {
      setModalError('Start Time must be strictly earlier than End Time.');
      return;
    }

    try {
      setSubmitting(true);
      await timetablesApi.createEntry({
        department_id: deptId,
        semester,
        batch,
        subject_id: subjectId,
        faculty_id: facultyId,
        classroom_id: classroomId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
      });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Scheduling clash or error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId: number) => {
    if (!window.confirm('Delete this timetable slot?')) return;
    try {
      await timetablesApi.deleteEntry(entryId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error deleting timetable slot.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Standardized Header */}
      <PageHeader
        title="Academic Timetable Management"
        subtitle="Weekly and daily scheduling grid with real-time faculty & classroom collision interception."
        icon={CalendarDays}
        actions={canManage && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Lecture Slot</span>
          </button>
        )}
      />

      {/* Day Selector & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        {/* Day Pills using TabNavigation */}
        <TabNavigation
          tabs={[
            { id: 'All', label: 'All Days' },
            ...DAYS.map((d) => ({ id: d, label: d })),
          ]}
          activeTab={selectedDay}
          onChange={setSelectedDay}
          variant="pill"
        />

        {/* Secondary Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
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

          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
          >
            <option value="">All Instructors</option>
            {facultyMembers.map((f) => (
              <option key={f.id} value={f.id}>{f.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timetable Entries Matrix View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-2 font-mono">Syncing timetable slots...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No scheduled timetable slots found for the selected day or filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono">
                <tr>
                  <th className="py-3 px-4">DAY & TIMING</th>
                  <th className="py-3 px-4">SUBJECT & CODE</th>
                  <th className="py-3 px-4">DEPT & SEM</th>
                  <th className="py-3 px-4">ALLOCATED INSTRUCTOR</th>
                  <th className="py-3 px-4">VENUE / CLASSROOM</th>
                  <th className="py-3 px-4">BATCH</th>
                  {canManage && <th className="py-3 px-4 text-right">ACTION</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{e.day_of_week}</span>
                      <span className="text-[11px] font-mono text-sky-700 font-semibold">{e.start_time} - {e.end_time}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{e.subject_name}</div>
                      <span className="text-xs font-mono text-slate-500">{e.subject_code}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{e.department_name}</span>
                      <div className="text-[11px] text-slate-500 font-mono">Semester {e.semester}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{e.faculty_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-800 font-mono font-bold">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                        <span>{e.room_number}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{e.classroom_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                        {e.batch}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove Slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SCHEDULE MODAL WITH AUTOMATED COLLISION VALIDATION */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Academic Timetable Slot"
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
              <label className="block text-xs font-bold text-slate-700">Department *</label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Semester *</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Curriculum Subject *</label>
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
              <label className="block text-xs font-bold text-slate-700">Assigned Faculty Instructor *</label>
              <select
                value={facultyId}
                onChange={(e) => setFacultyId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                {facultyMembers.map((f) => (
                  <option key={f.id} value={f.id}>{f.full_name} ({f.faculty_id})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Classroom / Lab Venue *</label>
              <select
                value={classroomId}
                onChange={(e) => setClassroomId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.room_number})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Student Batch</label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. Section A"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Day of Week *</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
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

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-[11px] text-sky-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>The backend validation engine automatically verifies that neither the instructor nor the room are double-booked during this slot.</span>
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
              className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-600/20 disabled:opacity-50"
            >
              {submitting ? 'Verifying & Saving...' : 'Commit Timetable Slot'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
