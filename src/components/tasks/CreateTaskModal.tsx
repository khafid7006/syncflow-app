import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { PodType, TaskPriority, DodItem } from '../../types';
import { Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { DEFAULT_DOD_CHECKLIST } from '../../data/initialData';

export const CreateTaskModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, teams, users, sprints, createTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState(() => currentUser.team_id || teams[0]?.id || '');
  const [podLabel, setPodLabel] = useState<PodType>('PB');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().substring(0, 10);
  });
  const [sprintId, setSprintId] = useState('');

  // Customizable DoD criteria by PL / PO
  const [dodItems, setDodItems] = useState<DodItem[]>(() => 
    DEFAULT_DOD_CHECKLIST.map(d => ({ ...d, completed: false }))
  );
  const [newDodLabel, setNewDodLabel] = useState('');

  useEffect(() => {
    if (!teamId && teams.length > 0) {
      setTeamId(currentUser.team_id || teams[0].id);
    }
  }, [teams, currentUser]);

  const effectiveTeamId = teamId || teams[0]?.id || '';
  const availableSprints = sprints.filter(s => s.team_id === effectiveTeamId);
  const eligibleUsers = users.filter(u => u.team_id === effectiveTeamId);

  const handleAddDodItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDodLabel.trim()) return;

    setDodItems(prev => [
      ...prev,
      {
        id: `dod-${Date.now()}`,
        label: newDodLabel.trim(),
        completed: false
      }
    ]);
    setNewDodLabel('');
  };

  const handleRemoveDodItem = (id: string) => {
    if (dodItems.length <= 1) {
      alert('Tugas wajib memiliki minimal 1 syarat Definition of Done.');
      return;
    }
    setDodItems(prev => prev.filter(item => item.id !== id));
  };

  const handleEditDodItemText = (id: string, newText: string) => {
    setDodItems(prev => prev.map(item => item.id === id ? { ...item, label: newText } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveTeamId) {
      alert('Silakan buat tim terlebih dahulu.');
      return;
    }
    if (!title.trim()) {
      alert('Silakan masukkan judul tugas.');
      return;
    }

    createTask({
      title: title.trim(),
      description: description.trim(),
      team_id: effectiveTeamId,
      pod_label: podLabel,
      assignee_id: assigneeId || eligibleUsers[0]?.id || currentUser.id,
      priority,
      deadline,
      sprint_id: sprintId || availableSprints[0]?.id || '',
      dod_checklist: dodItems
    });

    onClose();
    setTitle('');
    setDescription('');
    setAssigneeId('');
    setDodItems(DEFAULT_DOD_CHECKLIST.map(d => ({ ...d, completed: false })));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-[#370000] font-mono">
          <Plus className="w-5 h-5 text-[#F59E0B]" />
          <span>Buat Tugas Baru & Tentukan DoD</span>
        </div>
      }
      subtitle="Tetapkan spesifikasi tugas, penanggung jawab, dan kriteria Definition of Done (DoD)."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Judul Tugas */}
        <div className="space-y-1">
          <label className="block font-bold text-slate-700">
            Judul Tugas *
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Integrasi Autentikasi Pengguna & Token"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs"
          />
        </div>

        {/* Deskripsi */}
        <div className="space-y-1">
          <label className="block font-bold text-slate-700">
            Deskripsi Kebutuhan
          </label>
          <textarea
            rows={3}
            placeholder="Rincian teknis pengerjaan tugas..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-sans"
          />
        </div>

        {/* Tim (Jika Business Owner) */}
        {currentUser.role === 'BUSINESS_OWNER' && (
          <div className="space-y-1 font-mono">
            <label className="block font-bold text-slate-700 font-sans">Pilih Tim</label>
            <select
              value={teamId}
              onChange={e => setTeamId(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>
        )}

        {/* Sprint & Pod */}
        <div className="grid grid-cols-2 gap-3 font-mono">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 font-sans">Sprint Mingguan</label>
            <select
              value={sprintId}
              onChange={e => setSprintId(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs"
            >
              <option value="">Tanpa Sprint</option>
              {availableSprints.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700 font-sans">Pod Fungsi (Label)</label>
            <select
              value={podLabel}
              onChange={e => setPodLabel(e.target.value as PodType)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold"
            >
              <option value="BA">Pod BA (Business Analyst)</option>
              <option value="PB">Pod PB (Product Builder)</option>
              <option value="QA">Pod QA (Quality Assurance)</option>
              <option value="MG">Pod MG (Marketing & Growth)</option>
            </select>
          </div>
        </div>

        {/* Penanggung Jawab & Prioritas */}
        <div className="grid grid-cols-2 gap-3 font-mono">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 font-sans">Penanggung Jawab</label>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs"
            >
              <option value="">Pilih Anggota</option>
              {eligibleUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.pod_label || u.role})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700 font-sans">Prioritas</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold"
            >
              <option value="LOW">Rendah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HIGH">Tinggi</option>
              <option value="CRITICAL">Kritis</option>
            </select>
          </div>
        </div>

        {/* Deadline */}
        <div className="space-y-1">
          <label className="block font-bold text-slate-700 font-sans">Tenggat Waktu (Deadline) *</label>
          <input
            type="date"
            required
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono"
          />
        </div>

        {/* KONTROL DEFINITION OF DONE (DoD) - OLEH LEADER / PO */}
        <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2.5 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#370000]">
              <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
              <span>Kriteria Definition of Done (DoD) Wajib</span>
            </div>
            <span className="text-[10px] text-[#722300] bg-[#F59E0B]/20 px-2 py-0.5 rounded font-bold">
              Ditentukan oleh Leader / PO
            </span>
          </div>

          {/* List of DoD Items */}
          <div className="space-y-1.5">
            {dodItems.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="w-5 text-[11px] font-bold text-[#722300]">{idx + 1}.</span>
                <input
                  type="text"
                  value={item.label}
                  onChange={e => handleEditDodItemText(item.id, e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-[#F59E0B]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveDodItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Hapus kriteria DoD"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom DoD item */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Tambah kriteria DoD spesifik untuk tugas ini..."
              value={newDodLabel}
              onChange={e => setNewDodLabel(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDodItem(e);
                }
              }}
              className="flex-1 px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-[#F59E0B]"
            />
            <button
              type="button"
              onClick={handleAddDodItem}
              className="px-3 py-1.5 bg-slate-200 hover:bg-[#F59E0B] text-[#370000] rounded-lg font-mono font-bold text-xs cursor-pointer transition-colors shrink-0"
            >
              + Tambah
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold rounded-xl text-xs cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl text-xs cursor-pointer shadow-xs"
          >
            Buat Tugas
          </button>
        </div>
      </form>
    </Modal>
  );
};
