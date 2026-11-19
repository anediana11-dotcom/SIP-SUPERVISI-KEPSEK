import React, { useMemo, useRef, useState } from 'react';
import {
  Check,
  Download,
  FileSpreadsheet,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  AcademicYearConfig,
  EmploymentStatus,
  Staff,
  SupervisorMember,
  Teacher,
} from '../types/supervision';
import {
  downloadExcelTemplate,
  exportToExcel,
  parseExcelFile,
} from '../utils/excelHelper';

interface MasterDataViewProps {
  teachers: Teacher[];
  onSaveTeachers: (next: Teacher[]) => void;
  staff: Staff[];
  onSaveStaff: (next: Staff[]) => void;
  supervisors: SupervisorMember[];
  onSaveSupervisors: (next: SupervisorMember[]) => void;
  academicYears: AcademicYearConfig[];
  onSaveAcademicYears: (next: AcademicYearConfig[]) => void;
}

type MasterTab = 'guru' | 'tendik' | 'tim' | 'tahun';

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  teachers,
  onSaveTeachers,
  staff,
  onSaveStaff,
  supervisors,
  onSaveSupervisors,
  academicYears,
  onSaveAcademicYears,
}) => {
  const [activeTab, setActiveTab] = useState<MasterTab>('guru');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | EmploymentStatus>('Semua');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for Guru
  const [teacherForm, setTeacherForm] = useState<Omit<Teacher, 'id'>>({
    name: '',
    nip: '',
    nuptk: '',
    pangkatGolongan: '',
    jabatan: '',
    mataPelajaran: '',
    pendidikanTerakhir: 'S1',
    statusKepegawaian: 'PNS',
    phone: '',
  });

  // Form states for Tendik
  const [staffForm, setStaffForm] = useState<Omit<Staff, 'id'>>({
    name: '',
    nip: '',
    jabatan: '',
    unitKerja: '',
  });

  // Form states for Tim Supervisi
  const [supervisorForm, setSupervisorForm] = useState<Omit<SupervisorMember, 'id'>>({
    name: '',
    nip: '',
    jabatan: '',
    bidangSupervisi: '',
  });

  // Form states for Tahun Pelajaran
  const [yearForm, setYearForm] = useState<Omit<AcademicYearConfig, 'id'>>({
    tahunPelajaran: '2026/2027',
    semester: 'Ganjil',
    isActive: false,
    kepalaSekolah: 'Aryadi, S.Kom',
    nipKepalaSekolah: '19780305 200903 1 002',
    pengawasPembina: 'K.M.Isa, S.Pd., M.Pd',
    nipPengawasPembina: '19680702 199802 1 001',
  });

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const filteredTeachers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return teachers.filter((t) => {
      const matchesStatus =
        statusFilter === 'Semua' || t.statusKepegawaian === statusFilter;
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.nip.toLowerCase().includes(q) ||
        t.mataPelajaran.toLowerCase().includes(q) ||
        t.jabatan.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [teachers, searchQuery, statusFilter]);

  const filteredStaff = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return staff.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nip.toLowerCase().includes(q) ||
        s.jabatan.toLowerCase().includes(q) ||
        s.unitKerja.toLowerCase().includes(q)
    );
  }, [staff, searchQuery]);

  const filteredSupervisors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return supervisors.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nip.toLowerCase().includes(q) ||
        s.jabatan.toLowerCase().includes(q) ||
        s.bidangSupervisi.toLowerCase().includes(q)
    );
  }, [supervisors, searchQuery]);

  const openAddModal = () => {
    setEditingId(null);
    if (activeTab === 'guru') {
      setTeacherForm({
        name: '',
        nip: '',
        nuptk: '',
        pangkatGolongan: '',
        jabatan: 'Guru Mata Pelajaran',
        mataPelajaran: '',
        pendidikanTerakhir: 'S1',
        statusKepegawaian: 'PNS',
        phone: '',
      });
    } else if (activeTab === 'tendik') {
      setStaffForm({ name: '', nip: '', jabatan: '', unitKerja: '' });
    } else if (activeTab === 'tim') {
      setSupervisorForm({ name: '', nip: '', jabatan: '', bidangSupervisi: '' });
    } else {
      setYearForm({
        tahunPelajaran: '2026/2027',
        semester: 'Ganjil',
        isActive: false,
        kepalaSekolah: 'Aryadi, S.Kom',
        nipKepalaSekolah: '19780305 200903 1 002',
        pengawasPembina: 'K.M.Isa, S.Pd., M.Pd',
        nipPengawasPembina: '19680702 199802 1 001',
      });
    }
    setIsModalOpen(true);
  };

  const openEditTeacher = (t: Teacher) => {
    setEditingId(t.id);
    setTeacherForm({ ...t });
    setIsModalOpen(true);
  };

  const openEditStaff = (s: Staff) => {
    setEditingId(s.id);
    setStaffForm({ ...s });
    setIsModalOpen(true);
  };

  const openEditSupervisor = (s: SupervisorMember) => {
    setEditingId(s.id);
    setSupervisorForm({ ...s });
    setIsModalOpen(true);
  };

  const openEditYear = (y: AcademicYearConfig) => {
    setEditingId(y.id);
    setYearForm({ ...y });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'guru') {
      if (!teacherForm.name.trim()) return;
      if (editingId) {
        onSaveTeachers(
          teachers.map((t) => (t.id === editingId ? { ...teacherForm, id: editingId } : t))
        );
        showToast(`Data guru "${teacherForm.name}" diperbarui.`);
      } else {
        onSaveTeachers([
          ...teachers,
          { ...teacherForm, id: `guru-${Date.now()}` },
        ]);
        showToast(`Guru baru "${teacherForm.name}" ditambahkan.`);
      }
    } else if (activeTab === 'tendik') {
      if (!staffForm.name.trim()) return;
      if (editingId) {
        onSaveStaff(
          staff.map((s) => (s.id === editingId ? { ...staffForm, id: editingId } : s))
        );
        showToast(`Data tenaga kependidikan "${staffForm.name}" diperbarui.`);
      } else {
        onSaveStaff([...staff, { ...staffForm, id: `tu-${Date.now()}` }]);
        showToast(`Tenaga kependidikan "${staffForm.name}" ditambahkan.`);
      }
    } else if (activeTab === 'tim') {
      if (!supervisorForm.name.trim()) return;
      if (editingId) {
        onSaveSupervisors(
          supervisors.map((s) =>
            s.id === editingId ? { ...supervisorForm, id: editingId } : s
          )
        );
        showToast(`Anggota tim supervisi "${supervisorForm.name}" diperbarui.`);
      } else {
        onSaveSupervisors([
          ...supervisors,
          { ...supervisorForm, id: `sup-${Date.now()}` },
        ]);
        showToast(`Anggota tim supervisi "${supervisorForm.name}" ditambahkan.`);
      }
    } else {
      if (!yearForm.tahunPelajaran.trim()) return;
      let nextYears: AcademicYearConfig[];
      if (editingId) {
        nextYears = academicYears.map((y) =>
          y.id === editingId ? { ...yearForm, id: editingId } : y
        );
      } else {
        nextYears = [
          ...academicYears,
          { ...yearForm, id: `ay-${Date.now()}` },
        ];
      }
      if (yearForm.isActive) {
        const targetId = editingId || nextYears[nextYears.length - 1].id;
        nextYears = nextYears.map((y) => ({ ...y, isActive: y.id === targetId }));
      }
      onSaveAcademicYears(nextYears);
      showToast(`Tahun pelajaran ${yearForm.tahunPelajaran} (${yearForm.semester}) disimpan.`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, label: string) => {
    if (activeTab === 'guru') {
      onSaveTeachers(teachers.filter((t) => t.id !== id));
    } else if (activeTab === 'tendik') {
      onSaveStaff(staff.filter((s) => s.id !== id));
    } else if (activeTab === 'tim') {
      onSaveSupervisors(supervisors.filter((s) => s.id !== id));
    } else {
      if (academicYears.length <= 1) {
        showToast('Minimal harus ada 1 tahun pelajaran aktif.');
        return;
      }
      onSaveAcademicYears(academicYears.filter((y) => y.id !== id));
    }
    showToast(`Data "${label}" dihapus.`);
  };

  const handleSetActiveYear = (id: string) => {
    onSaveAcademicYears(
      academicYears.map((y) => ({ ...y, isActive: y.id === id }))
    );
    showToast('Tahun pelajaran & semester aktif berhasil diperbarui.');
  };

  const handleExportExcel = () => {
    if (activeTab === 'guru') {
      exportToExcel(
        teachers.map((t, idx) => ({
          No: idx + 1,
          Nama: t.name,
          NIP: t.nip,
          NUPTK: t.nuptk,
          Pangkat_Golongan: t.pangkatGolongan,
          Jabatan: t.jabatan,
          Mata_Pelajaran: t.mataPelajaran,
          Pendidikan_Terakhir: t.pendidikanTerakhir,
          Status_Kepegawaian: t.statusKepegawaian,
          Nomor_HP: t.phone,
        })),
        'Data Guru',
        'Master_Data_Guru_SMPN8_BatangHari'
      );
    } else if (activeTab === 'tendik') {
      exportToExcel(
        staff.map((s, idx) => ({
          No: idx + 1,
          Nama: s.name,
          NIP: s.nip,
          Jabatan: s.jabatan,
          Unit_Kerja: s.unitKerja,
        })),
        'Tenaga Kependidikan',
        'Master_Tendik_SMPN8_BatangHari'
      );
    } else if (activeTab === 'tim') {
      exportToExcel(
        supervisors.map((s, idx) => ({
          No: idx + 1,
          Nama_Supervisor: s.name,
          NIP: s.nip,
          Jabatan: s.jabatan,
          Bidang_Supervisi: s.bidangSupervisi,
        })),
        'Tim Supervisi',
        'Master_Tim_Supervisi_SMPN8_BatangHari'
      );
    } else {
      exportToExcel(
        academicYears.map((y, idx) => ({
          No: idx + 1,
          Tahun_Pelajaran: y.tahunPelajaran,
          Semester: y.semester,
          Aktif: y.isActive ? 'Ya' : 'Tidak',
          Kepala_Sekolah: y.kepalaSekolah,
          NIP_Kepala_Sekolah: y.nipKepalaSekolah,
          Pengawas_Pembina: y.pengawasPembina,
        })),
        'Tahun Pelajaran',
        'Tahun_Pelajaran_SMPN8_BatangHari'
      );
    }
    showToast('File Excel berhasil diekspor.');
  };

  const handleDownloadTemplate = () => {
    if (activeTab === 'guru') {
      downloadExcelTemplate(
        [
          'Nama',
          'NIP',
          'NUPTK',
          'Pangkat_Golongan',
          'Jabatan',
          'Mata_Pelajaran',
          'Pendidikan_Terakhir',
          'Status_Kepegawaian',
          'Nomor_HP',
        ],
        {
          Nama: 'Contoh Nama Guru, S.Pd',
          NIP: '19850101 201001 1 001',
          NUPTK: '1234567890123456',
          Pangkat_Golongan: 'Penata / III.c',
          Jabatan: 'Guru Muda',
          Mata_Pelajaran: 'Matematika',
          Pendidikan_Terakhir: 'S1 Pendidikan Matematika',
          Status_Kepegawaian: 'PNS',
          Nomor_HP: '0812-0000-0000',
        },
        'Template Guru',
        'Template_Impor_Guru_SMPN8'
      );
    } else if (activeTab === 'tendik') {
      downloadExcelTemplate(
        ['Nama', 'NIP', 'Jabatan', 'Unit_Kerja'],
        {
          Nama: 'Contoh Staf TU',
          NIP: '19880101 201501 1 001',
          Jabatan: 'Staf Administrasi',
          Unit_Kerja: 'Tata Usaha',
        },
        'Template Tendik',
        'Template_Impor_Tendik_SMPN8'
      );
    } else {
      downloadExcelTemplate(
        ['Nama_Supervisor', 'NIP', 'Jabatan', 'Bidang_Supervisi'],
        {
          Nama_Supervisor: 'Contoh Supervisor, S.Pd',
          NIP: '19790101 200501 1 001',
          Jabatan: 'Guru Senior',
          Bidang_Supervisi: 'Supervisi Akademik',
        },
        'Template Tim',
        'Template_Impor_Tim_Supervisi_SMPN8'
      );
    }
    showToast('Template Excel (.xlsx) berhasil diunduh.');
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseExcelFile(file);
      if (rows.length === 0) {
        showToast('File Excel kosong atau format tidak terbaca.');
        return;
      }

      if (activeTab === 'guru') {
        const imported: Teacher[] = rows
          .filter((r) => String(r['Nama'] || r['nama'] || '').trim() !== '')
          .map((r, idx) => {
            const rawStatus = String(
              r['Status_Kepegawaian'] || r['Status'] || 'PNS'
            ).trim();
            const status: EmploymentStatus =
              rawStatus === 'PPPK' || rawStatus === 'Honorer' ? rawStatus : 'PNS';
            return {
              id: `guru-imp-${Date.now()}-${idx}`,
              name: String(r['Nama'] || r['nama'] || '').trim(),
              nip: String(r['NIP'] || r['nip'] || '-').trim(),
              nuptk: String(r['NUPTK'] || r['nuptk'] || '-').trim(),
              pangkatGolongan: String(
                r['Pangkat_Golongan'] || r['Pangkat'] || '-'
              ).trim(),
              jabatan: String(r['Jabatan'] || 'Guru Mata Pelajaran').trim(),
              mataPelajaran: String(
                r['Mata_Pelajaran'] || r['Mapel'] || '-'
              ).trim(),
              pendidikanTerakhir: String(
                r['Pendidikan_Terakhir'] || 'S1'
              ).trim(),
              statusKepegawaian: status,
              phone: String(r['Nomor_HP'] || r['HP'] || '-').trim(),
            };
          });
        if (imported.length > 0) {
          onSaveTeachers([...teachers, ...imported]);
          showToast(`${imported.length} data guru berhasil diimpor dari Excel.`);
        }
      } else if (activeTab === 'tendik') {
        const imported: Staff[] = rows
          .filter((r) => String(r['Nama'] || '').trim() !== '')
          .map((r, idx) => ({
            id: `tu-imp-${Date.now()}-${idx}`,
            name: String(r['Nama'] || '').trim(),
            nip: String(r['NIP'] || '-').trim(),
            jabatan: String(r['Jabatan'] || 'Staf TU').trim(),
            unitKerja: String(r['Unit_Kerja'] || 'Tata Usaha').trim(),
          }));
        if (imported.length > 0) {
          onSaveStaff([...staff, ...imported]);
          showToast(`${imported.length} data tenaga kependidikan diimpor.`);
        }
      } else if (activeTab === 'tim') {
        const imported: SupervisorMember[] = rows
          .filter((r) => String(r['Nama_Supervisor'] || r['Nama'] || '').trim() !== '')
          .map((r, idx) => ({
            id: `sup-imp-${Date.now()}-${idx}`,
            name: String(r['Nama_Supervisor'] || r['Nama'] || '').trim(),
            nip: String(r['NIP'] || '-').trim(),
            jabatan: String(r['Jabatan'] || 'Supervisor').trim(),
            bidangSupervisi: String(
              r['Bidang_Supervisi'] || 'Supervisi Akademik'
            ).trim(),
          }));
        if (imported.length > 0) {
          onSaveSupervisors([...supervisors, ...imported]);
          showToast(`${imported.length} anggota tim supervisi diimpor.`);
        }
      }
    } catch {
      showToast('Gagal membaca file Excel. Pastikan format .xlsx atau .csv valid.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-gradient-to-b from-emerald-50/80 via-green-50/60 to-lime-50/50 min-h-full">
      {/* Feedback Alert */}
      {feedbackMsg && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-[#DCFCE7] px-4 py-2.5 text-xs font-semibold text-emerald-950 shadow-xs">
          <span>{feedbackMsg}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-emerald-800 hover:text-emerald-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs & Action Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            {[
              { id: 'guru' as MasterTab, label: `Data Guru (${teachers.length})` },
              { id: 'tendik' as MasterTab, label: `Tenaga Kependidikan (${staff.length})` },
              { id: 'tim' as MasterTab, label: `Tim Supervisi (${supervisors.length})` },
              { id: 'tahun' as MasterTab, label: `Tahun Pelajaran (${academicYears.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Excel & Add Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {activeTab !== 'tahun' && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportExcel}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 whitespace-nowrap shrink-0"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Template Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 whitespace-nowrap shrink-0"
                >
                  <Upload className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Impor Excel</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleExportExcel}
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
              <span>Tambah Data</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Row */}
        {activeTab !== 'tahun' && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-3">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NIP, jabatan, atau mata pelajaran..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>

            {activeTab === 'guru' && (
              <div className="flex items-center gap-1.5">
                {(['Semua', 'PNS', 'PPPK', 'Honorer'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {activeTab === 'guru' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#DCFCE7] text-emerald-950">
                  <th className="px-3.5 py-3 font-semibold">No</th>
                  <th className="px-3.5 py-3 font-semibold">Nama Lengkap</th>
                  <th className="px-3.5 py-3 font-semibold">NIP / NUPTK</th>
                  <th className="px-3.5 py-3 font-semibold">Pangkat / Gol.</th>
                  <th className="px-3.5 py-3 font-semibold">Jabatan</th>
                  <th className="px-3.5 py-3 font-semibold">Mata Pelajaran</th>
                  <th className="px-3.5 py-3 font-semibold">Pendidikan</th>
                  <th className="px-3.5 py-3 font-semibold">Status</th>
                  <th className="px-3.5 py-3 font-semibold">Nomor HP</th>
                  <th className="px-3.5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t, index) => (
                  <tr key={t.id} className="hover:bg-emerald-50/50">
                    <td className="px-3.5 py-2.5 font-mono text-slate-500 tabular-nums">
                      {index + 1}
                    </td>
                    <td className="px-3.5 py-2.5 font-semibold text-emerald-950 whitespace-nowrap">
                      {t.name}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-700 tabular-nums whitespace-nowrap">
                      <div>NIP: {t.nip}</div>
                      <div className="text-slate-400">NUPTK: {t.nuptk}</div>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap">
                      {t.pangkatGolongan}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-700">{t.jabatan}</td>
                    <td className="px-3.5 py-2.5 font-medium text-slate-800">
                      {t.mataPelajaran}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600">
                      {t.pendidikanTerakhir}
                    </td>
                    <td className="px-3.5 py-2.5 font-semibold text-slate-700 whitespace-nowrap">
                      {t.statusKepegawaian}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-600 tabular-nums whitespace-nowrap">
                      {t.phone}
                    </td>
                    <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditTeacher(t)}
                        aria-label={`Edit ${t.name}`}
                        className="mr-1.5 rounded p-1.5 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id, t.name)}
                        aria-label={`Hapus ${t.name}`}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data guru yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tendik' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#DCFCE7] text-emerald-950">
                  <th className="px-4 py-3 font-semibold">No</th>
                  <th className="px-4 py-3 font-semibold">Nama Lengkap</th>
                  <th className="px-4 py-3 font-semibold">NIP</th>
                  <th className="px-4 py-3 font-semibold">Jabatan</th>
                  <th className="px-4 py-3 font-semibold">Unit Kerja</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-emerald-50/50">
                    <td className="px-4 py-2.5 font-mono text-slate-500 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-950">
                      {s.name}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-700 tabular-nums">
                      {s.nip}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{s.jabatan}</td>
                    <td className="px-4 py-2.5 text-slate-600">{s.unitKerja}</td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditStaff(s)}
                        aria-label={`Edit ${s.name}`}
                        className="mr-1.5 rounded p-1.5 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, s.name)}
                        aria-label={`Hapus ${s.name}`}
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
        )}

        {activeTab === 'tim' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#DCFCE7] text-emerald-950">
                  <th className="px-4 py-3 font-semibold">No</th>
                  <th className="px-4 py-3 font-semibold">Nama Supervisor</th>
                  <th className="px-4 py-3 font-semibold">NIP</th>
                  <th className="px-4 py-3 font-semibold">Jabatan</th>
                  <th className="px-4 py-3 font-semibold">Bidang Supervisi</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSupervisors.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-emerald-50/50">
                    <td className="px-4 py-2.5 font-mono text-slate-500 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-950">
                      {s.name}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-700 tabular-nums">
                      {s.nip}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{s.jabatan}</td>
                    <td className="px-4 py-2.5 text-slate-600">{s.bidangSupervisi}</td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditSupervisor(s)}
                        aria-label={`Edit ${s.name}`}
                        className="mr-1.5 rounded p-1.5 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, s.name)}
                        aria-label={`Hapus ${s.name}`}
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
        )}

        {activeTab === 'tahun' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#DCFCE7] text-emerald-950">
                  <th className="px-4 py-3 font-semibold">Tahun Pelajaran</th>
                  <th className="px-4 py-3 font-semibold">Semester</th>
                  <th className="px-4 py-3 font-semibold">Kepala Sekolah</th>
                  <th className="px-4 py-3 font-semibold">Pengawas Pembina</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {academicYears.map((y) => (
                  <tr key={y.id} className="hover:bg-emerald-50/50">
                    <td className="px-4 py-3 font-display font-bold text-emerald-950 tabular-nums">
                      {y.tahunPelajaran}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      Semester {y.semester}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-semibold">{y.kepalaSekolah}</div>
                      <div className="font-mono text-[11px] text-slate-500">
                        NIP. {y.nipKepalaSekolah}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-semibold">{y.pengawasPembina}</div>
                      <div className="font-mono text-[11px] text-slate-500">
                        NIP. {y.nipPengawasPembina}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {y.isActive ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                          Aktif
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetActiveYear(y.id)}
                          className="rounded border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-emerald-600 hover:text-emerald-950"
                        >
                          Aktifkan
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditYear(y)}
                        aria-label={`Edit ${y.tahunPelajaran}`}
                        className="mr-1.5 rounded p-1.5 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(y.id, `${y.tahunPelajaran} ${y.semester}`)
                        }
                        aria-label={`Hapus ${y.tahunPelajaran}`}
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
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <h3 className="font-display text-base font-bold text-emerald-950">
                {editingId ? 'Edit Data' : 'Tambah Data Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-3.5 text-xs">
              {activeTab === 'guru' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block font-semibold text-slate-700">
                      Nama Lengkap & Gelar
                    </label>
                    <input
                      required
                      type="text"
                      value={teacherForm.name}
                      onChange={(e) =>
                        setTeacherForm({ ...teacherForm, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">NIP</label>
                    <input
                      type="text"
                      value={teacherForm.nip}
                      onChange={(e) =>
                        setTeacherForm({ ...teacherForm, nip: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">NUPTK</label>
                    <input
                      type="text"
                      value={teacherForm.nuptk}
                      onChange={(e) =>
                        setTeacherForm({ ...teacherForm, nuptk: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Pangkat / Golongan
                    </label>
                    <input
                      type="text"
                      value={teacherForm.pangkatGolongan}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          pangkatGolongan: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Jabatan
                    </label>
                    <input
                      type="text"
                      value={teacherForm.jabatan}
                      onChange={(e) =>
                        setTeacherForm({ ...teacherForm, jabatan: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Mata Pelajaran
                    </label>
                    <input
                      required
                      type="text"
                      value={teacherForm.mataPelajaran}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          mataPelajaran: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Pendidikan Terakhir
                    </label>
                    <input
                      type="text"
                      value={teacherForm.pendidikanTerakhir}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          pendidikanTerakhir: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Status Kepegawaian
                    </label>
                    <select
                      value={teacherForm.statusKepegawaian}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          statusKepegawaian: e.target.value as EmploymentStatus,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="PNS">PNS</option>
                      <option value="PPPK">PPPK</option>
                      <option value="Honorer">Honorer</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Nomor HP
                    </label>
                    <input
                      type="text"
                      value={teacherForm.phone}
                      onChange={(e) =>
                        setTeacherForm({ ...teacherForm, phone: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'tendik' && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">Nama</label>
                    <input
                      required
                      type="text"
                      value={staffForm.name}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">NIP</label>
                    <input
                      type="text"
                      value={staffForm.nip}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, nip: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">Jabatan</label>
                    <input
                      required
                      type="text"
                      value={staffForm.jabatan}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, jabatan: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Unit Kerja
                    </label>
                    <input
                      required
                      type="text"
                      value={staffForm.unitKerja}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, unitKerja: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'tim' && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Nama Supervisor
                    </label>
                    <input
                      required
                      type="text"
                      value={supervisorForm.name}
                      onChange={(e) =>
                        setSupervisorForm({ ...supervisorForm, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">NIP</label>
                    <input
                      type="text"
                      value={supervisorForm.nip}
                      onChange={(e) =>
                        setSupervisorForm({ ...supervisorForm, nip: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">Jabatan</label>
                    <input
                      required
                      type="text"
                      value={supervisorForm.jabatan}
                      onChange={(e) =>
                        setSupervisorForm({ ...supervisorForm, jabatan: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Bidang Supervisi
                    </label>
                    <input
                      required
                      type="text"
                      value={supervisorForm.bidangSupervisi}
                      onChange={(e) =>
                        setSupervisorForm({
                          ...supervisorForm,
                          bidangSupervisi: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'tahun' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Tahun Pelajaran
                    </label>
                    <input
                      required
                      type="text"
                      value={yearForm.tahunPelajaran}
                      onChange={(e) =>
                        setYearForm({ ...yearForm, tahunPelajaran: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Semester
                    </label>
                    <select
                      value={yearForm.semester}
                      onChange={(e) =>
                        setYearForm({
                          ...yearForm,
                          semester: e.target.value as 'Ganjil' | 'Genap',
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Kepala Sekolah
                    </label>
                    <input
                      required
                      type="text"
                      value={yearForm.kepalaSekolah}
                      onChange={(e) =>
                        setYearForm({ ...yearForm, kepalaSekolah: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      NIP Kepala Sekolah
                    </label>
                    <input
                      required
                      type="text"
                      value={yearForm.nipKepalaSekolah}
                      onChange={(e) =>
                        setYearForm({
                          ...yearForm,
                          nipKepalaSekolah: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Pengawas Pembina
                    </label>
                    <input
                      required
                      type="text"
                      value={yearForm.pengawasPembina}
                      onChange={(e) =>
                        setYearForm({ ...yearForm, pengawasPembina: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      NIP Pengawas
                    </label>
                    <input
                      required
                      type="text"
                      value={yearForm.nipPengawasPembina}
                      onChange={(e) =>
                        setYearForm({
                          ...yearForm,
                          nipPengawasPembina: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                    <input
                      id="active-year-checkbox"
                      type="checkbox"
                      checked={yearForm.isActive}
                      onChange={(e) =>
                        setYearForm({ ...yearForm, isActive: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                    />
                    <label
                      htmlFor="active-year-checkbox"
                      className="font-medium text-slate-700"
                    >
                      Jadikan Tahun Pelajaran & Semester Aktif
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
