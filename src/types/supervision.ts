export type ActiveView =
  | 'dashboard'
  | 'master-data'
  | 'programs'
  | 'schedule'
  | 'academic-instrument'
  | 'managerial-instrument'
  | 'reports';

export type UserRole =
  | 'Kepala Sekolah'
  | 'Wakil Kepala Sekolah'
  | 'Guru'
  | 'Kepala Tata Usaha'
  | 'Tim Supervisi';

export type EmploymentStatus = 'PNS' | 'PPPK' | 'Honorer';

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  nuptk: string;
  pangkatGolongan: string;
  jabatan: string;
  mataPelajaran: string;
  pendidikanTerakhir: string;
  statusKepegawaian: EmploymentStatus;
  phone: string;
}

export interface Staff {
  id: string;
  name: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
}

export interface SupervisorMember {
  id: string;
  name: string;
  nip: string;
  jabatan: string;
  bidangSupervisi: string;
}

export interface AcademicYearConfig {
  id: string;
  tahunPelajaran: string;
  semester: 'Ganjil' | 'Genap';
  isActive: boolean;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  pengawasPembina: string;
  nipPengawasPembina: string;
}

export type SupervisionCategory = 'Akademik' | 'Manajerial';

export interface SupervisionProgram {
  id: string;
  code: string;
  category: SupervisionCategory;
  title: string;
  tujuan: string;
  indikatorKeberhasilan: string;
  sasaran: string;
  penanggungJawab: string;
  waktuPelaksanaan: string;
  instrumen: string;
  targetCapaian: string;
  realized: boolean;
}

export type ScheduleStatus = 'Terjadwal' | 'Terlaksana' | 'Ditunda' | 'Dibatalkan';

export interface ScheduleItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., 08:00 - 09:30 WIB
  targetName: string;
  targetType: 'Guru' | 'Unit Kerja';
  supervisionType: SupervisionCategory;
  programTitle: string;
  supervisorName: string;
  location: string;
  notes: string;
  status: ScheduleStatus;
}

export type ScoreValue = 1 | 2 | 3 | 4;

export interface AcademicAspect {
  id: string;
  number: number;
  title: string;
  description: string;
}

export type PredikatType = 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Pembinaan';

export interface AcademicAssessment {
  id: string;
  scheduleId?: string;
  teacherId: string;
  teacherName: string;
  teacherNip: string;
  mataPelajaran: string;
  kelas: string;
  date: string;
  supervisorName: string;
  scores: Record<string, ScoreValue>;
  aspectNotes: Record<string, string>;
  catatanSupervisor: string;
  kelebihanGuru: string;
  aspekDitingkatkan: string;
  rekomendasiPembinaan: string;
  rencanaTindakLanjut: string;
  totalScore: number;
  percentage: number;
  predikat: PredikatType;
  createdAt: string;
}

export interface ManagerialUnitDefinition {
  key: string;
  label: string;
  defaultPIC: string;
  defaultNIP: string;
  indicators: {
    id: string;
    title: string;
    description: string;
  }[];
}

export interface ManagerialAssessment {
  id: string;
  scheduleId?: string;
  unitKey: string;
  unitLabel: string;
  penanggungJawab: string;
  nipPenanggungJawab: string;
  date: string;
  supervisorName: string;
  scores: Record<string, ScoreValue>;
  indicatorNotes: Record<string, string>;
  analisisKekuatan: string;
  catatanPembenahan: string;
  tindakLanjut: string;
  totalScore: number;
  percentage: number;
  predikat: PredikatType;
  createdAt: string;
}

export interface MonthlyCycle {
  monthIndex: number; // 0-11 in cycle (0 = Juli 2026 .. 11 = Juni 2027)
  calendarMonth: number; // 1-12
  calendarYear: number;
  monthLabel: string;
  shortLabel: string;
  theme: string;
  focusCategory: SupervisionCategory | 'Evaluasi & Pelaporan';
}

export interface FinalEvaluationNote {
  kelebihanUmum: string;
  kekuranganUmum: string;
  rekomendasiStrategis: string;
  updatedAt: string;
}

