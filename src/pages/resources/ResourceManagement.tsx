import React, { useEffect, useState } from 'react';
import { resourcesApi } from '@/services/api';
import { Classroom } from '@/types';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
  DoorOpen, Plus, Search, Filter, Edit, Trash2,
  Cpu, Wrench, AlertCircle, CheckCircle2, Shield
} from 'lucide-react';

export const ResourceManagement: React.FC = () => {
  const [resources, setResources] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingResource, setEditingResource] = useState<Classroom | null>(null);

  const [name, setName] = useState<string>('');
  const [resourceType, setResourceType] = useState<string>('Classroom');
  const [building, setBuilding] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(60);
  const [equipment, setEquipment] = useState<string>('');
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('Available');
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'exam_cell';

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await resourcesApi.getAll({
        resource_type: typeFilter || undefined,
        availability_status: statusFilter || undefined,
        search: search || undefined
      });
      setResources(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [typeFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResources();
  };

  const openCreateModal = () => {
    setEditingResource(null);
    setName('');
    setResourceType('Classroom');
    setBuilding('Block A - Main Academic');
    setRoomNumber('');
    setCapacity(60);
    setEquipment('Projector, Whiteboard, Audio System');
    setAvailabilityStatus('Available');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (r: Classroom) => {
    setEditingResource(r);
    setName(r.name);
    setResourceType(r.resource_type);
    setBuilding(r.building);
    setRoomNumber(r.room_number);
    setCapacity(r.capacity);
    setEquipment(r.equipment || '');
    setAvailabilityStatus(r.availability_status);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!name || !roomNumber || !building) {
      setModalError('Name, Building, and Room Number are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingResource) {
        await resourcesApi.update(editingResource.id, {
          name, resource_type: resourceType, building, room_number: roomNumber,
          capacity, equipment, availability_status: availabilityStatus
        });
      } else {
        await resourcesApi.create({
          name, resource_type: resourceType, building, room_number: roomNumber,
          capacity, equipment, availability_status: availabilityStatus
        });
      }
      setIsModalOpen(false);
      loadResources();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to save resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (r: Classroom) => {
    if (!window.confirm(`Delete resource "${r.name}" (${r.room_number})?`)) return;
    try {
      await resourcesApi.delete(r.id);
      loadResources();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Cannot delete resource in use.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <PageHeader
        title="Classroom & Laboratory Management"
        subtitle="Campus lecture halls, specialized laboratories, seminar auditoriums, and examination venues."
        icon={DoorOpen}
        actions={canManage && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Venue Resource</span>
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
              placeholder="Search by venue name, room number, or equipment..."
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

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
          >
            <option value="">All Resource Types</option>
            <option value="Classroom">Classroom</option>
            <option value="Computer Laboratory">Computer Laboratory</option>
            <option value="Science Laboratory">Science Laboratory</option>
            <option value="Seminar Hall">Seminar Hall</option>
            <option value="Examination Hall">Examination Hall</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Occupied">Occupied</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2 font-mono">Querying facility records...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          No facility records found matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center font-extrabold text-purple-700 font-mono text-xs">
                      {r.room_number}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{r.name}</h3>
                      <span className="text-[11px] text-slate-500 font-medium">{r.building}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      r.availability_status === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {r.availability_status}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    {r.resource_type}
                  </span>
                  <span className="font-bold text-purple-700">
                    Cap: {r.capacity} Seats
                  </span>
                </div>

                {r.equipment && (
                  <div className="pt-2 text-[11px] text-slate-500 flex items-start gap-1.5 border-t border-slate-100">
                    <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{r.equipment}</span>
                  </div>
                )}
              </div>

              {canManage && (
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(r)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(r)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
        title={editingResource ? `Edit Venue: ${editingResource.room_number}` : 'Add Facility Resource'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Venue / Room Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Turing Lecture Hall 101"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Room Number *</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value.toUpperCase())}
                placeholder="e.g. A-101"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Resource Type</label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                <option value="Classroom">Classroom</option>
                <option value="Computer Laboratory">Computer Laboratory</option>
                <option value="Science Laboratory">Science Laboratory</option>
                <option value="Seminar Hall">Seminar Hall</option>
                <option value="Examination Hall">Examination Hall</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Building / Block *</label>
              <input
                type="text"
                required
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="e.g. Block A - Main Academic"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Seating Capacity</label>
              <input
                type="number"
                min={5}
                max={500}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Installed Equipment</label>
            <input
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="e.g. 45x Workstations, 4K Projector, Cisco Switch Racks"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Availability Status</label>
            <select
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
            >
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Occupied">Occupied</option>
            </select>
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
              className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              {submitting ? 'Saving...' : editingResource ? 'Update Venue' : 'Create Venue'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
