import { redirect } from 'next/navigation';
import { Key } from 'lucide-react';
import Link from 'next/link';
import { getCurrentSession } from '@/lib/auth/session';
import { getApiKeysAction } from '@/app/actions/api-keys';
import ApiKeyManagement from '@/components/ApiKeyManagement';
import { LogoutButton } from '@/components/LogoutButton';

export default async function ApiKeysPage() {
  const session = await getCurrentSession();

  if (!session) redirect('/login');

  if (session.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0F1117] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="p-3 bg-red-500/10 rounded-full w-fit mx-auto">
            <Key className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold">Access Denied</h1>
          <p className="text-slate-400 text-sm">Only admins can manage API keys.</p>
          <Link href="/plans" className="inline-block mt-4 text-teal-400 hover:text-teal-300 text-sm">
            ← Back to Plans
          </Link>
        </div>
      </div>
    );
  }

  const result = await getApiKeysAction();
  const initialKeys = result.success ? result.data : [];

  return (
    <div className="min-h-screen bg-[#0F1117] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/admin"
                className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
              >
                ← Admin
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-rose-50">API Keys</h1>
            <p className="text-blue-200/60 mt-1">
              Manage API keys for external integrations. Keys are shared across all internal projects.
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-4 flex items-start gap-3">
          <Key className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm text-slate-400 font-medium">How to use</p>
            <p className="text-xs text-slate-500 font-mono">
              Authorization: Bearer elux_&lt;your-key&gt;
            </p>
            <p className="text-xs text-slate-600">
              Keys are stored as SHA-256 hashes — the plain key is only shown once at generation.
            </p>
          </div>
        </div>

        <ApiKeyManagement initialKeys={initialKeys} />
      </div>
    </div>
  );
}
