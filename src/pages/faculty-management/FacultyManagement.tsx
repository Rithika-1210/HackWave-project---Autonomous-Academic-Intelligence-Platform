import React, { useEffect, useState } from 'react';
import { facultyApi, departmentsApi } from '@/services/api';
import { Faculty, Department } from '@/types';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, Plus, Search, Filter, Edit, Trash2, Mail, Phone,
  Clock, BookOpen, AlertCircle, CheckCircle2, Shield
} from 'lucide-react';

export const FacultyManagement: React.FC = () => {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  
  const [facultyId, setFacultyId] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [deptId, setDeptId] = useState<number>(1);
  const [designation, setDesignation] = useState<string>('Assistant Professor');
  const [specialization, setSpecialization] = useState<string>('');
  const [maxWorkload, setMaxWorkload] = useState<number>(18);
  const [status, setStatus] = useState<string>('Active');
  const [createAccount, setCreateAccount] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('Faculty@2026!');
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'hod';

  const loadData = async () => {
    try {
      setLoading(true);
      const [facData, deptData] = await Promise.all([
        facultyApi.getAll({
          department_id: departmentFilter ? Number(departmentFilter) : undefined,
          search: search || undefined
        }),
        departmentsApi.getAll({ status_filter: 'Active' })
      ]);
      setFacultyList(facData);
      setDepartments(deptData);
      if (deptData.length > 0 && !deptId) {
        setDeptId(deptData[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [departmentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openCreateModal = () => {
    setEditingFaculty(null);
    setFacultyId(`FAC-${Date.now().toString().slice(-4)}`);
    setFullName('');
    setEmail('');
    setPhone('');
    setDeptId(departments[0]?.id || 1);
    setDesignation('Assistant Professor');
    setSpecialization('');
    setMaxWorkload(18);
    setStatus('Active');
    setCreateAccount(true);
    setPassword('Faculty@2026!');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (f: Faculty) => {
    setEditingFaculty(f);
    setFacultyId(f.faculty_id);
    setFullName(f.full_name);
    setEmail(f.email);
    setPhone(f.phone || '');
    setDeptId(f.department_id);
    setDesignation(f.designation);
    setSpecialization(f.specialization || '');
    setMaxWorkload(f.max_weekly_workload);
    setStatus(f.status);
    setCreateAccount(false);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!fullName || !email || !facultyId) {
      setModalError('Full Name, Email, and Faculty ID are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingFaculty) {
        await facultyApi.update(editingFaculty.id, {
          full_name: fullName,
          email,
          phone,
          department_id: deptId,
          designation,
          specialization,
          max_weekly_workload: maxWorkload,
          status
        });
      } else {
        await facultyApi.create({
          faculty_id: facultyId,
          full_name: fullName,
          email,
          phone,
          department_id: deptId,
          designation,
          specialization,
          max_weekly_workload: maxWorkload,
          status,
          create_user_account: createAccount,
          password
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to save faculty record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (f: Faculty) => {
    if (!window.confirm(`Are you sure you want to delete faculty record "${f.full_name}"?`)) return;
    try {
      await facultyApi.delete(f.id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Cannot delete faculty with active timetable mappings.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title & Actions */}
      <PageHeader
        title="Faculty Management"
        subtitle="Maintain academic instructors, teaching specialization credentials, and weekly workload balance."
        icon={Users}
        actions={canManage && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty Member</span>
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
              placeholder="Search faculty by name, ID, email, or specialization..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 transition-all"
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
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500 font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>

      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-2 font-mono">Loading faculty records...</p>
          </div>
        ) : facultyList.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Faculty Records Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try modifying your department filter or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono">
                <tr>
                  <th className="py-3 px-4">FACULTY ID</th>
                  <th className="py-3 px-4">NAME & DESIGNATION</th>
                  <th className="py-3 px-4">DEPARTMENT</th>
                  <th className="py-3 px-4">CONTACT & SPECIALIZATION</th>
                  <th className="py-3 px-4">WEEKLY WORKLOAD</th>
                  <th className="py-3 px-4">STATUS</th>
                  {canManage && <th className="py-3 px-4 text-right">ACTIONS</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facultyList.map((f) => {
                  const utilization = Math.round(((f.current_workload_hours || 0) / f.max_weekly_workload) * 100);
                  return (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                        {f.faculty_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm leading-tight">{f.full_name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{f.designation}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {f.department_name}
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{f.email}</span>
                        </div>
                        {f.specialization && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {f.specialization}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="font-bold text-slate-800">{f.current_workload_hours || 0} / {f.max_weekly_workload} hrs</span>
                          <span className="text-slate-400">{utilization}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              utilization > 90 ? 'bg-amber-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                            f.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                      {canManage && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(f)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit Faculty"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => handleDelete(f)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Faculty"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaculty ? `Edit Faculty: ${editingFaculty.faculty_id}` : 'Add New Faculty Member'}
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
              <label className="block text-xs font-bold text-slate-700">Faculty ID *</label>
              <input
                type="text"
                required
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                placeholder="e.g. FAC-CSE-004"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Department *</label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
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
              placeholder="e.g. Dr. Alan Turing"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
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
                placeholder="faculty@aaip.edu"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Designation</label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Max Workload (h/wk)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={maxWorkload}
                onChange={(e) => setMaxWorkload(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Specialization & Research Focus</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Distributed Operating Systems, Machine Learning"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {!editingFaculty && (
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-indigo-950">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span>Generate institutional login account with temporary password</span>
              </label>
              {createAccount && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-xs text-slate-800 font-mono"
                    placeholder="Temporary login password"
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving to Database...' : editingFaculty ? 'Update Faculty' : 'Add Faculty'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
