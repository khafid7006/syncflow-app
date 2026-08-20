import { User, Team, Sprint, Task, DodItem } from '../types';

export const DEFAULT_DOD_CHECKLIST: DodItem[] = [
  { id: 'dod-1', label: 'Hasil kerja sudah selesai sesuai deskripsi tugas', completed: false },
  { id: 'dod-2', label: 'Tautan dokumen / PR / bukti hasil kerja sudah dilampirkan', completed: false },
  { id: 'dod-3', label: 'Telah dicek mandiri & siap direview', completed: false }
];

export const INITIAL_USERS: User[] = [];
export const INITIAL_TEAMS: Team[] = [];
export const INITIAL_SPRINTS: Sprint[] = [];
export const INITIAL_TASKS: Task[] = [];
