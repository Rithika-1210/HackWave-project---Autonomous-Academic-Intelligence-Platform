import React, { useEffect, useState } from 'react';
import { departmentsApi } from '@/services/api';
import { Department } from '@/types';
import { Modal } from '@/components/common/Modal';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2, Plus, Search, Filter, Edit, Trash2,
  Users, GraduationCap, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [hodName, setHodName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<string>('Active');
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { user } = useAuth();
  const canManage = user?.role === 'admin';

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentsApi.getAll({
        status_filter: statusFilter || undefined,
        search: search || undefined
      });
      setDepartments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDepartments();
  };

  const openCreateModal = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setHodName('');
    setDescription('');
    setStatus('Active');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setHodName(dept.hod_name || '');
    setDescription(dept.description || '');
    setStatus(dept.status);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!name || !code) {
      setModalError('Department Name and Code are mandatory fields.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingDept) {
        await departmentsApi.update(editingDept.id, {
          name, code, hod_name: hodName, description, status
        });
      } else {
        await departmentsApi.create({
          name, code, hod_name: hodName, description, status
        });
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to save department.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dept: Department) => {
    if (!window.confirm(`Are you sure you want to delete the department "${dept.name}"?`)) {
      return;
    }
    try {
      await departmentsApi.delete(dept.id);
      fetchDepartments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Cannot delete department with active linked records.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-sky-600" />
            <span>Department Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure academic branches, HOD appointments, and departmental organizational scope.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Department</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by department name or code (e.g. CSE, Mechanical)..."
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
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-sky-500 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2 font-mono">Fetching departments from database...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Departments Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or add a new department using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center font-extrabold text-sky-700 font-mono text-sm">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{dept.name}</h3>
                      <span className="text-[11px] text-slate-500 font-mono">ID: #{dept.id}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      dept.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {dept.status}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider block">Head of Department</span>
                  <span className="text-xs font-bold text-slate-800">{dept.hod_name || 'Not Designated'}</span>
                </div>

                {dept.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {dept.description}
                  </p>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{dept.faculty_count || 0}</div>
                      <div className="text-[10px] text-slate-400">Faculty</div>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-sky-500" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{dept.student_count || 0}</div>
                      <div className="text-[10px] text-slate-400">Students</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              {canManage && (
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(dept)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                    title="Edit Department"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.code}` : 'Add New Academic Department'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Department Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computer Science & Engineering"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Department Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. CSE"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono uppercase focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Head of Department (HOD)</label>
            <input
              type="text"
              value={hodName}
              onChange={(e) => setHodName(e.target.value)}
              placeholder="e.g. Prof. Margaret Hamilton"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Department Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the department's academic and research focus..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
            />
          </div>

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
              {submitting ? 'Saving to Database...' : editingDept ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
