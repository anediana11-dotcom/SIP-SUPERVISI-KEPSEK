import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Printer,
  Save,
  Trash2,
} from 'lucide-react';
import {
  ACADEMIC_ASPECTS,
  calculatePredikat,
} from '../data/initialData';
import {
  AcademicAssessment,
  ScheduleItem,
  ScoreValue,
  SupervisorMember,
  Teacher,
} from '../types/supervision';

interface AcademicInstrumentViewProps {
  teachers: Teacher[];
  supervisors: SupervisorMember[];
  assessments: AcademicAssessment[];
  onSaveAssessment: (assessment: AcademicAssessment, scheduleId?: string) => void;
  onDeleteAssessment: (id: string) => void;
  prefillSchedule?: ScheduleItem | null;
  onClearPrefill: () => void;
  onPrintAssessment: (assessmentId: string) => void;
}

const SCORE_OPTIONS: { value: ScoreValue; label: string; short: string }[] = [
  { value: 4, label: '4 = Sangat Baik', short: '4 · Sangat Baik' },
  { value: 3, label: '3 = Baik', short: '3 · Baik' },
  { value: 2, label: '2 = Cukup', short: '2 · Cukup' },
  { value: 1, label: '1 = Perlu Pembinaan', short: '1 · Perlu Pembinaan' },
];

