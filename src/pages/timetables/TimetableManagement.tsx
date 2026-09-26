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
  UserCheck, AlertCircle, CheckCircle2, ChevronRight, Building2, User as UserIcon,
  LayoutGrid, List, Coffee, Sparkles
} from 'lucide-react';
import { getDepartmentSemesters, getDepartmentYears, getSemestersForYear } from '@/utils/academicSemesters';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface PeriodSlot {
  id: string;
  name: string;
  timeRange: string;
  start: string;
  end: string;
  isBreak?: boolean;
}

const PERIOD_SLOTS: PeriodSlot[] = [
  { id: 'p1', name: 'Period 1', timeRange: '09:00 - 10:00', start: '09:00', end: '10:00' },
  { id: 'p2', name: 'Period 2', timeRange: '10:15 - 11:15', start: '10:15', end: '11:15' },
  { id: 'p3', name: 'Period 3', timeRange: '11:30 - 12:30', start: '11:30', end: '12:30' },
  { id: 'lunch', name: 'Lunch Break', timeRange: '12:30 - 13:30', start: '12:30', end: '13:30', isBreak: true },
  { id: 'p4', name: 'Period 4 / Lab', timeRange: '13:30 - 14:30', start: '13:30', end: '14:30' },
  { id: 'p5', name: 'Period 5 / Lab', timeRange: '14:30 - 15:30', start: '14:30', end: '15:30' },
  { id: 'p6', name: 'Period 6', timeRange: '15:30 - 16:30', start: '15:30', end: '16:30' },
];

const timeToMinutes = (t: string): number => {
  if (!t) return 0;
  const parts = t.split(':');
  return Number(parts[0]) * 60 + Number(parts[1] || 0);
};

