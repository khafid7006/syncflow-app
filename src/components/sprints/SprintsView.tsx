import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Timer, Target, Plus, ChevronRight, FileText, 
  ExternalLink, Calendar, CheckSquare, BookOpen, Layers 
} from 'lucide-react';
import { StatusBadge, PriorityBadge, PodBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Sprint } from '../../types';

export const SprintsView: React.FC<{ onCreateTask?: () => void }> = ({ onCreateTask }) => {
  const { 
    currentUser, 
    sprints, 
    tasks, 
    teams, 
    createSprint, 
    setSelectedTaskId,
    selectedTeamFilter,
    setSelectedTeamFilter,
    setIsSopModalOpen
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSprintDetail, setSelectedSprintDetail] = useState<Sprint | null>(null);

  // Form states
  const [sprintTitle, setSprintTitle] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().substring(0, 10);
  });
  const [teamId, setTeamId] = useState(() => currentUser.team_id || teams[0]?.id || '');

  const effectiveTeamId = currentUser.role === 'BUSINESS_OWNER'
    ? (selectedTeamFilter === 'ALL' ? (teams[0]?.id || '') : selectedTeamFilter)
    : (currentUser.team_id || teams[0]?.id || '');

  const currentTeam = teams.find(t => t.id === effectiveTeamId) || teams[0];
  const teamSprints = sprints.filter(s => s.team_id === currentTeam?.id);

  const isBO = currentUser.role === 'BUSINESS_OWNER';
  const canCreateSprint = currentUser.role === 'PROJECT_OWNER';

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTeamId = teamId || currentTeam?.id;
    if (!targetTeamId) {
      alert('Silakan pilih tim.');
      return;
    }
    if (!sprintTitle.trim()) {
      alert('Silakan masukkan judul sprint.');
      return;
    }
    if (!sprintGoal.trim()) {
      alert('Silakan masukkan target utama (Sprint Goal).');
      return;
    }
    if (!meetingNotes.trim()) {
      alert('Silakan masukkan notulensi rapat / background hasil diskusi tim.');
      return;
    }

    createSprint({
      team_id: targetTeamId,
      title: sprintTitle.trim(),
      start_date: startDate,
      end_date: endDate,
      goal: sprintGoal.trim(),
      meeting_notes: meetingNotes.trim(),
      document_url: documentUrl.trim() || undefined
    });

    setIsCreateModalOpen(false);
    setSprintTitle('');
    setSprintGoal('');
    setMeetingNotes('');
    setDocumentUrl('');
  };

  if (teams.length === 0) {
    return (
      <div className="space-y-4 pb-12 text-xs">
        <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] text-center space-y-2 max-w-md mx-auto my-10 shadow-sm">
          <Timer className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-base font-mono font-bold text-[#370000]">
            Belum ada sprint.
          </h2>
          <p className="text-slate-500 text-xs">
            Buat tim terlebih dahulu di menu Tim untuk merencanakan sprint.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12 text-xs">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#F59E0B]" />
            <h1 className="text-xl font-mono font-bold text-[#370000]">
              Target Mingguan
            </h1>
            {isBO && (
              <span className="px-2.5 py-0.5 rounded-md bg-[#370000]/10 text-[#370000] border border-[#370000]/20 font-mono font-bold text-[10px]">
                Mode Read-Only (BO Monitoring)
              </span>
            )}
          </div>
          <p className="text-xs text-[#722300]/80 mt-1">
            {isBO
              ? `Monitoring siklus pengerjaan sprint mingguan untuk ${currentTeam?.name || 'Tim'}.`
              : `Siklus pengerjaan 1 minggu terukur untuk ${currentTeam?.name || 'Tim'} dilengkapi Notulensi Planning.`
            }
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {currentUser.role === 'BUSINESS_OWNER' && (
            <select
              value={currentTeam?.id || ''}
              onChange={e => setSelectedTeamFilter(e.target.value)}
              className="bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#370000]"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsSopModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#370000] font-mono font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Panduan SOP</span>
          </button>

          {canCreateSprint && (
            <button
              onClick={() => {
                setTeamId(currentTeam?.id || '');
                setIsCreateModalOpen(true);
              }}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] px-4 py-2.5 rounded-xl text-xs font-mono font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Sprint Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* SPRINT LIST */}
      {teamSprints.length > 0 ? (
        <div className="space-y-4">
          {teamSprints.map(sprint => {
            const sprintTasks = tasks.filter(t => t.sprint_id === sprint.id);
            const doneTasks = sprintTasks.filter(t => t.status === 'SELESAI');
            const reviewTasks = sprintTasks.filter(t => t.status === 'REVIEW');
            const inProgressTasks = sprintTasks.filter(t => t.status === 'DIKERJAKAN');
            const backlogTasks = sprintTasks.filter(t => t.status === 'BACKLOG');
            const progress = sprintTasks.length > 0 ? Math.round((doneTasks.length / sprintTasks.length) * 100) : 0;

            return (
              <div
                key={sprint.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4"
              >
                {/* Sprint Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-mono font-bold text-[#370000]">
                      {sprint.title}
                    </h2>
                    <div className="font-mono text-slate-500 text-xs mt-0.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{sprint.start_date} s/d {sprint.end_date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedSprintDetail(sprint)}
                      className="px-3.5 py-2 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#722300] font-mono font-bold rounded-xl border border-[#F59E0B]/40 flex items-center gap-1.5 cursor-pointer transition-colors text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Lihat Notulensi & Background</span>
                    </button>
                    <div className="font-mono font-bold text-[#F59E0B] text-base">
                      {progress}%
                    </div>
                  </div>
                </div>

                {/* Goal & Background Preview */}
                <div className="p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl space-y-1.5">
                  <div className="font-mono font-bold text-[#370000] text-xs flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[#F59E0B] shrink-0" />
                    Target Utama (Sprint Goal):
                  </div>
                  <p className="text-slate-800 text-xs leading-relaxed font-medium">
                    "{sprint.goal}"
                  </p>

                  {sprint.document_url && (
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[#722300] font-mono font-semibold">
                      <ExternalLink className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <a href={sprint.document_url} target="_blank" rel="noreferrer" className="hover:underline truncate">
                        Dokumen Pendukung: {sprint.document_url}
                      </a>
                    </div>
                  )}
                </div>

                {/* 4 Summary Badges */}
                <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="text-[10px] text-emerald-800 font-semibold">Selesai</div>
                    <div className="text-base font-bold text-emerald-600">{doneTasks.length}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#722300]/10 border border-[#722300]/20">
                    <div className="text-[10px] text-[#722300] font-semibold">Review</div>
                    <div className="text-base font-bold text-[#722300]">{reviewTasks.length}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]">
                    <div className="text-[10px] text-[#722300] font-semibold">Dikerjakan</div>
                    <div className="text-base font-bold text-[#722300]">{inProgressTasks.length}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#E2E8F0] border border-[#CBD5E1]">
                    <div className="text-[10px] text-[#370000] font-semibold">Backlog</div>
                    <div className="text-base font-bold text-[#370000]">{backlogTasks.length}</div>
                  </div>
                </div>

                {/* Sprint Tasks List */}
                <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                  <div className="font-mono font-bold text-[#370000] text-xs">
                    Tugas dalam Sprint ({sprintTasks.length})
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {sprintTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-[#E2E8F0] cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors font-mono"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-[#370000] bg-[#E2E8F0] px-1.5 py-0.5 rounded text-[10px]">{task.code}</span>
                          <span className="font-bold text-[#370000] truncate">{task.title}</span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <PodBadge pod={task.pod_label} />
                          <PriorityBadge priority={task.priority} size="sm" />
                          <StatusBadge status={task.status} size="sm" />
                        </div>
                      </div>
                    ))}

                    {sprintTasks.length === 0 && (
                      <div className="text-center py-4 text-slate-400 text-xs italic font-mono">
                        Belum ada tugas di sprint ini.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center space-y-3 shadow-sm font-mono">
          <Timer className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-[#370000]">
            Belum ada sprint untuk {currentTeam?.name}
          </h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            {canCreateSprint
              ? 'Lakukan diskusi perencanaan bersama tim (Sprint Planning) terlebih dahulu sebelum membuat Sprint baru.'
              : 'Menunggu Project Owner untuk merencanakan dan membuat sprint mingguan baru.'}
          </p>
          {canCreateSprint && (
            <button
              onClick={() => {
                setTeamId(currentTeam?.id || '');
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-bold rounded-xl text-xs cursor-pointer shadow-xs inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Sprint Baru Sekarang</span>
            </button>
          )}
        </div>
      )}

      {/* DETAIL MODAL NOTULENSI */}
      <Modal
        isOpen={Boolean(selectedSprintDetail)}
        onClose={() => setSelectedSprintDetail(null)}
        title={`Notulensi & Background Rapat: ${selectedSprintDetail?.title || ''}`}
        subtitle={`Rentang Waktu: ${selectedSprintDetail?.start_date} s/d ${selectedSprintDetail?.end_date}`}
      >
        {selectedSprintDetail && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-mono font-bold text-[#370000] text-xs flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#F59E0B]" />
                Target Utama (Sprint Goal):
              </label>
              <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl text-[#370000] font-semibold leading-relaxed">
                "{selectedSprintDetail.goal}"
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono font-bold text-[#370000] text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#F59E0B]" />
                Rangkuman Notulensi Rapat & Background:
              </label>
              <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {selectedSprintDetail.meeting_notes || 'Tidak ada catatan notulensi tambahan.'}
              </div>
            </div>

            {selectedSprintDetail.document_url && (
              <div className="space-y-1 font-mono">
                <label className="font-bold text-[#370000] text-xs">Tautan Dokumen Pendukung:</label>
                <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-between">
                  <a
                    href={selectedSprintDetail.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#F59E0B] font-bold hover:underline truncate"
                  >
                    {selectedSprintDetail.document_url}
                  </a>
                  <ExternalLink className="w-4 h-4 text-[#F59E0B] shrink-0 ml-2" />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setSelectedSprintDetail(null)}
                className="px-4 py-2 bg-[#370000] hover:bg-[#250000] text-white font-mono font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE SPRINT MODAL (HANYA UNTUK PROJECT OWNER) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-[#370000] font-mono">
            <Plus className="w-5 h-5 text-[#F59E0B]" />
            <span>Buat Sprint Baru (Sprint Planning)</span>
          </div>
        }
        subtitle="Sprint harus dilengkapi Target Utama dan Rangkuman Notulensi Rapat Tim."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {/* Tim Terpilih */}
          {currentUser.role === 'BUSINESS_OWNER' && (
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Pilih Tim</label>
              <select
                value={teamId}
                onChange={e => setTeamId(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                ))}
              </select>
            </div>
          )}

          {/* Judul Sprint */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Judul Sprint *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Sprint 14 — Sistem Otentikasi & Verifikasi OTP"
              value={sprintTitle}
              onChange={e => setSprintTitle(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs"
            />
          </div>

          {/* Target Utama (Sprint Goal) */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Target Utama (Sprint Goal) *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Menyelesaikan seluruh modul pendaftaran dan login via Google OAuth & WhatsApp OTP"
              value={sprintGoal}
              onChange={e => setSprintGoal(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs"
            />
          </div>

          {/* Tanggal Mulai & Selesai */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Tanggal Mulai *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Tanggal Selesai *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Notulensi Rapat & Background */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Notulensi Rapat / Background Mengapa Sprint Dibuat *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Tuliskan rangkuman hasil diskusi rapat perencanaan: mengapa fitur ini diprioritaskan, kebutuhan user, dan deliverables yang disepakati..."
              value={meetingNotes}
              onChange={e => setMeetingNotes(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-sans leading-relaxed"
            />
          </div>

          {/* Link Dokumen Pendukung */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Tautan Dokumen Pendukung (Opsional)
            </label>
            <input
              type="url"
              placeholder="https://docs.google.com/... atau https://figma.com/..."
              value={documentUrl}
              onChange={e => setDocumentUrl(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold rounded-xl text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl text-xs cursor-pointer shadow-xs"
            >
              Terbitkan Sprint
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
