import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Download,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { SupervisionCategory, SupervisionProgram } from '../types/supervision';
import { exportToExcel } from '../utils/excelHelper';

interface ProgramViewProps {
  programs: SupervisionProgram[];
  onSavePrograms: (next: SupervisionProgram[]) => void;
}

export const ProgramView: React.FC<ProgramViewProps> = ({
  programs,
  onSavePrograms,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | SupervisionCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<SupervisionProgram | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<Omit<SupervisionProgram, 'id'>>({
    code: '',
    category: 'Akademik',
    title: '',
    tujuan: '',
    indikatorKeberhasilan: '',
    sasaran: '',
    penanggungJawab: 'Aryadi, S.Kom',
    waktuPelaksanaan: '',
    instrumen: '',
    targetCapaian: '',
    realized: false,
  });

  const filteredPrograms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return programs.filter((p) => {
      const matchCat = categoryFilter === 'Semua' || p.category === categoryFilter;
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.penanggungJawab.toLowerCase().includes(q) ||
        p.sasaran.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [programs, categoryFilter, searchQuery]);

  const toggleRealized = (id: string) => {
    onSavePrograms(
      programs.map((p) => (p.id === id ? { ...p, realized: !p.realized } : p))
    );
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormState({
      code: `PR-${programs.length + 1}`,
      category: categoryFilter === 'Manajerial' ? 'Manajerial' : 'Akademik',
      title: '',
      tujuan: '',
      indikatorKeberhasilan: '',
      sasaran: '',
      penanggungJawab: 'Aryadi, S.Kom',
      waktuPelaksanaan: '',
      instrumen: '',
      targetCapaian: '',
      realized: false,
    });
    setIsFormOpen(true);
  };

  const openEditModal = (p: SupervisionProgram) => {
    setEditingId(p.id);
    setFormState({ ...p });
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) return;
    if (editingId) {
      onSavePrograms(
        programs.map((p) => (p.id === editingId ? { ...formState, id: editingId } : p))
      );
    } else {
      onSavePrograms([...programs, { ...formState, id: `prog-${Date.now()}` }]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    onSavePrograms(programs.filter((p) => p.id !== id));
  };

  const handleExport = () => {
    exportToExcel(
      filteredPrograms.map((p) => ({
        Kode: p.code,
        Kategori: p.category,
        Program: p.title,
        Tujuan: p.tujuan,
        Indikator_Keberhasilan: p.indikatorKeberhasilan,
        Sasaran: p.sasaran,
        Penanggung_Jawab: p.penanggungJawab,
        Waktu_Pelaksanaan: p.waktuPelaksanaan,
        Instrumen: p.instrumen,
        Target_Capaian: p.targetCapaian,
        Status: p.realized ? 'Tercapai' : 'Dalam Proses',
      })),
      'Program Supervisi',
      'Program_Supervisi_SMPN8_BatangHari'
    );
  };

  const realizedCount = programs.filter((p) => p.realized).length;

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-gradient-to-b from-emerald-50/80 via-green-50/60 to-lime-50/50 min-h-full">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            {[
              { id: 'Semua' as const, label: `Semua (${programs.length})` },
              {
                id: 'Akademik' as const,
                label: `Supervisi Akademik (${
                  programs.filter((p) => p.category === 'Akademik').length
                })`,
              },
              {
                id: 'Manajerial' as const,
                label: `Supervisi Manajerial (${
                  programs.filter((p) => p.category === 'Manajerial').length
                })`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-600 tabular-nums mr-2">
              Realisasi: <strong className="text-emerald-950">{realizedCount}/{programs.length}</strong> Program
            </span>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5 text-emerald-700" />
              <span>Ekspor Excel</span>
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#BBF7D0] px-3.5 py-1.5 text-xs font-bold text-emerald-950 hover:bg-[#86EFAC] whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Program</span>
            </button>
          </div>
        </div>

        <div className="relative max-w-md border-t border-slate-100 pt-3">
          <Search className="pointer-events-none absolute left-3 top-[26px] h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari program, kode, sasaran, atau penanggung jawab..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Program Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-200 bg-[#DCFCE7] text-emerald-950">
                <th className="px-3.5 py-3 font-semibold">Kode</th>
                <th className="px-3.5 py-3 font-semibold">Kategori</th>
                <th className="px-3.5 py-3 font-semibold">Nama Program & Tujuan</th>
                <th className="px-3.5 py-3 font-semibold">Sasaran</th>
                <th className="px-3.5 py-3 font-semibold">Penanggung Jawab</th>
                <th className="px-3.5 py-3 font-semibold">Waktu & Target</th>
                <th className="px-3.5 py-3 font-semibold">Realisasi</th>
                <th className="px-3.5 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrograms.map((p) => (
                <tr key={p.id} className="hover:bg-emerald-50/40 align-top">
                  <td className="px-3.5 py-3 font-mono font-semibold text-emerald-950 whitespace-nowrap">
                    {p.code}
                  </td>
                  <td className="px-3.5 py-3 font-semibold text-slate-700 whitespace-nowrap">
                    {p.category}
                  </td>
                  <td className="px-3.5 py-3 max-w-xs">
                    <div className="font-semibold text-emerald-950">{p.title}</div>
                    <div className="mt-0.5 text-[11px] text-slate-600 line-clamp-2">
                      {p.tujuan}
                    </div>
                  </td>
                  <td className="px-3.5 py-3 text-slate-700">{p.sasaran}</td>
                  <td className="px-3.5 py-3 text-slate-700 whitespace-nowrap">
                    {p.penanggungJawab}
                  </td>
                  <td className="px-3.5 py-3 text-slate-600">
                    <div className="font-medium text-slate-800">
                      {p.waktuPelaksanaan}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Target: {p.targetCapaian}
                    </div>
                  </td>
                  <td className="px-3.5 py-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => toggleRealized(p.id)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        p.realized
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {p.realized ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Tercapai</span>
                        </>
                      ) : (
                        <>
                          <Circle className="h-3.5 w-3.5" />
                          <span>Proses</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-3.5 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedProgram(p)}
                      aria-label={`Detail ${p.title}`}
                      className="mr-1 rounded p-1.5 text-slate-600 hover:bg-slate-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(p)}
                      aria-label={`Edit ${p.title}`}
                      className="mr-1 rounded p-1.5 text-emerald-700 hover:bg-emerald-100"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      aria-label={`Hapus ${p.title}`}
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

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/50 p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div>
                <div className="text-[11px] font-semibold text-emerald-700">
                  {selectedProgram.code} · Supervisi {selectedProgram.category}
                </div>
                <h3 className="font-display text-base font-bold text-emerald-950">
                  {selectedProgram.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div>
                <div className="font-semibold text-slate-500">Tujuan Program</div>
                <p className="mt-0.5 text-slate-800">{selectedProgram.tujuan}</p>
              </div>
              <div>
                <div className="font-semibold text-slate-500">
                  Indikator Keberhasilan
                </div>
                <p className="mt-0.5 text-slate-800">
                  {selectedProgram.indikatorKeberhasilan}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <div className="font-semibold text-slate-500">Sasaran</div>
                  <div className="mt-0.5 text-slate-800">{selectedProgram.sasaran}</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-500">
                    Penanggung Jawab
                  </div>
                  <div className="mt-0.5 text-slate-800">
                    {selectedProgram.penanggungJawab}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-500">
                    Waktu Pelaksanaan
                  </div>
                  <div className="mt-0.5 text-slate-800">
                    {selectedProgram.waktuPelaksanaan}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-500">Target Capaian</div>
                  <div className="mt-0.5 font-semibold text-emerald-950">
                    {selectedProgram.targetCapaian}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="font-semibold text-slate-500">
                    Instrumen yang Digunakan
                  </div>
                  <div className="mt-0.5 text-slate-800">
                    {selectedProgram.instrumen}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Program Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/50 p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <h3 className="font-display text-base font-bold text-emerald-950">
                {editingId ? 'Edit Program Supervisi' : 'Tambah Program Supervisi'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Kode</label>
                  <input
                    required
                    type="text"
                    value={formState.code}
                    onChange={(e) =>
                      setFormState({ ...formState, code: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block font-semibold text-slate-700">
                    Kategori Supervisi
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        category: e.target.value as SupervisionCategory,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Akademik">Supervisi Akademik</option>
                    <option value="Manajerial">Supervisi Manajerial</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Judul Program
                </label>
                <input
                  required
                  type="text"
                  value={formState.title}
                  onChange={(e) =>
                    setFormState({ ...formState, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">Tujuan</label>
                <textarea
                  rows={2}
                  required
                  value={formState.tujuan}
                  onChange={(e) =>
                    setFormState({ ...formState, tujuan: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Indikator Keberhasilan
                </label>
                <textarea
                  rows={2}
                  required
                  value={formState.indikatorKeberhasilan}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      indikatorKeberhasilan: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Sasaran</label>
                  <input
                    required
                    type="text"
                    value={formState.sasaran}
                    onChange={(e) =>
                      setFormState({ ...formState, sasaran: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Penanggung Jawab
                  </label>
                  <input
                    required
                    type="text"
                    value={formState.penanggungJawab}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        penanggungJawab: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Waktu Pelaksanaan
                  </label>
                  <input
                    required
                    type="text"
                    value={formState.waktuPelaksanaan}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        waktuPelaksanaan: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Target Capaian
                  </label>
                  <input
                    required
                    type="text"
                    value={formState.targetCapaian}
                    onChange={(e) =>
                      setFormState({ ...formState, targetCapaian: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Instrumen
                </label>
                <input
                  required
                  type="text"
                  value={formState.instrumen}
                  onChange={(e) =>
                    setFormState({ ...formState, instrumen: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
                >
                  Simpan Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
