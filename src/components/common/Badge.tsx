import React from 'react';
import { TaskPriority, TaskStatus, PodType, UserRole } from '../../types';

export const RoleBadge: React.FC<{ role?: UserRole }> = ({ role = 'MEMBER' }) => {
  const styles: Record<UserRole, { bg: string; label: string }> = {
    BUSINESS_OWNER: { bg: 'bg-slate-900 text-white font-bold', label: 'Business Owner' },
    PROJECT_OWNER: { bg: 'bg-[#F59E0B]/20 text-[#EA580C] border border-[#F59E0B]/40 font-bold', label: 'Project Owner' },
    PROJECT_LEADER: { bg: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold', label: 'Project Leader' },
    MEMBER: { bg: 'bg-slate-100 text-slate-700 border border-slate-200', label: 'Member' }
  };

  const current = (role && styles[role]) ? styles[role] : styles.MEMBER;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono font-semibold ${current.bg}`}>
      {current.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority?: TaskPriority; size?: 'sm' | 'md' }> = ({ priority = 'MEDIUM', size = 'sm' }) => {
  const styles: Record<TaskPriority, { bg: string; text: string; border: string; label: string }> = {
    LOW: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Rendah' },
    MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700 font-semibold', border: 'border-amber-200', label: 'Sedang' },
    HIGH: { bg: 'bg-[#F59E0B]/20', text: 'text-[#EA580C] font-bold', border: 'border-[#F59E0B]/40', label: 'Tinggi' },
    CRITICAL: { bg: 'bg-rose-50', text: 'text-rose-700 font-bold', border: 'border-rose-300', label: 'Kritis' }
  };

  const current = (priority && styles[priority]) ? styles[priority] : styles.MEDIUM;
  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full border font-mono font-medium ${padding} ${current.bg} ${current.text} ${current.border}`}>
      {current.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status?: TaskStatus; size?: 'sm' | 'md' }> = ({ status = 'BACKLOG', size = 'sm' }) => {
  const styles: Record<TaskStatus, { bg: string; text: string; border: string; label: string }> = {
    BACKLOG: { 
      bg: 'bg-slate-100 text-slate-700', 
      text: 'text-slate-700', 
      border: 'border-slate-200', 
      label: 'Daftar Tugas' 
    },
    DIKERJAKAN: { 
      bg: 'bg-[#F59E0B]/15 text-[#EA580C] font-bold', 
      text: 'text-[#EA580C]', 
      border: 'border-[#F59E0B]/40', 
      label: 'Dikerjakan' 
    },
    POD_REVIEW: { 
      bg: 'bg-indigo-50 text-indigo-700 font-bold', 
      text: 'text-indigo-700', 
      border: 'border-indigo-200', 
      label: 'Cek Pod' 
    },
    REVIEW: { 
      bg: 'bg-blue-50 text-blue-700 font-bold', 
      text: 'text-blue-700', 
      border: 'border-blue-200', 
      label: 'Cek Tim' 
    },
    SELESAI: { 
      bg: 'bg-emerald-50 text-emerald-700 font-bold', 
      text: 'text-emerald-700', 
      border: 'border-emerald-200', 
      label: 'Selesai' 
    }
  };

  const current = (status && styles[status]) ? styles[status] : styles.BACKLOG;
  const padding = size === 'sm' ? 'px-3 py-0.5 text-[11px]' : 'px-3.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full font-mono font-semibold border ${padding} ${current.bg} ${current.border}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80"></span>
      {current.label}
    </span>
  );
};

export const PodBadge: React.FC<{ pod?: PodType | string }> = ({ pod = 'PB' }) => {
  const styles: Record<string, { bg: string; label: string; full: string }> = {
    BA: { bg: 'bg-sky-50 text-sky-800 border-sky-200', label: 'BA', full: 'Business Analyst' },
    PB: { bg: 'bg-purple-50 text-purple-800 border-purple-200', label: 'PB', full: 'Product Builder' },
    QA: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'QA', full: 'Quality Assurance' },
    MG: { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'MG', full: 'Marketing & Growth' },
    BUSINESS_ANALYST: { bg: 'bg-sky-50 text-sky-800 border-sky-200', label: 'BA', full: 'Business Analyst' },
    PRODUCT_BUILDER: { bg: 'bg-purple-50 text-purple-800 border-purple-200', label: 'PB', full: 'Product Builder' },
    QUALITY_ASSURANCE: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'QA', full: 'Quality Assurance' },
    MARKETING_GROWTH: { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'MG', full: 'Marketing & Growth' }
  };

  const current = (pod && styles[pod]) ? styles[pod] : styles.PB;

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${current.bg}`}
      title={current.full}
    >
      {current.label} • {current.full}
    </span>
  );
};

export const PodOwnerBadge: React.FC<{ pod?: PodType | string }> = ({ pod = 'PB' }) => {
  return (
    <span 
      className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F59E0B]/20 text-[#EA580C] border border-[#F59E0B]/40"
      title="Ketua Pod (Memilik wewenang pemeriksaan awal tugas Pod)"
    >
      <span>Ketua Pod</span>
      <span className="opacity-75 font-mono">({pod})</span>
    </span>
  );
};