export const AcademicInstrumentView: React.FC<AcademicInstrumentViewProps> = ({
  teachers,
  supervisors,
  assessments,
  onSaveAssessment,
  onDeleteAssessment,
  prefillSchedule,
  onClearPrefill,
  onPrintAssessment,
}) => {
  const defaultScores = (): Record<string, ScoreValue> => {
    const map: Record<string, ScoreValue> = {};
    ACADEMIC_ASPECTS.forEach((a) => {
      map[a.id] = 3;
    });
    return map;
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [linkedScheduleId, setLinkedScheduleId] = useState<string | undefined>(undefined);
  const [teacherId, setTeacherId] = useState<string>(teachers[1]?.id || teachers[0]?.id || '');
  const [kelas, setKelas] = useState<string>('VIII A');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [supervisorName, setSupervisorName] = useState<string>(
    supervisors[0]?.name || 'Aryadi, S.Kom'
  );
  const [scores, setScores] = useState<Record<string, ScoreValue>>(defaultScores);
  const [aspectNotes, setAspectNotes] = useState<Record<string, string>>({});
  const [catatanSupervisor, setCatatanSupervisor] = useState<string>('');
  const [kelebihanGuru, setKelebihanGuru] = useState<string>('');
  const [aspekDitingkatkan, setAspekDitingkatkan] = useState<string>('');
  const [rekomendasiPembinaan, setRekomendasiPembinaan] = useState<string>('');
  const [rencanaTindakLanjut, setRencanaTindakLanjut] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (prefillSchedule && prefillSchedule.supervisionType === 'Akademik') {
      const matchedTeacher = teachers.find(
        (t) =>
          t.name.toLowerCase() === prefillSchedule.targetName.toLowerCase() ||
          prefillSchedule.targetName.toLowerCase().includes(t.name.toLowerCase())
      );
      if (matchedTeacher) {
        setTeacherId(matchedTeacher.id);
      }
      setLinkedScheduleId(prefillSchedule.id);
      setDate(prefillSchedule.date);
      setSupervisorName(prefillSchedule.supervisorName);
      setCatatanSupervisor(prefillSchedule.notes || '');
      setEditingId(null);
      onClearPrefill();
    }
  }, [prefillSchedule, teachers, onClearPrefill]);

  const selectedTeacher = useMemo(
    () => teachers.find((t) => t.id === teacherId) || teachers[0],
    [teachers, teacherId]
  );

  const calculation = useMemo(() => {
    const totalScore = ACADEMIC_ASPECTS.reduce(
      (acc, asp) => acc + (scores[asp.id] || 0),
      0
    );
    const maxScore = ACADEMIC_ASPECTS.length * 4;
    const percentage = Number(((totalScore / maxScore) * 100).toFixed(1));
    const predikat = calculatePredikat(percentage);
    return { totalScore, maxScore, percentage, predikat };
  }, [scores]);

  const handleLoadAssessment = (a: AcademicAssessment) => {
    setEditingId(a.id);
    setLinkedScheduleId(a.scheduleId);
    setTeacherId(a.teacherId);
    setKelas(a.kelas);
    setDate(a.date);
    setSupervisorName(a.supervisorName);
    setScores({ ...a.scores });
    setAspectNotes({ ...a.aspectNotes });
    setCatatanSupervisor(a.catatanSupervisor);
    setKelebihanGuru(a.kelebihanGuru);
    setAspekDitingkatkan(a.aspekDitingkatkan);
    setRekomendasiPembinaan(a.rekomendasiPembinaan);
    setRencanaTindakLanjut(a.rencanaTindakLanjut);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setEditingId(null);
    setLinkedScheduleId(undefined);
    setScores(defaultScores());
    setAspectNotes({});
    setCatatanSupervisor('');
    setKelebihanGuru('');
    setAspekDitingkatkan('');
    setRekomendasiPembinaan('');
    setRencanaTindakLanjut('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    const payload: AcademicAssessment = {
      id: editingId || `ass-ak-${Date.now()}`,
      scheduleId: linkedScheduleId,
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      teacherNip: selectedTeacher.nip,
      mataPelajaran: selectedTeacher.mataPelajaran,
      kelas,
      date,
      supervisorName,
      scores,
      aspectNotes,
      catatanSupervisor,
      kelebihanGuru,
      aspekDitingkatkan,
      rekomendasiPembinaan,
      rencanaTindakLanjut,
      totalScore: calculation.totalScore,
      percentage: calculation.percentage,
      predikat: calculation.predikat,
      createdAt: new Date().toISOString(),
    };

    onSaveAssessment(payload, linkedScheduleId);
    setSavedNotice(
      `Penilaian supervisi akademik untuk ${selectedTeacher.name} berhasil disimpan (${calculation.percentage}% · ${calculation.predikat}).`
    );
    setTimeout(() => setSavedNotice(null), 5000);
    handleResetForm();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gradient-to-b from-emerald-50/80 via-green-50/60 to-lime-50/50 min-h-full">
      {savedNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Assessment Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Identity & Auto-Score Summary Header */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-emerald-950">
                {editingId
                  ? 'Edit Instrumen Supervisi Akademik'
                  : 'Formulir Penilaian Supervisi Akademik (10 Aspek Baku)'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Buat Baru
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Nama Guru yang Disupervisi
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-medium text-emerald-950 focus:border-emerald-600 focus:outline-none"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.mataPelajaran})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  NIP & Mata Pelajaran
                </label>
                <input
                  readOnly
                  type="text"
                  value={
                    selectedTeacher
                      ? `${selectedTeacher.nip} · ${selectedTeacher.mataPelajaran}`
                      : ''
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-slate-700"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Kelas / Rombel
                </label>
                <input
                  required
                  type="text"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  placeholder="Contoh: VIII A"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Tanggal Pelaksanaan
                </label>
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block font-semibold text-slate-700">
                  Nama Supervisor
                </label>
                <select
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                >
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} — {s.jabatan}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Live Calculation Card */}
          <div className="rounded-xl border border-emerald-300 bg-gradient-to-br from-[#DCFCE7] via-[#BBF7D0] to-[#ECFDF5] p-5 text-emerald-950 shadow-xs lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-800">
                Kalkulasi Otomatis Nilai Akhir
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-4xl font-extrabold text-emerald-950 tabular-nums">
                  {calculation.percentage}%
                </span>
                <span className="font-mono text-sm text-emerald-800 tabular-nums">
                  ({calculation.totalScore} / {calculation.maxScore})
                </span>
              </div>
              <div className="mt-2 text-sm font-bold text-emerald-900">
                Predikat: {calculation.predikat}
              </div>
            </div>

            <div className="mt-5 border-t border-emerald-400/40 pt-3 text-[11px] text-emerald-900 space-y-1">
              <div>4 = Sangat Baik · 3 = Baik</div>
              <div>2 = Cukup · 1 = Perlu Pembinaan</div>
              <div className="pt-1 text-emerald-800 font-medium">
                Rentang: 86–100% Sangat Baik · 71–85% Baik · 56–70% Cukup
              </div>
            </div>
          </div>
        </div>

        {/* 10 Aspects Scoring Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-emerald-200 bg-[#DCFCE7] text-emerald-950">
                  <th className="px-4 py-3 font-semibold w-12">No</th>
                  <th className="px-4 py-3 font-semibold">Aspek Penilaian Pembelajaran</th>
                  <th className="px-4 py-3 font-semibold">Skor Penilaian (1–4)</th>
                  <th className="px-4 py-3 font-semibold w-64">Catatan Aspek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ACADEMIC_ASPECTS.map((aspect) => {
                  const val = scores[aspect.id] || 3;
                  return (
                    <tr key={aspect.id} className="hover:bg-emerald-50/40 align-top">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-950 tabular-nums">
                        {aspect.number}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-emerald-950">
                          {aspect.title}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          {aspect.description}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {SCORE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                setScores({ ...scores, [aspect.id]: opt.value })
                              }
                              className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                                val === opt.value
                                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-emerald-50'
                              }`}
                            >
                              {opt.short}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={aspectNotes[aspect.id] || ''}
                          onChange={(e) =>
                            setAspectNotes({
                              ...aspectNotes,
                              [aspect.id]: e.target.value,
                            })
                          }
                          placeholder="Catatan pengamatan..."
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs focus:border-emerald-600 focus:bg-white focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Qualitative Feedback & Tindak Lanjut */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs">
          <h3 className="font-display text-sm font-bold text-emerald-950 border-b border-slate-100 pb-2">
            Catatan Kualitatif, Rekomendasi & Rencana Tindak Lanjut (RTL)
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">
                Catatan Supervisor
              </label>
              <textarea
                rows={3}
                required
                value={catatanSupervisor}
                onChange={(e) => setCatatanSupervisor(e.target.value)}
                placeholder="Ringkasan temuan selama proses supervisi pembelajaran..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">
                Kelebihan Guru
              </label>
              <textarea
                rows={3}
                required
                value={kelebihanGuru}
                onChange={(e) => setKelebihanGuru(e.target.value)}
                placeholder="Praktik baik dan kekuatan utama yang ditunjukkan guru..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">
                Aspek yang Perlu Ditingkatkan
              </label>
              <textarea
                rows={3}
                required
                value={aspekDitingkatkan}
                onChange={(e) => setAspekDitingkatkan(e.target.value)}
                placeholder="Hal-hal yang memerlukan perbaikan atau penguatan..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">
                Rekomendasi Pembinaan
              </label>
              <textarea
                rows={3}
                required
                value={rekomendasiPembinaan}
                onChange={(e) => setRekomendasiPembinaan(e.target.value)}
                placeholder="Saran pembinaan teknis, coaching, atau workshop MGMP..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block font-semibold text-slate-700">
                Rencana Tindak Lanjut (RTL)
              </label>
              <textarea
                rows={2}
                required
                value={rencanaTindakLanjut}
                onChange={(e) => setRencanaTindakLanjut(e.target.value)}
                placeholder="Langkah konkret dan target waktu pendampingan lanjutan..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleResetForm}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Hasil Supervisi Akademik</span>
            </button>
          </div>
        </div>
      </form>

      {/* Saved Academic Assessments Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-emerald-950">
              Riwayat Penilaian Supervisi Akademik ({assessments.length})
            </h3>
            <p className="text-xs text-slate-500">
              Pilih penilaian untuk mengedit kembali atau mencetak lembar hasil resmi A4
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-200 bg-[#DCFCE7] text-emerald-950">
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Nama Guru</th>
                <th className="px-4 py-3 font-semibold">Mapel / Kelas</th>
                <th className="px-4 py-3 font-semibold">Supervisor</th>
                <th className="px-4 py-3 font-semibold">Skor & Nilai</th>
                <th className="px-4 py-3 font-semibold">Predikat</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assessments.map((a) => (
                <tr key={a.id} className="hover:bg-emerald-50/40">
                  <td className="px-4 py-2.5 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                    {a.date}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-emerald-950">
                    {a.teacherName}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {a.mataPelajaran} · {a.kelas}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{a.supervisorName}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-emerald-800 tabular-nums">
                    {a.totalScore}/40 ({a.percentage}%)
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">
                    {a.predikat}
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleLoadAssessment(a)}
                      className="mr-1.5 inline-flex items-center gap-1 rounded border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Muat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPrintAssessment(a.id)}
                      className="mr-1.5 inline-flex items-center gap-1 rounded bg-[#BBF7D0] px-2.5 py-1 text-[11px] font-bold text-emerald-950 hover:bg-[#86EFAC]"
                    >
                      <Printer className="h-3 w-3" />
                      <span>Cetak A4</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAssessment(a.id)}
                      aria-label={`Hapus penilaian ${a.teacherName}`}
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
      </div>
    </div>
  );
};
