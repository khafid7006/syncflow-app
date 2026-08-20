import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertOctagon, ShieldAlert, CheckCircle2, Clock, 
  Plus, ChevronRight, User, AlertTriangle, CheckCheck,
  Send, ShieldCheck, Zap
} from 'lucide-react';
import { BlockerSeverityBadge, BlockerCategoryBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { BlockerSeverity, BlockerCategory } from '../../types';

export const BlockersView: React.FC = () => {
  const { 
    currentUser, 
    blockers, 
    tasks, 
    teams, 
    users, 
    createBlocker, 
    resolveBlocker, 
    escalateBlockerToOwner,
    setSelectedTaskId,
    selectedTeamIdFilter,
    setSelectedTeamIdFilter
  } = useApp();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedTaskId, setFormTaskId] = useState('');
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState<BlockerSeverity>('HIGH');
  const [category, setCategory] = useState<BlockerCategory>('BLOCKER');

  // Resolve Modal state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvingBlockerId, setResolvingBlockerId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Category filter
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'OPEN' | 'RESOLVED' | 'ALL'>('OPEN');

  const isPO = currentUser.role === 'PROJECT_OWNER';
  const isLeader = currentUser.role === 'PROJECT_LEADER';

  // Filtered blockers
  const filteredBlockers = blockers.filter(b => {
    // Team filter
    if (currentUser.role === 'PROJECT_LEADER' && currentUser.teamId) {
      if (b.teamId !== currentUser.teamId) return false;
    } else if (selectedTeamIdFilter !== 'ALL') {
      if (b.teamId !== selectedTeamIdFilter) return false;
    }

    // Status filter
    if (statusFilter === 'OPEN' && b.status === 'RESOLVED') return false;
    if (statusFilter === 'RESOLVED' && b.status !== 'RESOLVED') return false;

    // Category filter
    if (categoryFilter !== 'ALL' && b.category !== categoryFilter) return false;

    return true;
  });

  const openBlockers = filteredBlockers.filter(b => b.status !== 'RESOLVED');
  const criticalBlockers = openBlockers.filter(b => b.severity === 'CRITICAL');
  const highBlockers = openBlockers.filter(b => b.severity === 'HIGH');
  const resolvedBlockers = filteredBlockers.filter(b => b.status === 'RESOLVED');

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !reason.trim()) {
      alert('Silakan pilih tugas dan masukkan rincian masalah.');
      return;
    }

    createBlocker(selectedTaskId, reason.trim(), severity, category);
    setIsReportModalOpen(false);
    setReason('');
    setFormTaskId('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolvingBlockerId && resolutionNotes.trim()) {
      resolveBlocker(resolvingBlockerId, resolutionNotes.trim());
      setIsResolveModalOpen(false);
      setResolvingBlockerId(null);
      setResolutionNotes('');
    }
  };

  // Available active tasks to report blocker on
  const eligibleTasks = tasks.filter(t => {
    if (t.status === 'DONE') return false;
    if (currentUser.role === 'PROJECT_OWNER') return true;
    if (currentUser.role === 'PROJECT_LEADER') return t.teamId === currentUser.teamId;
    return t.ownerId === currentUser.id;
  });

  return (
    <div className="space-y-5 pb-12 text-xs">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Masalah & Kendala (Blockers)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau dan selesaikan kendala yang menghambat progres pengerjaan tim.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isPO && (
            <select
              value={selectedTeamIdFilter}
              onChange={e => setSelectedTeamIdFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
            >
              <option value="ALL">Semua Tim</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name.split(' - ')[0]}</option>
              ))}
            </select>
          )}

          <button
            id="report-blocker-btn"
            onClick={() => setIsReportModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Laporkan Masalah</span>
          </button>
        </div>
      </div>

      {/* Snapshot Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Masalah Aktif</div>
          <div className="text-xl font-bold text-rose-600 font-mono">{openBlockers.length}</div>
          <div className="text-[10px] text-slate-500">Memerlukan penanganan</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Tingkat Kritis (Dieskalasi)</div>
          <div className="text-xl font-bold text-rose-700 font-mono">{criticalBlockers.length}</div>
          <div className="text-[10px] text-rose-600 font-semibold">Intervensi Project Owner</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Prioritas Tinggi</div>
          <div className="text-xl font-bold text-amber-600 font-mono">{highBlockers.length}</div>
          <div className="text-[10px] text-slate-500">Eskalasi Project Leader</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Masalah Terselesaikan</div>
          <div className="text-xl font-bold text-emerald-600 font-mono">{resolvedBlockers.length}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Terdokumentasi</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('OPEN')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              statusFilter === 'OPEN' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Masalah Aktif ({openBlockers.length})
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              statusFilter === 'RESOLVED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Telah Selesai ({resolvedBlockers.length})
          </button>
        </div>

        {/* Filter Kategori */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs"
        >
          <option value="ALL">Semua Kategori</option>
          <option value="BLOCKER">Pemblokir (Blocker)</option>
          <option value="BUG">Bug / Cacat Sistem</option>
          <option value="REVIEW">Review / Persetujuan</option>
          <option value="OTHER">Lainnya</option>
        </select>
      </div>

      {/* LIST MASALAH */}
      <div className="space-y-3">
        {filteredBlockers.map(b => {
          const isResolved = b.status === 'RESOLVED';
          const team = teams.find(t => t.id === b.teamId);
          const isCritical = b.severity === 'CRITICAL';

          return (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                isResolved
                  ? 'bg-slate-50/70 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                  : isCritical
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                    {b.code}
                  </span>
                  <BlockerSeverityBadge severity={b.severity} />
                  {b.category && <BlockerCategoryBadge category={b.category} />}
                  <span className="text-slate-400 font-mono text-[10px]">
                    {team?.name ? team.name.split(' - ')[0] : 'Tim'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">{b.reportedAt}</span>
                  {isResolved ? (
                    <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      Terselesaikan
                    </span>
                  ) : (
                    <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      Terbuka
                    </span>
                  )}
                </div>
              </div>

              {/* Reason description */}
              <p className="text-slate-800 dark:text-slate-200 font-medium text-xs leading-relaxed">
                {b.reason}
              </p>

              {/* Linked task info */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <div className="truncate">
                  <span className="text-slate-400">Tugas Terkait: </span>
                  <span 
                    onClick={() => setSelectedTaskId(b.taskId)}
                    className="font-bold text-sky-600 hover:underline cursor-pointer"
                  >
                    {b.taskTitle}
                  </span>
                </div>
                <span className="text-slate-400 shrink-0">Pelapor: <strong>{b.reportedByName}</strong></span>
              </div>

              {/* Resolution note if resolved */}
              {isResolved && b.resolutionNotes && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-950 dark:text-emerald-200 text-xs space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Catatan Solusi / Penyelesaian (oleh {b.resolvedBy}):
                  </div>
                  <p className="text-[11px]">{b.resolutionNotes}</p>
                </div>
              )}

              {/* Action buttons */}
              {!isResolved && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>Eskalasi: <strong>{b.escalatedTo === 'OWNER' ? 'Project Owner' : 'Project Leader'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Leader / PO can resolve */}
                    {(isLeader || isPO) && (
                      <button
                        onClick={() => {
                          setResolvingBlockerId(b.id);
                          setIsResolveModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selesaikan Masalah</span>
                      </button>
                    )}

                    {/* Leader can escalate to PO if not yet escalated */}
                    {isLeader && b.escalatedTo !== 'OWNER' && (
                      <button
                        onClick={() => {
                          const note = prompt('Masukkan catatan eskalasi ke Project Owner:');
                          if (note) escalateBlockerToOwner(b.id, note);
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Eskalasikan ke Project Owner</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredBlockers.length === 0 && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Tidak Ada Masalah Aktif
            </h3>
            <p className="text-slate-400 text-xs">
              Seluruh pekerjaan tim berjalan lancar tanpa kendala.
            </p>
          </div>
        )}
      </div>

      {/* Modal Laporkan Masalah */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Laporkan Masalah / Blocker"
        subtitle="Laporkan kendala yang menghambat tugas agar segera mendapatkan bantuan atau eskalasi kepemimpinan."
      >
        <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Pilih Tugas yang Terhambat *
            </label>
            <select
              required
              value={selectedTaskId}
              onChange={e => setFormTaskId(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-semibold"
            >
              <option value="">Pilih tugas aktif...</option>
              {eligibleTasks.map(t => (
                <option key={t.id} value={t.id}>{t.code}: {t.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Tingkat Keparahan *
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as BlockerSeverity)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-semibold"
              >
                <option value="LOW">Rendah (Low)</option>
                <option value="MEDIUM">Sedang (Medium)</option>
                <option value="HIGH">Tinggi (High - Eskalasi Leader)</option>
                <option value="CRITICAL">Kritis (Critical - Eskalasi Project Owner)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Kategori Masalah
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as BlockerCategory)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-semibold"
              >
                <option value="BLOCKER">Pemblokir Teknis / Dependensi</option>
                <option value="BUG">Bug Kritis / Crash</option>
                <option value="REVIEW">Tertahan Review / Desain</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Rincian Kendala *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Jelaskan secara spesifik apa yang memblokir pengerjaan dan bantuan apa yang dibutuhkan..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 text-slate-500 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Kirim Laporan Masalah
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Selesaikan Masalah */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Selesaikan Masalah"
        subtitle="Dokumentasikan tindakan perbaikan yang telah dilakukan untuk menyelesaikan kendala ini."
      >
        <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Catatan Tindakan / Solusi *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Contoh: Kredensial sandbox payment gateway telah diperbarui dan API key baru telah dikonfigurasi di environment staging..."
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setIsResolveModalOpen(false)}
              className="px-4 py-2 text-slate-500 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Tandai Masalah Selesai
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
