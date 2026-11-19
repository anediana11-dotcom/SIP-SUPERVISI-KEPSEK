import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Check, Download, FileSpreadsheet, Pencil, Printer, Save } from 'lucide-react';
import {
  ACADEMIC_ASPECTS,
  MANAGERIAL_UNITS,
  SCHOOL_ASSETS,
  SCHOOL_IDENTITY,
} from '../data/initialData';
import {
  AcademicAssessment,
  AcademicYearConfig,
  FinalEvaluationNote,
  ManagerialAssessment,
  ScheduleItem,
  SupervisionProgram,
} from '../types/supervision';
import { exportToExcel } from '../utils/excelHelper';

interface ReportsViewProps {
  activeYear: AcademicYearConfig;
  academicAssessments: AcademicAssessment[];
  managerialAssessments: ManagerialAssessment[];
  programs: SupervisionProgram[];
  schedules: ScheduleItem[];
  finalEvaluation: FinalEvaluationNote;
  onSaveFinalEvaluation: (next: FinalEvaluationNote) => void;
  preselectedAcademicId?: string | null;
  preselectedManagerialId?: string | null;
  openRekapSignal?: number;
}

type ReportTab = 'akademik' | 'manajerial' | 'rekap';

export const ReportsView: React.FC<ReportsViewProps> = ({
  activeYear,
  academicAssessments,
  managerialAssessments,
  programs,
  schedules,
  finalEvaluation,
  onSaveFinalEvaluation,
  preselectedAcademicId,
  preselectedManagerialId,
  openRekapSignal,
}) => {
  const [reportTab, setReportTab] = useState<ReportTab>('akademik');
  const [selectedAcademicId, setSelectedAcademicId] = useState<string>(
    academicAssessments[0]?.id || ''
  );
  const [selectedManagerialId, setSelectedManagerialId] = useState<string>(
    managerialAssessments[0]?.id || ''
  );
  const [isEditingEval, setIsEditingEval] = useState(false);
  const [evalForm, setEvalForm] = useState<FinalEvaluationNote>(finalEvaluation);
  const [evalSavedToast, setEvalSavedToast] = useState(false);

  useEffect(() => {
    setEvalForm(finalEvaluation);
  }, [finalEvaluation]);

  useEffect(() => {
    if (preselectedAcademicId) {
      setReportTab('akademik');
      setSelectedAcademicId(preselectedAcademicId);
    }
  }, [preselectedAcademicId]);

  useEffect(() => {
    if (preselectedManagerialId) {
      setReportTab('manajerial');
      setSelectedManagerialId(preselectedManagerialId);
    }
  }, [preselectedManagerialId]);

  useEffect(() => {
    if (openRekapSignal && openRekapSignal > 0) {
      setReportTab('rekap');
    }
  }, [openRekapSignal]);

  const evalSummary = useMemo(() => {
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
    const programPct =
      programs.length > 0
        ? Number(
            (
              (programs.filter((p) => p.realized).length / programs.length) *
              100
            ).toFixed(1)
          )
        : 0;

    return { academicAvg, managerialAvg, programPct };
  }, [academicAssessments, managerialAssessments, programs]);

  const handleSaveEval = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveFinalEvaluation({
      ...evalForm,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setIsEditingEval(false);
    setEvalSavedToast(true);
    setTimeout(() => setEvalSavedToast(false), 3000);
  };

  const currentAcademic =
    academicAssessments.find((a) => a.id === selectedAcademicId) ||
    academicAssessments[0];

  const currentManagerial =
    managerialAssessments.find((a) => a.id === selectedManagerialId) ||
    managerialAssessments[0];

  const currentManagerialUnit = MANAGERIAL_UNITS.find(
    (u) => u.key === currentManagerial?.unitKey
  );

  const handleExportRekapExcel = () => {
    exportToExcel(
      academicAssessments.map((a, idx) => ({
        No: idx + 1,
        Tanggal: a.date,
        Nama_Guru: a.teacherName,
        NIP: a.teacherNip,
        Mata_Pelajaran: a.mataPelajaran,
        Kelas: a.kelas,
        Supervisor: a.supervisorName,
        Total_Skor: a.totalScore,
        Nilai_Persentase: a.percentage,
        Predikat: a.predikat,
        Rekomendasi: a.rekomendasiPembinaan,
        Rencana_Tindak_Lanjut: a.rencanaTindakLanjut,
      })),
      'Rekap Supervisi Akademik',
      `Rekap_Supervisi_SMPN8_${activeYear.tahunPelajaran.replace('/', '-')}`
    );
  };

  const KopSurat = () => (
    <div className="border-b-4 border-double border-black pb-3 mb-5">
      <div className="flex items-center justify-between gap-4">
        <img
          src={SCHOOL_ASSETS.logoPemkab}
          alt="Logo Pemkab Batang Hari"
          referrerPolicy="no-referrer"
          className="h-20 w-20 object-contain shrink-0"
        />
        <div className="text-center flex-1 leading-tight">
          <div className="text-xs font-bold tracking-wider uppercase text-slate-900">
            {SCHOOL_IDENTITY.pemerintah}
          </div>
          <div className="text-xs font-bold tracking-wider uppercase text-slate-900">
            {SCHOOL_IDENTITY.dinas}
          </div>
          <div className="mt-0.5 font-display text-lg font-extrabold tracking-tight uppercase text-black">
            {SCHOOL_IDENTITY.namaSekolah}
          </div>
          <div className="mt-1 text-[11px] text-slate-800">
            NPSN: {SCHOOL_IDENTITY.npsn} · {SCHOOL_IDENTITY.alamat}
          </div>
        </div>
        <img
          src={SCHOOL_ASSETS.logoSekolah}
          alt="Logo SMP Negeri 8 Batang Hari"
          referrerPolicy="no-referrer"
          className="h-20 w-20 object-contain shrink-0"
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-gradient-to-b from-emerald-50/80 via-green-50/60 to-lime-50/50 min-h-full">
      {/* Toolbar (hidden on print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
          {[
            { id: 'akademik' as ReportTab, label: 'Laporan Supervisi Akademik' },
            { id: 'manajerial' as ReportTab, label: 'Laporan Supervisi Manajerial' },
            { id: 'rekap' as ReportTab, label: 'Rekapitulasi & Evaluasi Akhir' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setReportTab(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                reportTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {reportTab === 'akademik' && academicAssessments.length > 0 && (
            <select
              value={currentAcademic?.id || ''}
              onChange={(e) => setSelectedAcademicId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-emerald-950 focus:border-emerald-600 focus:outline-none"
            >
              {academicAssessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.teacherName} ({a.date})
                </option>
              ))}
            </select>
          )}

          {reportTab === 'manajerial' && managerialAssessments.length > 0 && (
            <select
              value={currentManagerial?.id || ''}
              onChange={(e) => setSelectedManagerialId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-emerald-950 focus:border-emerald-600 focus:outline-none"
            >
              {managerialAssessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.unitLabel} ({a.date})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handleExportRekapExcel}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 text-emerald-700" />
            <span>Ekspor Rekap Excel</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 whitespace-nowrap"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak A4 / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Screen-only Editor for Catatan Evaluasi Akhir Kepala Sekolah */}
      {reportTab === 'rekap' && (
        <div className="no-print mx-auto max-w-[210mm] rounded-xl border border-emerald-200 bg-white p-4 shadow-xs text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-bold text-emerald-950">
                Catatan Evaluasi Akhir Kepala Sekolah (Kelebihan & Kekurangan)
              </div>
              <div className="text-[11px] text-slate-500">
                Sesuaikan ringkasan kelebihan, kekurangan, dan rekomendasi strategis sebelum mencetak dokumen A4
              </div>
            </div>
            <div className="flex items-center gap-2">
              {evalSavedToast && (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                  Tersimpan
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsEditingEval((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 font-semibold text-emerald-950 hover:bg-[#DCFCE7]"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>{isEditingEval ? 'Tutup Editor' : 'Ubah Evaluasi Akhir'}</span>
              </button>
            </div>
          </div>

          {isEditingEval && (
            <form onSubmit={handleSaveEval} className="mt-4 space-y-3 border-t border-slate-100 pt-3">
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Kelebihan Umum Hasil Supervisi
                </label>
                <textarea
                  rows={2}
                  required
                  value={evalForm.kelebihanUmum}
                  onChange={(e) =>
                    setEvalForm({ ...evalForm, kelebihanUmum: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Kekurangan & Aspek yang Perlu Ditingkatkan
                </label>
                <textarea
                  rows={2}
                  required
                  value={evalForm.kekuranganUmum}
                  onChange={(e) =>
                    setEvalForm({ ...evalForm, kekuranganUmum: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Rekomendasi & Tindak Lanjut Strategis Kepala Sekolah
                </label>
                <textarea
                  rows={2}
                  required
                  value={evalForm.rekomendasiStrategis}
                  onChange={(e) =>
                    setEvalForm({
                      ...evalForm,
                      rekomendasiStrategis: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 font-semibold text-white hover:bg-emerald-700"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan Evaluasi Akhir</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* A4 Printable Document Sheet */}
      <div className="print-container mx-auto max-w-[210mm] rounded-xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm text-slate-900">
        <KopSurat />

        {reportTab === 'akademik' && (
          <>
            {!currentAcademic ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Belum ada data penilaian supervisi akademik tersimpan.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="text-center space-y-0.5 mb-4">
                  <h2 className="text-sm font-bold uppercase underline">
                    INSTRUMEN & LAPORAN HASIL SUPERVISI AKADEMIK
                  </h2>
                  <div>
                    Tahun Pelajaran {activeYear.tahunPelajaran} · Semester {activeYear.semester}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 border border-slate-300 p-3 rounded">
                  <div>
                    <span className="font-semibold">Nama Guru:</span> {currentAcademic.teacherName}
                  </div>
                  <div>
                    <span className="font-semibold">Tanggal Supervisi:</span> {currentAcademic.date}
                  </div>
                  <div>
                    <span className="font-semibold">NIP:</span>{' '}
                    <span className="font-mono">{currentAcademic.teacherNip}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Supervisor:</span>{' '}
                    {currentAcademic.supervisorName}
                  </div>
                  <div>
                    <span className="font-semibold">Mata Pelajaran:</span>{' '}
                    {currentAcademic.mataPelajaran}
                  </div>
                  <div>
                    <span className="font-semibold">Kelas / Nilai Akhir:</span>{' '}
                    {currentAcademic.kelas} ·{' '}
                    <strong>
                      {currentAcademic.percentage}% ({currentAcademic.predikat})
                    </strong>
                  </div>
                </div>

                {/* Aspects Table */}
                <table className="w-full border-collapse border border-slate-400 text-xs">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-400 px-2.5 py-2 text-center w-10">No</th>
                      <th className="border border-slate-400 px-2.5 py-2 text-left">
                        Aspek Penilaian Pembelajaran
                      </th>
                      <th className="border border-slate-400 px-2.5 py-2 text-center w-16">Skor</th>
                      <th className="border border-slate-400 px-2.5 py-2 text-left">
                        Catatan Pengamatan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ACADEMIC_ASPECTS.map((asp) => (
                      <tr key={asp.id}>
                        <td className="border border-slate-400 px-2.5 py-1.5 text-center font-mono">
                          {asp.number}
                        </td>
                        <td className="border border-slate-400 px-2.5 py-1.5 font-medium">
                          {asp.title}
                        </td>
                        <td className="border border-slate-400 px-2.5 py-1.5 text-center font-mono font-bold">
                          {currentAcademic.scores[asp.id] || 0}
                        </td>
                        <td className="border border-slate-400 px-2.5 py-1.5 text-slate-700">
                          {currentAcademic.aspectNotes[asp.id] || '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={2} className="border border-slate-400 px-2.5 py-2 text-right">
                        Total Skor / Persentase Pencapaian / Predikat
                      </td>
                      <td className="border border-slate-400 px-2.5 py-2 text-center font-mono">
                        {currentAcademic.totalScore}/40
                      </td>
                      <td className="border border-slate-400 px-2.5 py-2">
                        {currentAcademic.percentage}% ({currentAcademic.predikat})
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Qualitative Summary */}
                <div className="space-y-2 border border-slate-300 p-3 rounded leading-relaxed">
                  <div>
                    <span className="font-bold">Catatan Supervisor: </span>
                    {currentAcademic.catatanSupervisor}
                  </div>
                  <div>
                    <span className="font-bold">Kelebihan Guru: </span>
                    {currentAcademic.kelebihanGuru}
                  </div>
                  <div>
                    <span className="font-bold">Aspek yang Perlu Ditingkatkan: </span>
                    {currentAcademic.aspekDitingkatkan}
                  </div>
                  <div>
                    <span className="font-bold">Rekomendasi Pembinaan: </span>
                    {currentAcademic.rekomendasiPembinaan}
                  </div>
                  <div>
                    <span className="font-bold">Rencana Tindak Lanjut (RTL): </span>
                    {currentAcademic.rencanaTindakLanjut}
                  </div>
                </div>

                {/* Signature Block */}
                <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs">
                  <div>
                    <div>Guru yang Disupervisi,</div>
                    <div className="h-16" />
                    <div className="font-bold underline">{currentAcademic.teacherName}</div>
                    <div className="font-mono text-[11px]">NIP. {currentAcademic.teacherNip}</div>
                  </div>
                  <div>
                    <div>Mengetahui,</div>
                    <div>Pengawas Pembina Sekolah</div>
                    <div className="h-12" />
                    <div className="font-bold underline">{activeYear.pengawasPembina}</div>
                    <div className="font-mono text-[11px]">
                      NIP. {activeYear.nipPengawasPembina}
                    </div>
                  </div>
                  <div>
                    <div>Bajubang, {currentAcademic.date}</div>
                    <div>Kepala Sekolah</div>
                    <div className="h-12" />
                    <div className="font-bold underline">{activeYear.kepalaSekolah}</div>
                    <div className="font-mono text-[11px]">
                      NIP. {activeYear.nipKepalaSekolah}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {reportTab === 'manajerial' && (
          <>
            {!currentManagerial ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Belum ada data penilaian supervisi manajerial tersimpan.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="text-center space-y-0.5 mb-4">
                  <h2 className="text-sm font-bold uppercase underline">
                    LAPORAN HASIL SUPERVISI MANAJERIAL SEKOLAH
                  </h2>
                  <div>
                    Tahun Pelajaran {activeYear.tahunPelajaran} · Semester {activeYear.semester}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 border border-slate-300 p-3 rounded">
                  <div>
                    <span className="font-semibold">Unit Kerja:</span> {currentManagerial.unitLabel}
                  </div>
                  <div>
                    <span className="font-semibold">Tanggal Supervisi:</span> {currentManagerial.date}
                  </div>
                  <div>
                    <span className="font-semibold">Penanggung Jawab:</span>{' '}
                    {currentManagerial.penanggungJawab}
                  </div>
                  <div>
                    <span className="font-semibold">NIP:</span>{' '}
                    <span className="font-mono">{currentManagerial.nipPenanggungJawab}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Supervisor:</span>{' '}
                    {currentManagerial.supervisorName}
                  </div>
                  <div>
                    <span className="font-semibold">Nilai Capaian:</span>{' '}
                    <strong>
                      {currentManagerial.percentage}% ({currentManagerial.predikat})
                    </strong>
                  </div>
                </div>

                <table className="w-full border-collapse border border-slate-400 text-xs">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-400 px-2.5 py-2 text-center w-10">No</th>
                      <th className="border border-slate-400 px-2.5 py-2 text-left">
                        Indikator Standar Manajerial
                      </th>
                      <th className="border border-slate-400 px-2.5 py-2 text-center w-16">Skor</th>
                      <th className="border border-slate-400 px-2.5 py-2 text-left">
                        Catatan & Bukti Fisik
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentManagerialUnit?.indicators || []).map((ind, idx) => (
                      <tr key={ind.id}>
                        <td className="border border-slate-400 px-2.5 py-2 text-center font-mono">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-400 px-2.5 py-2">
                          <div className="font-semibold">{ind.title}</div>
                          <div className="text-[11px] text-slate-600">{ind.description}</div>
                        </td>
                        <td className="border border-slate-400 px-2.5 py-2 text-center font-mono font-bold">
                          {currentManagerial.scores[ind.id] || 0}
                        </td>
                        <td className="border border-slate-400 px-2.5 py-2">
                          {currentManagerial.indicatorNotes[ind.id] || '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={2} className="border border-slate-400 px-2.5 py-2 text-right">
                        Total Skor / Persentase / Predikat
                      </td>
                      <td className="border border-slate-400 px-2.5 py-2 text-center font-mono">
                        {currentManagerial.totalScore}/20
                      </td>
                      <td className="border border-slate-400 px-2.5 py-2">
                        {currentManagerial.percentage}% ({currentManagerial.predikat})
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="space-y-2 border border-slate-300 p-3 rounded leading-relaxed">
                  <div>
                    <span className="font-bold">Analisis Kekuatan: </span>
                    {currentManagerial.analisisKekuatan}
                  </div>
                  <div>
                    <span className="font-bold">Catatan Pembenahan: </span>
                    {currentManagerial.catatanPembenahan}
                  </div>
                  <div>
                    <span className="font-bold">Rencana Tindak Lanjut: </span>
                    {currentManagerial.tindakLanjut}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs">
                  <div>
                    <div>Penanggung Jawab Unit,</div>
                    <div className="h-16" />
                    <div className="font-bold underline">{currentManagerial.penanggungJawab}</div>
                    <div className="font-mono text-[11px]">
                      NIP. {currentManagerial.nipPenanggungJawab}
                    </div>
                  </div>
                  <div>
                    <div>Mengetahui,</div>
                    <div>Pengawas Pembina Sekolah</div>
                    <div className="h-12" />
                    <div className="font-bold underline">{activeYear.pengawasPembina}</div>
                    <div className="font-mono text-[11px]">
                      NIP. {activeYear.nipPengawasPembina}
                    </div>
                  </div>
                  <div>
                    <div>Bajubang, {currentManagerial.date}</div>
                    <div>Kepala Sekolah</div>
                    <div className="h-12" />
                    <div className="font-bold underline">{activeYear.kepalaSekolah}</div>
                    <div className="font-mono text-[11px]">
                      NIP. {activeYear.nipKepalaSekolah}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {reportTab === 'rekap' && (
          <div className="space-y-5 text-xs">
            <div className="text-center space-y-0.5">
              <h2 className="text-sm font-bold uppercase underline">
                REKAPITULASI HASIL SUPERVISI AKADEMIK & MANAJERIAL
              </h2>
              <div>
                Tahun Pelajaran {activeYear.tahunPelajaran} · Semester {activeYear.semester}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 border border-slate-300 p-3 rounded text-center">
              <div>
                <div className="text-[11px] text-slate-600">Total Program</div>
                <div className="font-mono text-base font-bold">{programs.length}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-600">Program Tercapai</div>
                <div className="font-mono text-base font-bold">
                  {programs.filter((p) => p.realized).length}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-600">Agenda Terjadwal</div>
                <div className="font-mono text-base font-bold">{schedules.length}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-600">Laporan Selesai</div>
                <div className="font-mono text-base font-bold">
                  {academicAssessments.length + managerialAssessments.length}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2 flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>A. Rekapitulasi Penilaian Supervisi Akademik Guru</span>
              </h3>
              <table className="w-full border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-400 px-2 py-1.5 text-center">No</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">Nama Guru</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">Mapel / Kelas</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center">Tanggal</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center">Skor</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center">Nilai</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">Predikat</th>
                  </tr>
                </thead>
                <tbody>
                  {academicAssessments.map((a, idx) => (
                    <tr key={a.id}>
                      <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5 font-medium">
                        {a.teacherName}
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5">
                        {a.mataPelajaran} ({a.kelas})
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">
                        {a.date}
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">
                        {a.totalScore}/40
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5 text-center font-mono font-bold">
                        {a.percentage}%
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5 font-semibold">
                        {a.predikat}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="font-bold mb-2">
                B. Rekapitulasi Penilaian Supervisi Manajerial Unit Kerja
              </h3>
              <table className="w-full border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-400 px-2 py-1.5 text-center">No</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">Unit Kerja</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">Penanggung Jawab</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center">Tanggal</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center">Skor</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center">Nilai</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">Predikat</th>
                  </tr>
                </thead>
                <tbody>
                  {managerialAssessments.map((m, idx) => (
                    <tr key={m.id}>
                      <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5 font-medium">
                        {m.unitLabel}
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5">
                        {m.penanggungJawab}
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">
                        {m.date}
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">
                        {m.totalScore}/20
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5 text-center font-mono font-bold">
                        {m.percentage}%
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5 font-semibold">
                        {m.predikat}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* C. Grafik Persentase Capaian Akhir */}
            <div className="border border-slate-300 rounded p-3.5 space-y-3">
              <h3 className="font-bold flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>C. Grafik Persentase Capaian Akhir Supervisi</span>
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: 'Rata-rata Supervisi Akademik', pct: evalSummary.academicAvg, color: 'bg-emerald-600' },
                  { label: 'Rata-rata Supervisi Manajerial', pct: evalSummary.managerialAvg, color: 'bg-green-500' },
                  { label: 'Realisasi Program Supervisi', pct: evalSummary.programPct, color: 'bg-lime-500' },
                ].map((bar) => (
                  <div key={bar.label} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium">{bar.label}</span>
                      <span className="font-mono font-bold tabular-nums">{bar.pct}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${bar.color}`}
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Per-Guru & Per-Unit Percentage Bars */}
              <div className="border-t border-slate-200 pt-2.5 space-y-2">
                <div className="text-[11px] font-semibold text-slate-700">
                  Persentase Capaian per Guru & Unit Kerja:
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                  {[
                    ...academicAssessments.map((a) => ({
                      id: a.id,
                      label: `${a.teacherName} (${a.mataPelajaran})`,
                      pct: a.percentage,
                    })),
                    ...managerialAssessments.map((m) => ({
                      id: m.id,
                      label: m.unitLabel,
                      pct: m.percentage,
                    })),
                  ].map((item) => (
                    <div key={item.id} className="space-y-0.5">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="truncate">{item.label}</span>
                        <span className="font-mono font-bold tabular-nums shrink-0">
                          {item.pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* D. Evaluasi Akhir: Kelebihan & Kekurangan */}
            <div className="space-y-3">
              <h3 className="font-bold">
                D. Evaluasi Akhir Supervisi (Kelebihan, Kekurangan & Tindak Lanjut)
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="border border-slate-400 rounded p-3 space-y-1.5">
                  <div className="font-bold text-emerald-800 uppercase text-[11px]">
                    1. Kelebihan Hasil Supervisi
                  </div>
                  <p className="leading-relaxed text-slate-800">
                    {finalEvaluation.kelebihanUmum}
                  </p>
                </div>
                <div className="border border-slate-400 rounded p-3 space-y-1.5">
                  <div className="font-bold text-amber-800 uppercase text-[11px]">
                    2. Kekurangan & Aspek Perlu Ditingkatkan
                  </div>
                  <p className="leading-relaxed text-slate-800">
                    {finalEvaluation.kekuranganUmum}
                  </p>
                </div>
              </div>

              <div className="border border-slate-400 rounded p-3 space-y-1">
                <div className="font-bold text-emerald-900 uppercase text-[11px]">
                  3. Rekomendasi Strategis Kepala Sekolah
                </div>
                <p className="leading-relaxed text-slate-800">
                  {finalEvaluation.rekomendasiStrategis}
                </p>
              </div>

              {/* Per-Assessment Strengths & Weaknesses Matrix */}
              <table className="w-full border-collapse border border-slate-400 text-[11px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-400 px-2 py-1.5 text-left">
                      Guru / Unit Kerja
                    </th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">
                      Kelebihan / Kekuatan
                    </th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">
                      Kekurangan / Aspek Ditingkatkan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {academicAssessments.map((a) => (
                    <tr key={a.id}>
                      <td className="border border-slate-400 px-2 py-1.5 font-medium">
                        {a.teacherName} ({a.percentage}%)
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5">
                        {a.kelebihanGuru}
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5">
                        {a.aspekDitingkatkan}
                      </td>
                    </tr>
                  ))}
                  {managerialAssessments.map((m) => (
                    <tr key={m.id}>
                      <td className="border border-slate-400 px-2 py-1.5 font-medium">
                        {m.unitLabel} ({m.percentage}%)
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5">
                        {m.analisisKekuatan}
                      </td>
                      <td className="border border-slate-400 px-2 py-1.5">
                        {m.catatanPembenahan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
              <div>
                <div>Mengetahui,</div>
                <div>Pengawas Pembina Sekolah</div>
                <div className="h-14" />
                <div className="font-bold underline">{activeYear.pengawasPembina}</div>
                <div className="font-mono text-[11px]">NIP. {activeYear.nipPengawasPembina}</div>
              </div>
              <div>
                <div>
                  Bajubang,{' '}
                  {new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <div>Kepala Sekolah SMPN 8 Batang Hari</div>
                <div className="h-14" />
                <div className="font-bold underline">{activeYear.kepalaSekolah}</div>
                <div className="font-mono text-[11px]">NIP. {activeYear.nipKepalaSekolah}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
