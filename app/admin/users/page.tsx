'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ArrowLeft, Shield, Palette, Plus, X, ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoutButton } from '@/components/LogoutButton';

type ProjectUser = {
  user_id: string;
  name: string;
  role: string;
};

type AvailableUser = {
  user_id: string;
  name: string;
};

function RoleBadge({ role }: { role: string }) {
  const styles = {
    admin: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    designer: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  }[role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  const Icon = role === 'admin' ? Shield : Palette;

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', styles)}>
      <Icon className="w-3 h-3" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function RoleSelect({ userId, currentRole, onRoleChange }: {
  userId: string;
  currentRole: string;
  onRoleChange: (userId: string, newRole: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const roles = ['admin', 'designer'];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
      >
        Change
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
          {roles.filter(r => r !== currentRole).map(r => (
            <button
              key={r}
              onClick={() => { onRoleChange(userId, r); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors capitalize flex items-center gap-2"
            >
              {r === 'admin' ? <Shield className="w-3.5 h-3.5 text-amber-400" /> : <Palette className="w-3.5 h-3.5 text-teal-400" />}
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddUserModal({ availableUsers, onAdd, onClose }: {
  availableUsers: AvailableUser[];
  onAdd: (userId: string, role: string) => Promise<string | null>;
  onClose: () => void;
}) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState<'designer' | 'admin'>('designer');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setSubmitting(true);
    setError(null);
    const err = await onAdd(selectedUserId, role);
    if (err) {
      setError(err);
      setSubmitting(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Plus className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Add Member</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">User</label>
            {availableUsers.length === 0 ? (
              <p className="text-sm text-slate-500 py-2">No available users to add.</p>
            ) : (
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors appearance-none"
              >
                <option value="" disabled>Select a user...</option>
                {availableUsers.map(u => (
                  <option key={u.user_id} value={u.user_id}>{u.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Role</label>
            <div className="flex gap-3">
              {(['designer', 'admin'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors capitalize',
                    role === r
                      ? r === 'admin'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                      : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  )}
                >
                  {r === 'admin' ? <Shield className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedUserId || submitting}
              className="flex-1 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              {submitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ user, onConfirm, onClose }: {
  user: ProjectUser;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm mx-4 shadow-2xl">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Remove Member</h2>
          </div>
          <p className="text-sm text-slate-400">
            Are you sure you want to remove <span className="text-white font-medium">{user.name}</span> from this project?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={async () => { setDeleting(true); await onConfirm(); }}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium transition-colors"
            >
              {deleting ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<ProjectUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admin' | 'designer'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectUser | null>(null);

  const fetchUsers = () => {
    fetch('/api/admin/users?available=true')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
          setAvailableUsers(data.available ?? []);
        }
        setLoading(false);
      });
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (userId: string, role: string): Promise<string | null> => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, role }),
    });
    const data = await res.json();
    if (!data.success) return data.error;
    setUsers(prev => [...prev, data.user]);
    setAvailableUsers(prev => prev.filter(u => u.user_id !== userId));
    return null;
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: deleteTarget.user_id }),
    });
    const data = await res.json();
    if (data.success) {
      setUsers(prev => prev.filter(u => u.user_id !== deleteTarget.user_id));
      setAvailableUsers(prev => [...prev, { user_id: deleteTarget.user_id, name: deleteTarget.name }]);
    }
    setDeleteTarget(null);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, role: newRole }),
    });
    const data = await res.json();
    if (data.success) {
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    return u.role === filter;
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const designerCount = users.filter(u => u.role === 'designer').length;

  return (
    <div className="min-h-screen bg-[#0F1117] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Admin
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-rose-50">User Management</h1>
            <p className="text-blue-200/60 mt-1">Manage team members for the Dribbble Shots project.</p>
          </div>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Total Members</h3>
            <p className="text-3xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-amber-900/20 border border-amber-900/50 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-amber-400/80 mb-1">Admins</h3>
            <p className="text-3xl font-bold text-amber-400">{adminCount}</p>
          </div>
          <div className="bg-teal-900/20 border border-teal-900/50 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-teal-400/80 mb-1">Designers</h3>
            <p className="text-3xl font-bold text-teal-400">{designerCount}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
              {(['all', 'admin', 'designer'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors',
                    filter === f ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                  <th className="p-4 border-b border-slate-800 font-medium">User</th>
                  <th className="p-4 border-b border-slate-800 font-medium">Role</th>
                  <th className="p-4 border-b border-slate-800 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500 animate-pulse">Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.user_id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 text-sm font-medium text-slate-300">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 justify-end">
                          <RoleSelect
                            userId={user.user_id}
                            currentRole={user.role}
                            onRoleChange={handleRoleChange}
                          />
                          <button
                            onClick={() => setDeleteTarget(user)}
                            title="Remove member"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddUserModal
          availableUsers={availableUsers}
          onAdd={handleAddUser}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onConfirm={handleDeleteUser}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
