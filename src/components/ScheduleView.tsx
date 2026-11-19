import React, { useMemo, useState } from 'react';
import {
  BellRing,
  Calendar as CalendarIcon,
  ClipboardCheck,
  Download,
  Pencil,
  Plus,
  Printer,
  Table2,
  Trash2,
  X,
} from 'lucide-react';
import {
  ANNUAL_MONTHLY_CYCLES,
  MANAGERIAL_UNITS,
  SCHOOL_ASSETS,
  SCHOOL_IDENTITY,
} from '../data/initialData';
import {
  AcademicYearConfig,
  ScheduleItem,
  ScheduleStatus,
  SupervisionCategory,
  SupervisionProgram,
  SupervisorMember,
  Teacher,
} from '../types/supervision';
import { exportToExcel } from '../utils/excelHelper';

interface ScheduleViewProps {
  activeYear: AcademicYearConfig;
  schedules: ScheduleItem[];
  onSaveSchedules: (next: ScheduleItem[]) => void;
  teachers: Teacher[];
  supervisors: SupervisorMember[];
  programs: SupervisionProgram[];
  selectedCycleMonthIndex: number;
  onChangeCycleMonthIndex: (idx: number) => void;
  onStartAssessment: (schedule: ScheduleItem) => void;
}

const STATUS_LIST: ScheduleStatus[] = [
  'Terjadwal',
  'Terlaksana',
  'Ditunda',
  'Dibatalkan',
];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  activeYear,
  schedules,
  onSaveSchedules,
  teachers,
  supervisors,
  programs,
  selectedCycleMonthIndex,
  onChangeCycleMonthIndex,
  onStartAssessment,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [statusFilter, setStatusFilter] = useState<'Semua' | ScheduleStatus>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCycle = ANNUAL_MONTHLY_CYCLES[selectedCycleMonthIndex] || ANNUAL_MONTHLY_CYCLES[0];

  const [form, setForm] = useState<Omit<ScheduleItem, 'id'>>({
    date: `${activeCycle.calendarYear}-${String(activeCycle.calendarMonth).padStart(2, '0')}-15`,
    time: '08:00 - 09:30 WIB',
    targetName: teachers[1]?.name || '',
    targetType: 'Guru',
    supervisionType: 'Akademik',
    programTitle: programs[0]?.title || '',
    supervisorName: supervisors[0]?.name || 'Aryadi, S.Kom',
    location: 'Ruang Kelas VIII A',
    notes: '',
    status: 'Terjadwal',
  });

  const filteredSchedules = useMemo(() => {
    return schedules
      .filter((s) => statusFilter === 'Semua' || s.status === statusFilter)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [schedules, statusFilter]);

  const monthSchedules = useMemo(() => {
    return filteredSchedules.filter((s) => {
      const [y, m] = s.date.split('-').map(Number);
      return y === activeCycle.calendarYear && m === activeCycle.calendarMonth;
    });
  }, [filteredSchedules, activeCycle]);

  const upcomingReminder = useMemo(() => {
    return schedules
      .filter((s) => s.status === 'Terjadwal')
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))[0];
  }, [schedules]);

  // Build calendar grid days for activeCycle
  const calendarGrid = useMemo(() => {
    const year = activeCycle.calendarYear;
    const monthIdx0 = activeCycle.calendarMonth - 1;
    const firstDay = new Date(year, monthIdx0, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, monthIdx0 + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [activeCycle]);

  const openAddModal = (presetDate?: string) => {
    setEditingId(null);
    const defaultDate =
      presetDate ||
      `${activeCycle.calendarYear}-${String(activeCycle.calendarMonth).padStart(2, '0')}-15`;
    setForm({
      date: defaultDate,
      time: '08:00 - 09:30 WIB',
      targetName: teachers[1]?.name || teachers[0]?.name || '',
      targetType: 'Guru',
      supervisionType: 'Akademik',
      programTitle:
        programs.find((p) => p.category === 'Akademik')?.title ||
        'Observasi Pelaksanaan Pembelajaran di Kelas',
      supervisorName: supervisors[0]?.name || 'Aryadi, S.Kom',
      location: 'Ruang Kelas',
      notes: '',
      status: 'Terjadwal',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ScheduleItem) => {
    setEditingId(item.id);
    setForm({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.targetName.trim()) return;
    if (editingId) {
      onSaveSchedules(
        schedules.map((s) => (s.id === editingId ? { ...form, id: editingId } : s))
      );
    } else {
      onSaveSchedules([...schedules, { ...form, id: `sch-${Date.now()}` }]);
    }
    setIsModalOpen(false);
  };

  const handleStatusChange = (id: string, nextStatus: ScheduleStatus) => {
    onSaveSchedules(
      schedules.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
    );
  };

  const handleDelete = (id: string) => {
    onSaveSchedules(schedules.filter((s) => s.id !== id));
  };

  const handleExport = () => {
    exportToExcel(
      filteredSchedules.map((s, idx) => ({
        No: idx + 1,
        Tanggal: s.date,
        Waktu: s.time,
        Sasaran: s.targetName,
        Kategori_Sasaran: s.targetType,
        Jenis_Supervisi: s.supervisionType,
        Program: s.programTitle,
        Supervisor: s.supervisorName,
        Lokasi: s.location,
        Status: s.status,
        Keterangan: s.notes,
      })),
      'Jadwal Supervisi',
      'Jadwal_Supervisi_SMPN8_BatangHari'
    );
  };

  const statusTextStyle = (status: ScheduleStatus) => {
    switch (status) {
      case 'Terlaksana':
        return 'text-emerald-800 bg-emerald-100 border-emerald-300';
      case 'Terjadwal':
        return 'text-teal-800 bg-teal-50 border-teal-200';
      case 'Ditunda':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Dibatalkan':
        return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-gradient-to-b from-emerald-50/80 via-green-50/60 to-lime-50/50 min-h-full">
      {/* Reminder Banner (screen only) */}
      {upcomingReminder && (
        <div className="no-print flex flex-col gap-3 rounded-xl border border-emerald-300 bg-[#ECFDF5] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <div className="text-xs">
              <div className="font-bold text-emerald-950">
                Pengingat Jadwal Terdekat: {upcomingReminder.date} ({upcomingReminder.time})
              </div>
              <div className="text-slate-700">
                {upcomingReminder.targetName} · {upcomingReminder.programTitle} · Lokasi:{' '}
                {upcomingReminder.location}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onStartAssessment(upcomingReminder)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span>Mulai Penilaian</span>
          </button>
        </div>
      )}

      {/* Control Toolbar (screen only) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                viewMode === 'calendar'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Kalender Bulanan</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              <Table2 className="h-3.5 w-3.5" />
              <span>Tabel Jadwal ({filteredSchedules.length})</span>
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'Semua' | ScheduleStatus)
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-emerald-600 focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            {STATUS_LIST.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 text-emerald-700" />
            <span>Ekspor Excel</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 whitespace-nowrap"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-700" />
            <span>Cetak Jadwal</span>
          </button>
          <button
            type="button"
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#BBF7D0] px-3.5 py-1.5 text-xs font-bold text-emerald-950 hover:bg-[#86EFAC] whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Calendar View (screen only when active) */}
      {viewMode === 'calendar' && (
        <div className="no-print space-y-5">
          {/* 12-Month Academic Cycle Strip */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-emerald-950">
                Siklus Tahunan TP {activeYear.tahunPelajaran}:{' '}
                <span className="font-normal text-slate-600">
                  {activeCycle.monthLabel} — {activeCycle.theme}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700">
                Fokus: {activeCycle.focusCategory}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 lg:grid-cols-12">
              {ANNUAL_MONTHLY_CYCLES.map((c) => {
                const count = schedules.filter((s) => {
                  const [y, m] = s.date.split('-').map(Number);
                  return y === c.calendarYear && m === c.calendarMonth;
                }).length;
                const active = c.monthIndex === selectedCycleMonthIndex;
                return (
                  <button
                    key={c.monthIndex}
                    type="button"
                    onClick={() => onChangeCycleMonthIndex(c.monthIndex)}
                    className={`rounded-lg border px-2 py-2 text-center transition-colors ${
                      active
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{c.shortLabel}</div>
                    <div
                      className={`text-[10px] tabular-nums ${
                        active ? 'text-emerald-100' : 'text-slate-500'
                      }`}
                    >
                      {count} agenda
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Monthly Date Grid */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-emerald-950">
                {activeCycle.monthLabel}
              </h3>
              <span className="text-xs text-slate-500">
                Klik tanggal untuk menambah jadwal supervisi baru
              </span>
            </div>

            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 text-xs">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <div
                  key={day}
                  className="bg-[#DCFCE7] py-2 text-center font-semibold text-emerald-950"
                >
                  {day}
                </div>
              ))}

              {calendarGrid.map((dayNum, idx) => {
                if (dayNum === null) {
                  return <div key={`empty-${idx}`} className="min-h-[86px] bg-slate-50" />;
                }
                const dateStr = `${activeCycle.calendarYear}-${String(
                  activeCycle.calendarMonth
                ).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayItems = monthSchedules.filter((s) => s.date === dateStr);
                return (
                  <div
                    key={dateStr}
                    onClick={() => openAddModal(dateStr)}
                    className="min-h-[86px] cursor-pointer bg-white p-1.5 transition-colors hover:bg-emerald-50/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-700 tabular-nums">
                        {dayNum}
                      </span>
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(item);
                          }}
                          className={`rounded border px-1.5 py-1 text-[10px] leading-tight ${statusTextStyle(
                            item.status
                          )}`}
                        >
                          <div className="font-bold truncate">{item.targetName}</div>
                          <div className="truncate opacity-80">{item.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Table (Visible in Table mode AND always visible when printing!) */}
      <div
        className={`${
          viewMode === 'table' ? 'block' : 'hidden print:block'
        } print-container overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs`}
      >
        {/* Official Print Kop Surat (visible only in print) */}
        <div className="hidden print:block border-b-2 border-black pb-3 mb-4">
          <div className="flex items-center justify-between gap-4">
            <img
              src={SCHOOL_ASSETS.logoPemkab}
              alt="Logo Pemkab Batang Hari"
              className="h-16 w-16 object-contain"
            />
            <div className="text-center flex-1">
              <div className="text-xs font-bold uppercase">{SCHOOL_IDENTITY.pemerintah}</div>
              <div className="text-xs font-bold uppercase">{SCHOOL_IDENTITY.dinas}</div>
              <div className="text-base font-extrabold uppercase">{SCHOOL_IDENTITY.namaSekolah}</div>
              <div className="text-[10px]">
                NPSN: {SCHOOL_IDENTITY.npsn} · {SCHOOL_IDENTITY.alamat}
              </div>
            </div>
            <img
              src={SCHOOL_ASSETS.logoSekolah}
              alt="Logo SMPN 8 Batang Hari"
              className="h-16 w-16 object-contain"
            />
          </div>
          <div className="mt-3 text-center">
            <h2 className="text-sm font-bold uppercase underline">
              JADWAL SUPERVISI KEPALA SEKOLAH TAHUN PELAJARAN {activeYear.tahunPelajaran}
            </h2>
            <p className="text-xs">Semester {activeYear.semester}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-200 bg-[#DCFCE7] text-emerald-950 print:bg-slate-200 print:text-black">
                <th className="px-3.5 py-3 font-semibold">Tanggal & Jam</th>
                <th className="px-3.5 py-3 font-semibold">Sasaran (Guru / Unit)</th>
                <th className="px-3.5 py-3 font-semibold">Jenis & Program</th>
                <th className="px-3.5 py-3 font-semibold">Supervisor</th>
                <th className="px-3.5 py-3 font-semibold">Lokasi</th>
                <th className="px-3.5 py-3 font-semibold">Status</th>
                <th className="no-print px-3.5 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchedules.map((item) => (
                <tr key={item.id} className="hover:bg-emerald-50/40 align-top">
                  <td className="px-3.5 py-3 whitespace-nowrap">
                    <div className="font-mono font-semibold text-emerald-950 tabular-nums">
                      {item.date}
                    </div>
                    <div className="text-[11px] text-slate-500">{item.time}</div>
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="font-semibold text-emerald-950">{item.targetName}</div>
                    <div className="text-[11px] text-slate-500">{item.targetType}</div>
                  </td>
                  <td className="px-3.5 py-3 max-w-xs">
                    <div className="font-semibold text-slate-800">
                      {item.supervisionType} · {item.programTitle}
                    </div>
                    {item.notes && (
                      <div className="mt-0.5 text-[11px] text-slate-500">{item.notes}</div>
                    )}
                  </td>
                  <td className="px-3.5 py-3 text-slate-700 whitespace-nowrap">
                    {item.supervisorName}
                  </td>
                  <td className="px-3.5 py-3 text-slate-700">{item.location}</td>
                  <td className="px-3.5 py-3 whitespace-nowrap">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value as ScheduleStatus)
                      }
                      className={`rounded border px-2 py-1 text-[11px] font-semibold focus:outline-none ${statusTextStyle(
                        item.status
                      )}`}
                    >
                      {STATUS_LIST.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="no-print px-3.5 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onStartAssessment(item)}
                      className="mr-1.5 inline-flex items-center gap-1 rounded bg-[#BBF7D0] px-2.5 py-1 text-[11px] font-bold text-emerald-950 hover:bg-[#86EFAC]"
                    >
                      <ClipboardCheck className="h-3 w-3" />
                      <span>Nilai</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      aria-label={`Edit jadwal ${item.targetName}`}
                      className="mr-1 rounded p-1.5 text-emerald-700 hover:bg-emerald-100"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      aria-label={`Hapus jadwal ${item.targetName}`}
                      className="rounded p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Print Signature Block */}
        <div className="hidden print:grid grid-cols-2 gap-8 mt-8 text-xs pt-4">
          <div className="text-center">
            <div>Mengetahui,</div>
            <div>Pengawas Pembina Sekolah</div>
            <div className="h-16" />
            <div className="font-bold underline">{activeYear.pengawasPembina}</div>
            <div>NIP. {activeYear.nipPengawasPembina}</div>
          </div>
          <div className="text-center">
            <div>Bajubang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div>Kepala Sekolah SMPN 8 Batang Hari</div>
            <div className="h-16" />
            <div className="font-bold underline">{activeYear.kepalaSekolah}</div>
            <div>NIP. {activeYear.nipKepalaSekolah}</div>
          </div>
        </div>
      </div>

      {/* Add / Edit Schedule Modal */}
      {isModalOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <h3 className="font-display text-base font-bold text-emerald-950">
                {editingId ? 'Edit Jadwal Supervisi' : 'Tambah Jadwal Supervisi'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Tanggal</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Jam (WIB)
                  </label>
                  <input
                    required
                    type="text"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    placeholder="08:00 - 09:30 WIB"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Jenis Supervisi
                  </label>
                  <select
                    value={form.supervisionType}
                    onChange={(e) => {
                      const nextType = e.target.value as SupervisionCategory;
                      setForm({
                        ...form,
                        supervisionType: nextType,
                        targetType: nextType === 'Akademik' ? 'Guru' : 'Unit Kerja',
                        targetName:
                          nextType === 'Akademik'
                            ? teachers[1]?.name || teachers[0]?.name || ''
                            : `${MANAGERIAL_UNITS[0].label} (${MANAGERIAL_UNITS[0].defaultPIC})`,
                        programTitle:
                          programs.find((p) => p.category === nextType)?.title || '',
                      });
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Akademik">Supervisi Akademik</option>
                    <option value="Manajerial">Supervisi Manajerial</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Status Kegiatan
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as ScheduleStatus })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  >
                    {STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  {form.targetType === 'Guru'
                    ? 'Pilih Guru yang Disupervisi'
                    : 'Pilih Unit Kerja yang Disupervisi'}
                </label>
                {form.targetType === 'Guru' ? (
                  <select
                    value={form.targetName}
                    onChange={(e) => setForm({ ...form, targetName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} — {t.mataPelajaran}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={form.targetName}
                    onChange={(e) => setForm({ ...form, targetName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  >
                    {MANAGERIAL_UNITS.map((u) => {
                      const val = `${u.label} (${u.defaultPIC})`;
                      return (
                        <option key={u.key} value={val}>
                          {val}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Program Supervisi Terkait
                </label>
                <select
                  value={form.programTitle}
                  onChange={(e) =>
                    setForm({ ...form, programTitle: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                >
                  {programs
                    .filter((p) => p.category === form.supervisionType)
                    .map((p) => (
                      <option key={p.id} value={p.title}>
                        {p.code} — {p.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Supervisor
                  </label>
                  <select
                    value={form.supervisorName}
                    onChange={(e) =>
                      setForm({ ...form, supervisorName: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  >
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.jabatan})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Lokasi Kegiatan
                  </label>
                  <input
                    required
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Keterangan / Fokus Pengamatan
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
