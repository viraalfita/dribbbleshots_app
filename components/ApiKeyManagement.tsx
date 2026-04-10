'use client';

import { useState, useTransition } from 'react';
import { Key, Plus, Copy, Check, Trash2, ToggleLeft, ToggleRight, X, AlertTriangle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getApiKeysAction,
  generateApiKeyAction,
  toggleApiKeyAction,
  deleteApiKeyAction,
  type ApiKey,
} from '@/app/actions/api-keys';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function KeyRevealModal({ apiKey, onClose }: { apiKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Your API Key</h2>
              <p className="text-sm text-slate-400">Copy it now — it will not be shown again.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">
              Store this key securely. It will not be visible again after you close this window.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <p className="text-sm font-mono text-teal-300 break-all select-all">{apiKey}</p>
          </div>

          <button
            onClick={handleCopy}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all',
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-teal-600 hover:bg-teal-500 text-white'
            )}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy API Key'}
          </button>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 font-medium transition-colors"
          >
            I have saved the key, close
          </button>
        </div>
      </div>
    </div>
  );
}

function GenerateModal({
  onGenerate,
  onClose,
}: {
  onGenerate: (name: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await onGenerate(name.trim());
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Key className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Generate API Key</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Key Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. OpenClaw Staging, CI/CD Pipeline"
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
            />
            <p className="text-xs text-slate-500">
              Use a descriptive name so you can identify this key later.
            </p>
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
              disabled={!name.trim() || isPending}
              className="flex-1 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              {isPending ? 'Generating...' : 'Generate Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  keyName,
  onConfirm,
  onClose,
}: {
  keyName: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm mx-4 shadow-2xl">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Delete API Key</h2>
          </div>
          <p className="text-sm text-slate-400">
            Are you sure you want to delete <span className="text-white font-medium">{keyName}</span>? Any integration using this key will stop working immediately.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => startTransition(async () => { await onConfirm(); })}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium transition-colors"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApiKeyManagement({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [revealKey, setRevealKey] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const refreshKeys = async () => {
    const result = await getApiKeysAction();
    if (result.success) setKeys(result.data);
  };

  const handleGenerate = async (name: string) => {
    setError(null);
    const result = await generateApiKeyAction(name);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setShowGenerateModal(false);
    setRevealKey(result.data.key);
    await refreshKeys();
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await toggleApiKeyAction(id, !current);
      if (!result.success) { setError(result.error); return; }
      setKeys(prev => prev.map(k => k.id === id ? { ...k, is_active: !current } : k));
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteApiKeyAction(deleteTarget.id);
    if (!result.success) { setError(result.error); return; }
    setKeys(prev => prev.filter(k => k.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">
              {keys.length} key{keys.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate API Key
          </button>
        </div>

        {keys.length === 0 ? (
          <div className="p-12 text-center">
            <Key className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No API keys yet.</p>
            <p className="text-slate-600 text-xs mt-1">Generate a key to allow external tools to access this API.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/50 text-xs uppercase text-slate-500 tracking-wider">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Key Prefix</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created By</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Last Used</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {keys.map(key => (
                  <tr key={key.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-white">{key.name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <code className="text-xs font-mono bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-400">
                        {key.key_prefix}•••
                      </code>
                    </td>
                    <td className="px-4 py-3.5">
                      {key.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-400">{key.created_by}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-400">{formatDate(key.created_at)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-500">{formatDate(key.last_used_at)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleToggle(key.id, key.is_active)}
                          title={key.is_active ? 'Deactivate' : 'Activate'}
                          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          {key.is_active
                            ? <ToggleRight className="w-4 h-4 text-emerald-400" />
                            : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(key)}
                          title="Delete key"
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showGenerateModal && (
        <GenerateModal
          onGenerate={handleGenerate}
          onClose={() => setShowGenerateModal(false)}
        />
      )}

      {revealKey && (
        <KeyRevealModal
          apiKey={revealKey}
          onClose={() => setRevealKey(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          keyName={deleteTarget.name}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
