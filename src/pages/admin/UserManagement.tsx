import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Department } from '@/types';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { departmentsApi, usersApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserCog, Plus, Search, Filter, Edit, Trash2, KeyRound,
  Shield, CheckCircle2, XCircle, AlertCircle, Building2, UserCheck, UserX
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<string>('faculty');
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [password, setPassword] = useState<string>('Temporary@2026!');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const { user: currentUser } = useAuth();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('aaip_token');
      const [uRes, dData] = await Promise.all([
        axios.get<User[]>('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            role: roleFilter || undefined,
            search: search || undefined
          }
        }),
        departmentsApi.getAll({ status_filter: 'Active' })
      ]);
      setUsers(uRes.data);
      setDepartments(dData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setEmail('');
    setFullName('');
    setRole('faculty');
    setDepartmentId(departments[0]?.id);
    setPassword('Temporary@2026!');
    setIsActive(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEmail(u.email);
    setFullName(u.full_name);
    setRole(u.role);
    setDepartmentId(u.role === 'admin' ? undefined : (u.department_id || undefined));
    setPassword('');
    setIsActive(u.is_active);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!email || !fullName) {
      setModalError('Email and Full Name are required.');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('aaip_token');
      const headers = { Authorization: `Bearer ${token}` };

      const targetDeptId = role === 'admin' ? null : (departmentId || null);

      if (editingUser) {
        await axios.put(
          `/api/users/${editingUser.id}`,
          {
            email,
            full_name: fullName,
            role,
            department_id: targetDeptId,
            is_active: isActive,
            password: password || undefined
          },
          { headers }
        );
      } else {
        await axios.post(
          '/api/users',
          {
            email,
            password,
            full_name: fullName,
            role,
            department_id: targetDeptId,
            is_active: isActive
          },
          { headers }
        );
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to save user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (u: User) => {
    if (u.id === currentUser?.id) {
      alert('Cannot delete your own active administrator account.');
      return;
    }
    if (!window.confirm(`Delete user account "${u.email}"?`)) return;
    try {
      const token = localStorage.getItem('aaip_token');
      await axios.delete(`/api/users/${u.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error deleting user.');
    }
  };

  const handleApprove = async (u: User) => {
    try {
      await usersApi.approve(u.id);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error approving user access.');
    }
  };

  const handleReject = async (u: User) => {
    if (!window.confirm(`Decline and reject access for ${u.full_name} (${u.role})?`)) return;
    try {
      await usersApi.reject(u.id);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error rejecting user access.');
    }
  };

  const pendingUsers = users.filter(u => u.approval_status === 'Pending');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Standardized Header */}
      <PageHeader
        title="User Management & RBAC Governance"
        subtitle="Administrator-only portal to manage user identities, RBAC roles, account lifecycles, and passwords."
        icon={UserCog}
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create User Account</span>
          </button>
        }
      />

      {/* Pending Access Approvals Banner */}
      {pendingUsers.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-900">
                {pendingUsers.length} Access Request{pendingUsers.length > 1 ? 's' : ''} Awaiting Institutional Clearance
              </div>
              <div className="text-[11px] text-amber-700">
                New HODs and faculty accounts require administrator authorization before portal access is enabled.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {pendingUsers.slice(0, 2).map(pu => (
              <button
                key={pu.id}
                onClick={() => handleApprove(pu)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authorize {pu.full_name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:border-slate-800"
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
          >
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="hod">HOD</option>
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
            <option value="exam_cell">Exam Cell</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-2 font-mono">Fetching users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No user accounts found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono">
                <tr>
                  <th className="py-3 px-4">USER ID</th>
                  <th className="py-3 px-4">FULL NAME</th>
                  <th className="py-3 px-4">INSTITUTIONAL EMAIL</th>
                  <th className="py-3 px-4">ASSIGNED ROLE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">CREATED</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">#{u.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{u.full_name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border bg-slate-100 text-slate-800 border-slate-200">
                        {u.role}
                      </span>
                      {u.role === 'admin' && (
                        <span className="block text-[10px] text-sky-600 font-medium mt-0.5">
                          All Departments
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.approval_status === 'Pending' ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-300 animate-pulse">
                            Pending Approval
                          </span>
                          <button
                            onClick={() => handleApprove(u)}
                            className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-0.5 shadow-2xs cursor-pointer"
                            title="Authorize User Access"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Authorize</span>
                          </button>
                          <button
                            onClick={() => handleReject(u)}
                            className="px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] flex items-center gap-0.5 shadow-2xs cursor-pointer"
                            title="Decline User Access"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Decline</span>
                          </button>
                        </div>
                      ) : u.approval_status === 'Rejected' ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                          Rejected
                        </span>
                      ) : u.is_active ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          Active & Authorized
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT USER MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit Account: ${editingUser.email}` : 'Create Institutional User Account'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ram"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Institutional Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@aaip.edu"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Role Clearance</label>
              <select
                value={role}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setRole(newRole);
                  if (newRole === 'admin') setDepartmentId(undefined);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                <option value="admin">Administrator</option>
                <option value="hod">Head of Department (HOD)</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
                <option value="exam_cell">Exam Cell Coordinator</option>
              </select>
            </div>
            {role !== 'admin' ? (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Department</label>
                <select
                  value={departmentId || ''}
                  onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                >
                  <option value="">-- Institutional Global --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Institutional Scope</label>
                <div className="w-full px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-sky-800 font-medium flex items-center gap-1.5 h-[34px]">
                  <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">All Departments</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              {editingUser ? 'Reset Password (leave empty to keep unchanged)' : 'Initial Password *'}
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password@2026!"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900"
              />
              <span>Account Active (permits login)</span>
            </label>
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
              className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingUser ? 'Update Account' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
