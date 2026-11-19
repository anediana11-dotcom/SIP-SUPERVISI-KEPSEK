import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileText, Printer, Save, Trash2 } from 'lucide-react';
import {
  calculatePredikat,
  MANAGERIAL_UNITS,
} from '../data/initialData';
import {
  ManagerialAssessment,
  ScheduleItem,
  ScoreValue,
  SupervisorMember,
} from '../types/supervision';

interface ManagerialInstrumentViewProps {
  supervisors: SupervisorMember[];
  assessments: ManagerialAssessment[];
  onSaveAssessment: (assessment: ManagerialAssessment, scheduleId?: string) => void;
  onDeleteAssessment: (id: string) => void;
  prefillSchedule?: ScheduleItem | null;
  onClearPrefill: () => void;
  onPrintAssessment: (assessmentId: string) => void;
}

const SCORE_OPTIONS: { value: ScoreValue; short: string }[] = [
  { value: 4, short: '4 · Sangat Baik' },
  { value: 3, short: '3 · Baik' },
  { value: 2, short: '2 · Cukup' },
  { value: 1, short: '1 · Perlu Pembinaan' },
];

export const ManagerialInstrumentView: React.FC<ManagerialInstrumentViewProps> = ({
  supervisors,
  assessments,
  onSaveAssessment,
  onDeleteAssessment,
  prefillSchedule,
  onClearPrefill,
  onPrintAssessment,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [linkedScheduleId, setLinkedScheduleId] = useState<string | undefined>(undefined);
  const [unitKey, setUnitKey] = useState<string>(MANAGERIAL_UNITS[0].key);

  const selectedUnit = useMemo(
    () => MANAGERIAL_UNITS.find((u) => u.key === unitKey) || MANAGERIAL_UNITS[0],
    [unitKey]
  );

  const buildDefaultScores = (key: string): Record<string, ScoreValue> => {
    const unit = MANAGERIAL_UNITS.find((u) => u.key === key) || MANAGERIAL_UNITS[0];
    const map: Record<string, ScoreValue> = {};
    unit.indicators.forEach((ind) => {
      map[ind.id] = 3;
    });
    return map;
  };

  const [penanggungJawab, setPenanggungJawab] = useState<string>(selectedUnit.defaultPIC);
  const [nipPenanggungJawab, setNipPenanggungJawab] = useState<string>(selectedUnit.defaultNIP);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [supervisorName, setSupervisorName] = useState<string>(
    supervisors[0]?.name || 'Aryadi, S.Kom'
  );
  const [scores, setScores] = useState<Record<string, ScoreValue>>(() =>
    buildDefaultScores(MANAGERIAL_UNITS[0].key)
  );
  const [indicatorNotes, setIndicatorNotes] = useState<Record<string, string>>({});
  const [analisisKekuatan, setAnalisisKekuatan] = useState<string>('');
  const [catatanPembenahan, setCatatanPembenahan] = useState<string>('');
  const [tindakLanjut, setTindakLanjut] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSelectUnit = (nextKey: string) => {
    const unit = MANAGERIAL_UNITS.find((u) => u.key === nextKey) || MANAGERIAL_UNITS[0];
    setUnitKey(nextKey);
    setPenanggungJawab(unit.defaultPIC);
    setNipPenanggungJawab(unit.defaultNIP);
    setScores(buildDefaultScores(nextKey));
    setIndicatorNotes({});
  };

  useEffect(() => {
    if (prefillSchedule && prefillSchedule.supervisionType === 'Manajerial') {
      const targetLower = prefillSchedule.targetName.toLowerCase();
      const matchedUnit =
        MANAGERIAL_UNITS.find(
          (u) =>
            targetLower.includes(u.key) ||
            targetLower.includes(u.defaultPIC.toLowerCase()) ||
            targetLower.includes(u.label.toLowerCase())
        ) || MANAGERIAL_UNITS[0];
      handleSelectUnit(matchedUnit.key);
      setLinkedScheduleId(prefillSchedule.id);
      setDate(prefillSchedule.date);
      setSupervisorName(prefillSchedule.supervisorName);
      setCatatanPembenahan(prefillSchedule.notes || '');
      setEditingId(null);
      onClearPrefill();
    }
  }, [prefillSchedule, onClearPrefill]);

  const calculation = useMemo(() => {
    const totalScore = selectedUnit.indicators.reduce(
      (acc, ind) => acc + (scores[ind.id] || 0),
      0
    );
    const maxScore = selectedUnit.indicators.length * 4;
    const percentage = Number(((totalScore / maxScore) * 100).toFixed(1));
    const predikat = calculatePredikat(percentage);
    return { totalScore, maxScore, percentage, predikat };
  }, [selectedUnit, scores]);

  const handleLoadAssessment = (a: ManagerialAssessment) => {
    setEditingId(a.id);
    setLinkedScheduleId(a.scheduleId);
    setUnitKey(a.unitKey);
    setPenanggungJawab(a.penanggungJawab);
    setNipPenanggungJawab(a.nipPenanggungJawab);
    setDate(a.date);
    setSupervisorName(a.supervisorName);
    setScores({ ...a.scores });
    setIndicatorNotes({ ...a.indicatorNotes });
    setAnalisisKekuatan(a.analisisKekuatan);
    setCatatanPembenahan(a.catatanPembenahan);
    setTindakLanjut(a.tindakLanjut);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setEditingId(null);
    setLinkedScheduleId(undefined);
    setScores(buildDefaultScores(unitKey));
    setIndicatorNotes({});
    setAnalisisKekuatan('');
    setCatatanPembenahan('');
    setTindakLanjut('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ManagerialAssessment = {
      id: editingId || `ass-mj-${Date.now()}`,
      scheduleId: linkedScheduleId,
      unitKey: selectedUnit.key,
      unitLabel: selectedUnit.label,
      penanggungJawab,
      nipPenanggungJawab,
      date,
      supervisorName,
      scores,
      indicatorNotes,
      analisisKekuatan,
      catatanPembenahan,
      tindakLanjut,
      totalScore: calculation.totalScore,
      percentage: calculation.percentage,
      predikat: calculation.predikat,
      createdAt: new Date().toISOString(),
    };

    onSaveAssessment(payload, linkedScheduleId);
    setSavedNotice(
      `Penilaian supervisi manajerial ${selectedUnit.label} berhasil disimpan (${calculation.percentage}% · ${calculation.predikat}).`
    );
    setTimeout(() => setSavedNotice(null), 5000);
    handleReset();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gradient-to-b from-emerald-50/80 via-green-50/60 to-lime-50/50 min-h-full">
      {savedNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Unit Selector Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="mb-2.5 text-xs font-bold text-emerald-950">
          Pilih Unit Manajerial Sekolah yang Disupervisi
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MANAGERIAL_UNITS.map((unit) => (
            <button
              key={unit.key}
              type="button"
              onClick={() => handleSelectUnit(unit.key)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                unitKey === unit.key
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-emerald-50'
              }`}
            >
              {unit.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-emerald-950">
                Instrumen: {selectedUnit.label}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Buat Baru
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Penanggung Jawab Unit
                </label>
                <input
                  required
                  type="text"
                  value={penanggungJawab}
                  onChange={(e) => setPenanggungJawab(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-medium text-emerald-950 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  NIP Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={nipPenanggungJawab}
                  onChange={(e) => setNipPenanggungJawab(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Tanggal Supervisi
                </label>
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Supervisor
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

          <div className="rounded-xl border border-emerald-300 bg-gradient-to-br from-[#DCFCE7] via-[#BBF7D0] to-[#ECFDF5] p-5 text-emerald-950 shadow-xs lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-800">
                Capaian Kinerja Manajerial
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
            <div className="mt-4 border-t border-emerald-400/40 pt-3 text-[11px] text-emerald-900">
              5 Indikator Standar Manajerial · Skala 1 s.d. 4
            </div>
          </div>
        </div>

        {/* 5 Managerial Indicators Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-emerald-200 bg-[#DCFCE7] text-emerald-950">
                  <th className="px-4 py-3 font-semibold w-12">No</th>
                  <th className="px-4 py-3 font-semibold">Indikator Manajerial</th>
                  <th className="px-4 py-3 font-semibold">Skor (1–4)</th>
                  <th className="px-4 py-3 font-semibold w-64">Catatan Bukti Fisik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedUnit.indicators.map((ind, idx) => {
                  const val = scores[ind.id] || 3;
                  return (
                    <tr key={ind.id} className="hover:bg-emerald-50/40 align-top">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-950 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-emerald-950">{ind.title}</div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          {ind.description}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {SCORE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setScores({ ...scores, [ind.id]: opt.value })}
                              className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                                val === opt.value
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
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
                          value={indicatorNotes[ind.id] || ''}
                          onChange={(e) =>
                            setIndicatorNotes({
                              ...indicatorNotes,
                              [ind.id]: e.target.value,
                            })
                          }
                          placeholder="Catatan dokumen/temuan..."
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

        {/* Managerial Qualitative Notes */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs">
          <h3 className="font-display text-sm font-bold text-emerald-950 border-b border-slate-100 pb-2">
            Analisis Kekuatan, Catatan Pembenahan & Tindak Lanjut Manajerial
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">
                Analisis Kekuatan
              </label>
              <textarea
                rows={3}
                required
                value={analisisKekuatan}
                onChange={(e) => setAnalisisKekuatan(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">
                Catatan Pembenahan
              </label>
              <textarea
                rows={3}
                required
                value={catatanPembenahan}
                onChange={(e) => setCatatanPembenahan(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">
                Rencana Tindak Lanjut
              </label>
              <textarea
                rows={3}
                required
                value={tindakLanjut}
                onChange={(e) => setTindakLanjut(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Hasil Supervisi Manajerial</span>
            </button>
          </div>
        </div>
      </form>

      {/* Saved Managerial History */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5">
          <h3 className="font-display text-sm font-bold text-emerald-950">
            Riwayat Penilaian Supervisi Manajerial ({assessments.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-200 bg-[#DCFCE7] text-emerald-950">
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Unit Kerja</th>
                <th className="px-4 py-3 font-semibold">Penanggung Jawab</th>
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
                    {a.unitLabel}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{a.penanggungJawab}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-emerald-800 tabular-nums">
                    {a.totalScore}/20 ({a.percentage}%)
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
                      aria-label={`Hapus penilaian ${a.unitLabel}`}
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