export const TimetableManagement: React.FC = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<Faculty[]>([]);
  const [rooms, setRooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // View Mode: Student defaults to Grid format table
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
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
  const canManage = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'faculty';

  // Dynamic academic semester rules:
  // Engineering: strictly 8 semesters (1 to 8) -> Years 1 to 4
  // Computing Tech UG (B.Sc): 6 semesters (1 to 6) -> Years 1 to 3
  // Computing Tech PG (Integrated M.Sc): 10 semesters (1 to 10) -> Years 1 to 5
  const activeDeptId = user?.role === 'admin'
    ? (deptFilter ? Number(deptFilter) : undefined)
    : (user?.department_id || undefined);
  const activeDept = departments.find(d => d.id === activeDeptId);
  const availableSemesters = getDepartmentSemesters(activeDept?.code || activeDept?.name);
  const availableYears = getDepartmentYears(activeDept?.code || activeDept?.name);

  // Instructors filtered strictly to the active department (e.g. CT_UG instructors alone)
  const departmentFaculty = activeDeptId
    ? facultyMembers.filter(f => f.department_id === activeDeptId)
    : facultyMembers;

  // Helper to match an entry to a period slot
  const getEntryForSlot = (day: string, slot: PeriodSlot): TimetableEntry | undefined => {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);

    return entries.find(e => {
      if (e.day_of_week.toLowerCase() !== day.toLowerCase()) return false;
      const eStart = timeToMinutes(e.start_time);
      const eEnd = timeToMinutes(e.end_time);
      return Math.max(eStart, slotStart) < Math.min(eEnd, slotEnd);
    });
  };

  const isSlotContinuation = (entry: TimetableEntry, slot: PeriodSlot): boolean => {
    const slotStart = timeToMinutes(slot.start);
    const eStart = timeToMinutes(entry.start_time);
    return eStart < slotStart;
  };

  // Modal active dept & semester list
  const modalDept = departments.find(d => d.id === deptId);
  const modalSemesters = getDepartmentSemesters(modalDept?.code || modalDept?.name);
  const modalYears = getDepartmentYears(modalDept?.code || modalDept?.name);

  const loadData = async () => {
    try {
      setLoading(true);
      const queryDeptId = user?.role === 'admin'
        ? (deptFilter ? Number(deptFilter) : undefined)
        : (user?.department_id || undefined);
      
      const [tData, dData, sData, fData, rData] = await Promise.all([
        timetablesApi.getEntries({
          department_id: queryDeptId,
          semester: semFilter ? Number(semFilter) : undefined,
          faculty_id: user?.role === 'faculty' ? undefined : (facultyFilter ? Number(facultyFilter) : undefined),
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

      if (dData.length > 0 && !deptId) setDeptId(user?.department_id || dData[0].id);
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
    setDeptId(user?.department_id || departments[0]?.id || 1);
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

    if (!batch.trim()) {
      setModalError('Student Batch is required. All fields must have input.');
      return;
    }

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          
          {/* 1. Department Filter - Global only for Admin; Locked to assigned dept for other roles */}
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
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate font-semibold text-slate-900">
                  {activeDept ? `${activeDept.name} (${activeDept.code})` : 'Department'}
                </span>
              </div>
              <span className="text-[10px] text-sky-700 font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-sky-100">Assigned</span>
            </div>
          )}

          {/* 2. Academic Year Filter */}
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

          {/* 3. Dynamic Semester Filter - Engineering has 8 sem, B.Sc has 6 sem, M.Sc has 10 sem */}
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

          {/* 4. Instructor Filter - Faculty can only see themselves; HOD sees department faculty; Admin sees all */}
          {user?.role === 'faculty' ? (
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <UserIcon className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate font-semibold text-slate-900">{user.full_name}</span>
              </div>
              <span className="text-[10px] text-sky-700 font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-sky-100">Personal</span>
            </div>
          ) : (
            <select
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium cursor-pointer"
            >
              <option value="">{activeDept ? `All ${activeDept.code} Instructors (${departmentFaculty.length})` : 'All Instructors'}</option>
              {departmentFaculty.map((f) => (
                <option key={f.id} value={f.id}>{f.full_name} ({f.designation || 'Instructor'})</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Timetable Header & View Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Weekly Academic Timetable Grid</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">
                Semester {semFilter || 6} • {activeDept?.code || 'CT_UG'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {viewMode === 'grid'
                ? 'Time-slot matrix view with course allocations, instructors, venues, and practical lab schedules.'
                : 'Linear tabular schedule view with slot details and management.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:inline">Format:</span>
            <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/60">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Weekly Grid View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List / Table View</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-2 font-mono">Syncing timetable slots...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No scheduled timetable slots found for the selected day or filters.
          </div>
        ) : viewMode === 'grid' ? (
          /* WEEKLY GRID MATRIX FORMAT */
          <div className="overflow-x-auto p-4">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr>
                  <th className="w-28 p-3 text-left text-xs font-mono font-bold text-slate-700 bg-slate-100/90 rounded-tl-xl border border-slate-200 sticky left-0 z-10">
                    DAY \ TIME
                  </th>
                  {PERIOD_SLOTS.map((slot) => (
                    <th
                      key={slot.id}
                      className={`p-2.5 text-center text-xs border border-slate-200 ${
                        slot.isBreak ? 'bg-amber-50/80 text-amber-900 w-24' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-bold">{slot.name}</div>
                      <div className="text-[10px] font-mono font-medium text-slate-500">{slot.timeRange}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(selectedDay === 'All' ? DAYS : [selectedDay]).map((day) => (
                  <tr key={day} className="hover:bg-slate-50/40 transition-colors">
                    {/* Sticky Day Column */}
                    <td className="p-3 text-xs font-black text-slate-900 bg-slate-100/90 border border-slate-200 sticky left-0 z-10 whitespace-nowrap shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-sky-600" />
                        <span>{day}</span>
                      </div>
                    </td>

                    {/* Period Cells */}
                    {PERIOD_SLOTS.map((slot) => {
                      if (slot.isBreak) {
                        return (
                          <td
                            key={slot.id}
                            className="p-2 border border-slate-200 bg-amber-50/40 text-center align-middle"
                          >
                            <div className="h-full min-h-[95px] flex flex-col items-center justify-center text-amber-700/80">
                              <Coffee className="w-4 h-4 mb-1 text-amber-500" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Lunch Break</span>
                            </div>
                          </td>
                        );
                      }

                      const entry = getEntryForSlot(day, slot);

                      if (!entry) {
                        return (
                          <td
                            key={slot.id}
                            className="p-2 border border-slate-200/80 align-top bg-slate-50/20"
                          >
                            <div className="h-full min-h-[95px] flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-slate-200 text-slate-300">
                              <span className="text-xs font-mono">—</span>
                              <span className="text-[10px] text-slate-400">Free Slot</span>
                            </div>
                          </td>
                        );
                      }

                      const isContinuation = isSlotContinuation(entry, slot);
                      const isLab = entry.subject_name.toLowerCase().includes('lab') || entry.subject_code.includes('P');

                      if (isContinuation) {
                        return (
                          <td
                            key={slot.id}
                            className="p-2 border border-slate-200/80 align-top"
                          >
                            <div className="h-full min-h-[95px] flex flex-col justify-center items-center p-2 rounded-xl border border-dashed border-sky-300 bg-sky-50/40 text-center">
                              <span className="text-[10px] font-mono font-bold text-sky-700 uppercase tracking-wider">
                                ▲ Session Continues
                              </span>
                              <span className="text-xs font-bold text-slate-700 truncate max-w-[130px] mt-0.5">
                                {entry.subject_name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({entry.room_number})
                              </span>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={slot.id}
                          className="p-2 border border-slate-200/80 align-top"
                        >
                          <div
                            className={`h-full min-h-[95px] flex flex-col justify-between p-2.5 rounded-xl border transition-all hover:shadow-md ${
                              isLab
                                ? 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-300'
                                : 'bg-white border-slate-200 hover:border-sky-300 shadow-xs'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span
                                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                                    isLab
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-sky-100 text-sky-800 border border-sky-200'
                                  }`}
                                >
                                  {entry.subject_code}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 font-semibold">
                                  {entry.start_time} - {entry.end_time}
                                </span>
                              </div>
                              <h4
                                className="font-bold text-xs text-slate-900 leading-snug line-clamp-2"
                                title={entry.subject_name}
                              >
                                {entry.subject_name}
                              </h4>
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-slate-100 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate font-semibold">{entry.faculty_name}</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-1 text-purple-700 font-mono font-bold">
                                  <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
                                  <span>{entry.room_number}</span>
                                </div>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-600 font-semibold">
                                  {entry.batch}
                                </span>
                              </div>
                            </div>

                            {canManage && (
                              <div className="mt-1 pt-1 flex justify-end">
                                <button
                                  onClick={() => handleDelete(entry.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Remove Slot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* DETAILED TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono">
                <tr>
                  <th className="py-3 px-4">DAY & TIMING</th>
                  <th className="py-3 px-4">SUBJECT & CODE</th>
                  <th className="py-3 px-4">YEAR & SEMESTER</th>
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
                      <div className="text-[11px] text-sky-700 font-bold font-mono">
                        Year {Math.ceil(e.semester / 2)} • Semester {e.semester}
                      </div>
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
                {modalSemesters.map((s) => (
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
                {(modalDept ? facultyMembers.filter(f => f.department_id === modalDept.id) : facultyMembers).map((f) => (
                  <option key={f.id} value={f.id}>{f.full_name} ({f.designation || 'Instructor'})</option>
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
              <label className="block text-xs font-bold text-slate-700">Student Batch *</label>
              <input
                type="text"
                required
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
