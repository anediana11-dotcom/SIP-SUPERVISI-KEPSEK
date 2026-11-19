import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileCheck2,
  MapPin,
  Printer,
  ThumbsUp,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  ACADEMIC_ASPECTS,
  ANNUAL_MONTHLY_CYCLES,
  SCHOOL_ASSETS,
  SCHOOL_IDENTITY,
} from '../data/initialData';
import {
  AcademicAssessment,
  AcademicYearConfig,
  ActiveView,
  FinalEvaluationNote,
  ManagerialAssessment,
  PredikatType,
  ScheduleItem,
  SupervisionProgram,
  Teacher,
} from '../types/supervision';

interface DashboardViewProps {
  activeYear: AcademicYearConfig;
  teachers: Teacher[];
  programs: SupervisionProgram[];
  schedules: ScheduleItem[];
  academicAssessments: AcademicAssessment[];
  managerialAssessments: ManagerialAssessment[];
  finalEvaluation: FinalEvaluationNote;
  onNavigate: (view: ActiveView) => void;
  onStartAssessmentFromSchedule: (schedule: ScheduleItem) => void;
  onSelectCycleMonth: (monthIndex: number) => void;
  onOpenFinalEvaluationReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeYear,
  teachers,
  programs,
  schedules,
  academicAssessments,
  managerialAssessments,
  finalEvaluation,
  onNavigate,
  onStartAssessmentFromSchedule,
  onSelectCycleMonth,
  onOpenFinalEvaluationReport,
}) => {
  const stats = useMemo(() => {
    const totalTeachers = teachers.length;
    const totalPrograms = programs.length;
    const academicPrograms = programs.filter((p) => p.category === 'Akademik').length;
    const managerialPrograms = programs.filter((p) => p.category === 'Manajerial').length;

    const completedSchedules = schedules.filter((s) => s.status === 'Terlaksana').length;
    const pendingSchedules = schedules.filter(
      (s) => s.status === 'Terjadwal' || s.status === 'Ditunda'
    ).length;

    const totalReports = academicAssessments.length + managerialAssessments.length;

    const realizedPrograms = programs.filter((p) => p.realized).length;
    const programPct = totalPrograms > 0 ? Math.round((realizedPrograms / totalPrograms) * 100) : 0;

    return {
      totalTeachers,
      totalPrograms,
      academicPrograms,
      managerialPrograms,
      completedSchedules,
      pendingSchedules,
      totalReports,
      realizedPrograms,
      programPct,
    };
  }, [teachers, programs, schedules, academicAssessments, managerialAssessments]);

  const predikatDistribution = useMemo(() => {
    const counts: Record<PredikatType, number> = {
      'Sangat Baik': 0,
      Baik: 0,
      Cukup: 0,
      'Perlu Pembinaan': 0,
    };
    academicAssessments.forEach((a) => {
      counts[a.predikat] = (counts[a.predikat] || 0) + 1;
    });
    const total = academicAssessments.length || 1;
    return [
      { label: 'Sangat Baik (86–100%)', key: 'Sangat Baik' as PredikatType, count: counts['Sangat Baik'], pct: Math.round((counts['Sangat Baik'] / total) * 100), barClass: 'bg-emerald-600' },
      { label: 'Baik (71–85%)', key: 'Baik' as PredikatType, count: counts['Baik'], pct: Math.round((counts['Baik'] / total) * 100), barClass: 'bg-green-400' },
      { label: 'Cukup (56–70%)', key: 'Cukup' as PredikatType, count: counts['Cukup'], pct: Math.round((counts['Cukup'] / total) * 100), barClass: 'bg-amber-400' },
      { label: 'Perlu Pembinaan (<56%)', key: 'Perlu Pembinaan' as PredikatType, count: counts['Perlu Pembinaan'], pct: Math.round((counts['Perlu Pembinaan'] / total) * 100), barClass: 'bg-red-500' },
    ];
  }, [academicAssessments]);

  const aspectAverages = useMemo(() => {
    return ACADEMIC_ASPECTS.map((aspect) => {
      if (academicAssessments.length === 0) {
        return { ...aspect, avg: 0, pct: 0 };
      }
      const sum = academicAssessments.reduce(
        (acc, item) => acc + (item.scores[aspect.id] || 0),
        0
      );
      const avg = sum / academicAssessments.length;
      const pct = Math.round((avg / 4) * 100);
      return { ...aspect, avg: Number(avg.toFixed(2)), pct };
    });
  }, [academicAssessments]);

  const upcomingSchedules = useMemo(() => {
    return schedules
      .filter((s) => s.status === 'Terjadwal' || s.status === 'Ditunda')
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [schedules]);

  const cycleCounts = useMemo(() => {
    return ANNUAL_MONTHLY_CYCLES.map((cycle) => {
      const count = schedules.filter((s) => {
        const [y, m] = s.date.split('-').map(Number);
        return y === cycle.calendarYear && m === cycle.calendarMonth;
      }).length;
      return { ...cycle, count };
    });
  }, [schedules]);

  const finalEvaluationSummary = useMemo(() => {
    const academicAvg =
      academicAssessments.length > 0
        ? Number(
            (
              academicAssessments.reduce((acc, a) => acc + a.percentage, 0) /
              academicAssessments.length
            ).toFixed(1)
          )
        : 0;
    const managerialAvg =
      managerialAssessments.length > 0
        ? Number(
            (
              managerialAssessments.reduce((acc, m) => acc + m.percentage, 0) /
              managerialAssessments.length
            ).toFixed(1)
          )
        : 0;
    const overallAvg =
      academicAssessments.length + managerialAssessments.length > 0
        ? Number(
            (
              (academicAssessments.reduce((acc, a) => acc + a.percentage, 0) +
                managerialAssessments.reduce((acc, m) => acc + m.percentage, 0)) /
              (academicAssessments.length + managerialAssessments.length)
            ).toFixed(1)
          )
        : 0;

    const sortedAspects = [...aspectAverages].sort((a, b) => b.pct - a.pct);
    const topAspects = sortedAspects.slice(0, 3);
    const bottomAspects = [...aspectAverages]
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 3);

    const strengthsList = [
      ...academicAssessments
        .map((a) => ({ source: a.teacherName, text: a.kelebihanGuru }))
        .filter((item) => item.text.trim() !== ''),
      ...managerialAssessments
        .map((m) => ({ source: m.unitLabel, text: m.analisisKekuatan }))
        .filter((item) => item.text.trim() !== ''),
    ].slice(0, 4);

    const weaknessesList = [
      ...academicAssessments
        .map((a) => ({ source: a.teacherName, text: a.aspekDitingkatkan }))
        .filter((item) => item.text.trim() !== ''),
      ...managerialAssessments
        .map((m) => ({ source: m.unitLabel, text: m.catatanPembenahan }))
        .filter((item) => item.text.trim() !== ''),
    ].slice(0, 4);

    return {
      academicAvg,
      managerialAvg,
      overallAvg,
      topAspects,
      bottomAspects,
      strengthsList,
      weaknessesList,
    };
  }, [academicAssessments, managerialAssessments, aspectAverages]);

  return (
    <div className="min-h-full bg-gradient-to-br from-emerald-50 via-green-50/85 to-lime-50/75 p-4 sm:p-6 space-y-6">
      {/* Hero Banner: School Identity + Uploaded Background Photo + Logos + Kepala Sekolah */}
      <section className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-800 text-white shadow-sm">
        {/* Background School Photo */}
        <img
          src={SCHOOL_ASSETS.bgSekolah}
          alt="Keluarga Besar SMP Negeri 8 Batang Hari"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-35"
        />
        {/* Measured Contrast Scrim (Fresh Emerald Green) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#064E3B]/92 via-[#047857]/85 to-[#10B981]/78"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-green-300 via-emerald-300 to-lime-300"
        />

        <div className="relative z-10 grid grid-cols-1 gap-6 p-6 lg:grid-cols-12 lg:items-center lg:p-7">
          {/* Left Column: Logos & School Identity */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2.5 rounded-xl bg-white/95 px-3 py-2 shadow-xs">
                <img
                  src={SCHOOL_ASSETS.logoPemkab}
                  alt="Logo Kabupaten Batang Hari"
                  referrerPolicy="no-referrer"
                  className="h-11 w-11 object-contain"
                />
                <img
                  src={SCHOOL_ASSETS.logoSekolah}
                  alt="Logo SMP Negeri 8 Batang Hari"
                  referrerPolicy="no-referrer"
                  className="h-11 w-11 object-contain"
                />
              </div>
              <div className="text-xs text-emerald-100 space-y-0.5">
                <div className="font-semibold tracking-wide text-green-200">
                  {SCHOOL_IDENTITY.pemerintah} · {SCHOOL_IDENTITY.dinas}
                </div>
                <div className="text-emerald-50/90">
                  NPSN {SCHOOL_IDENTITY.npsn} · Tahun Pelajaran {activeYear.tahunPelajaran} · Semester {activeYear.semester}
                </div>
              </div>
            </div>

            <div className="space-y-2 max-w-3xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl text-balance">
                {SCHOOL_IDENTITY.appName} — {SCHOOL_IDENTITY.namaSekolah}
              </h2>
              <p className="text-sm leading-relaxed text-emerald-50/90">
                {SCHOOL_IDENTITY.alamat}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('academic-instrument')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#BBF7D0] px-4 py-2 text-xs font-bold text-emerald-950 transition-colors hover:bg-[#86EFAC] whitespace-nowrap shrink-0"
              >
                <span>Mulai Supervisi Akademik</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('schedule')}
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/25 whitespace-nowrap shrink-0"
              >
                <span>Kelola Jadwal Tahunan</span>
              </button>
            </div>
          </div>

          {/* Right Column: Kepala Sekolah Profile */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-4 rounded-xl border border-emerald-300/40 bg-[#064E3B]/75 p-4 backdrop-blur-sm">
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg border-2 border-green-300 bg-emerald-950">
                <img
                  src={SCHOOL_ASSETS.fotoKepsek}
                  alt="Kepala Sekolah Aryadi, S.Kom"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="text-xs font-semibold text-green-300">
                  Kepala Sekolah
                </div>
                <div className="font-display text-base font-bold text-white truncate">
                  {activeYear.kepalaSekolah}
                </div>
                <div className="font-mono text-xs text-emerald-100/90 tabular-nums">
                  NIP. {activeYear.nipKepalaSekolah}
                </div>
                <div className="pt-1 text-[11px] text-emerald-200/85 truncate">
                  Pengawas: {activeYear.pengawasPembina}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 KPI Stat Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Guru Disupervisi</span>
            <Users className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-emerald-950 tabular-nums">
            {stats.totalTeachers} <span className="text-sm font-medium text-slate-500">Orang</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">100% terdata di master</div>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Program Supervisi</span>
            <ClipboardList className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-emerald-950 tabular-nums">
            {stats.totalPrograms} <span className="text-sm font-medium text-slate-500">Program</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {stats.academicPrograms} Akademik · {stats.managerialPrograms} Manajerial
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Sudah Terlaksana</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-emerald-700 tabular-nums">
            {stats.completedSchedules} <span className="text-sm font-medium text-slate-500">Sesi</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">Jadwal berstatus terlaksana</div>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Belum / Terjadwal</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-amber-700 tabular-nums">
            {stats.pendingSchedules} <span className="text-sm font-medium text-slate-500">Agenda</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">Menunggu pelaksanaan</div>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Laporan Selesai</span>
            <FileCheck2 className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-emerald-950 tabular-nums">
            {stats.totalReports} <span className="text-sm font-medium text-slate-500">Dokumen</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {academicAssessments.length} Akademik · {managerialAssessments.length} Manajerial
          </div>
        </div>

        <div className="rounded-xl border border-emerald-300 bg-gradient-to-br from-[#DCFCE7] via-[#BBF7D0] to-[#D9F99D] p-4 text-emerald-950 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
            <span>Ketercapaian Program</span>
            <TrendingUp className="h-4 w-4 text-emerald-800" />
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold text-emerald-950 tabular-nums">
            {stats.programPct}%
          </div>
          <div className="mt-1 text-xs text-emerald-900/85 tabular-nums">
            {stats.realizedPrograms} dari {stats.totalPrograms} program tercapai
          </div>
        </div>
      </section>

      {/* Analytics Row: Grafik Hasil Supervisi & Rata-Rata 10 Aspek */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Distribution of Supervision Grades */}
        <div className="rounded-xl border border-emerald-200/80 bg-white p-5 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-emerald-950">
                Grafik Distribusi Hasil Supervisi Guru
              </h3>
              <p className="text-xs text-slate-500">
                Rekap predikat dari {academicAssessments.length} penilaian akademik tersimpan
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-950 whitespace-nowrap"
            >
              Lihat Rekap
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {predikatDistribution.map((row) => (
              <div key={row.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{row.label}</span>
                  <span className="font-mono font-semibold text-emerald-950 tabular-nums">
                    {row.count} guru · {row.pct}%
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-50">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${row.barClass}`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-emerald-100 pt-4 flex items-center justify-between text-xs text-slate-600">
            <span>Rata-rata Nilai Akademik Sekolah</span>
            <span className="font-mono text-sm font-bold text-emerald-950 tabular-nums">
              {academicAssessments.length > 0
                ? (
                    academicAssessments.reduce((acc, a) => acc + a.percentage, 0) /
                    academicAssessments.length
                  ).toFixed(1)
                : '0.0'}
              %
            </span>
          </div>
        </div>

        {/* 10 Aspects Average Score Chart */}
        <div className="rounded-xl border border-emerald-200/80 bg-white p-5 shadow-xs lg:col-span-7">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-emerald-950">
                Capaian Rata-Rata 10 Aspek Pembelajaran
              </h3>
              <p className="text-xs text-slate-500">
                Skala penilaian 1,00 s.d. 4,00 berdasarkan observasi kelas
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('academic-instrument')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-950 whitespace-nowrap"
            >
              Isi Instrumen
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {aspectAverages.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-medium text-slate-700" title={item.title}>
                    {item.number}. {item.title}
                  </span>
                  <span className="shrink-0 font-mono font-semibold text-emerald-950 tabular-nums">
                    {item.avg.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-green-400"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluasi Akhir Supervisi: Kelebihan, Kekurangan & Grafik Persentase */}
      <section className="rounded-xl border border-emerald-200 bg-white p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3.5">
          <div>
            <h3 className="font-display text-base font-bold text-emerald-950">
              Evaluasi Akhir Supervisi: Kelebihan, Kekurangan & Grafik Persentase
            </h3>
            <p className="text-xs text-slate-500">
              Sintesis capaian supervisi akademik dan manajerial Tahun Pelajaran {activeYear.tahunPelajaran}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenFinalEvaluationReport}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Lihat & Cetak Evaluasi Akhir A4</span>
          </button>
        </div>

        {/* Grafik Persentase Capaian Akhir */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Ringkasan Persentase Pilar Supervisi */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950">
                Grafik Persentase Capaian Akhir
              </span>
              <span className="font-mono text-sm font-extrabold text-emerald-950 tabular-nums">
                Rata-rata: {finalEvaluationSummary.overallAvg}%
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: 'Supervisi Akademik (Guru)',
                  pct: finalEvaluationSummary.academicAvg,
                  detail: `${academicAssessments.length} penilaian`,
                  barClass: 'bg-emerald-600',
                },
                {
                  label: 'Supervisi Manajerial (Unit Kerja)',
                  pct: finalEvaluationSummary.managerialAvg,
                  detail: `${managerialAssessments.length} penilaian`,
                  barClass: 'bg-green-500',
                },
                {
                  label: 'Realisasi Program Kerja Supervisi',
                  pct: stats.programPct,
                  detail: `${stats.realizedPrograms}/${stats.totalPrograms} program`,
                  barClass: 'bg-lime-500',
                },
              ].map((row) => (
                <div key={row.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{row.label}</span>
                    <span className="font-mono font-bold text-emerald-950 tabular-nums">
                      {row.pct}% <span className="font-normal text-slate-500">({row.detail})</span>
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-white border border-emerald-200">
                    <div
                      className={`h-full rounded-full ${row.barClass}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Top vs Bottom Aspect Percentages */}
            <div className="border-t border-emerald-200 pt-3 grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <div className="font-bold text-emerald-800 mb-1.5">
                  Aspek Tertinggi (%)
                </div>
                <div className="space-y-1">
                  {finalEvaluationSummary.topAspects.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-1">
                      <span className="truncate text-slate-700">{a.title}</span>
                      <span className="font-mono font-bold text-emerald-700 tabular-nums shrink-0">
                        {a.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-bold text-amber-700 mb-1.5">
                  Perlu Penguatan (%)
                </div>
                <div className="space-y-1">
                  {finalEvaluationSummary.bottomAspects.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-1">
                      <span className="truncate text-slate-700">{a.title}</span>
                      <span className="font-mono font-bold text-amber-700 tabular-nums shrink-0">
                        {a.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Kelebihan & Kekurangan Supervisi */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {/* Kelebihan */}
            <div className="rounded-xl border border-emerald-200 bg-[#ECFDF5] p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <ThumbsUp className="h-4 w-4 shrink-0 text-emerald-700" />
                <span>Kelebihan Hasil Supervisi</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                {finalEvaluation.kelebihanUmum}
              </p>
              {finalEvaluationSummary.strengthsList.length > 0 && (
                <div className="border-t border-emerald-200/80 pt-2.5 space-y-1.5">
                  <div className="text-[11px] font-semibold text-emerald-900">
                    Temuan Lapangan Terkini:
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-700">
                    {finalEvaluationSummary.strengthsList.map((s, idx) => (
                      <li key={idx} className="leading-snug">
                        <strong className="text-emerald-950">{s.source}:</strong> {s.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Kekurangan */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
                <span>Kekurangan & Aspek Perlu Ditingkatkan</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                {finalEvaluation.kekuranganUmum}
              </p>
              {finalEvaluationSummary.weaknessesList.length > 0 && (
                <div className="border-t border-amber-200/70 pt-2.5 space-y-1.5">
                  <div className="text-[11px] font-semibold text-amber-900">
                    Catatan Perbaikan Terkini:
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-700">
                    {finalEvaluationSummary.weaknessesList.map((w, idx) => (
                      <li key={idx} className="leading-snug">
                        <strong className="text-emerald-950">{w.source}:</strong> {w.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Row: Kalender Siklus 1 Tahun Pelajaran + Notifikasi Jadwal Terdekat */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kalender Kegiatan Supervisi 12 Bulan */}
        <div className="rounded-xl border border-emerald-200/80 bg-white p-5 shadow-xs lg:col-span-7">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-emerald-950">
                Kalender Siklus Supervisi Tahun Pelajaran {activeYear.tahunPelajaran}
              </h3>
              <p className="text-xs text-slate-500">
                Klik bulan untuk membuka jadwal kegiatan pada periode tersebut
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('schedule')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-950 whitespace-nowrap"
            >
              Kalender Penuh
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
            {cycleCounts.map((cycle) => (
              <button
                key={cycle.monthIndex}
                type="button"
                onClick={() => onSelectCycleMonth(cycle.monthIndex)}
                className="group flex flex-col justify-between rounded-lg border border-emerald-200/80 bg-emerald-50/45 p-3 text-left transition-colors hover:border-emerald-600 hover:bg-emerald-100/70"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-xs font-bold text-emerald-950">
                    {cycle.monthLabel}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-emerald-700 tabular-nums">
                    {cycle.count} agenda
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-slate-600">
                  {cycle.theme}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Notifikasi Jadwal Supervisi Terdekat */}
        <div className="rounded-xl border border-emerald-200/80 bg-white p-5 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-emerald-950">
                Notifikasi Jadwal Supervisi Terdekat
              </h3>
              <p className="text-xs text-slate-500">
                Agenda aktif yang siap dilaksanakan atau dinilai
              </p>
            </div>
            <Calendar className="h-4 w-4 text-emerald-700" />
          </div>

          {upcomingSchedules.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Semua jadwal supervisi telah terlaksana. Tambahkan jadwal baru melalui menu Jadwal Supervisi.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-emerald-100">
              {upcomingSchedules.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="font-semibold text-sm text-emerald-950 truncate">
                      {item.targetName}
                    </div>
                    <div className="text-xs text-slate-600 truncate">
                      {item.supervisionType} · {item.programTitle}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span className="font-mono tabular-nums">
                        {item.date} · {item.time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {item.location}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartAssessmentFromSchedule(item)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#BBF7D0] px-3 py-1.5 text-xs font-bold text-emerald-950 transition-colors hover:bg-[#86EFAC] whitespace-nowrap shrink-0"
                  >
                    <span>Mulai Penilaian</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
