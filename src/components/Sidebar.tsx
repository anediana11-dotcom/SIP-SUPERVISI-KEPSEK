import React from 'react';
import {
  CalendarDays,
  ClipboardCheck,
  Database,
  FileSpreadsheet,
  FolderKanban,
  LayoutDashboard,
  ShieldCheck,
  X,
} from 'lucide-react';
import { SCHOOL_ASSETS, SCHOOL_IDENTITY } from '../data/initialData';
import { AcademicYearConfig, ActiveView, UserRole } from '../types/supervision';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  activeYear: AcademicYearConfig;
  userRole: UserRole;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: {
  id: ActiveView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
  { id: 'master-data', label: 'Master Data', icon: Database },
  { id: 'programs', label: 'Program Supervisi', icon: FolderKanban },
  { id: 'schedule', label: 'Jadwal Supervisi', icon: CalendarDays },
  { id: 'academic-instrument', label: 'Instrumen Akademik', icon: ClipboardCheck },
  { id: 'managerial-instrument', label: 'Instrumen Manajerial', icon: ShieldCheck },
  { id: 'reports', label: 'Laporan & Cetak A4', icon: FileSpreadsheet },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  activeYear,
  userRole,
  isOpenMobile,
  onCloseMobile,
}) => {
  const handleNavClick = (view: ActiveView) => {
    onSelectView(view);
    onCloseMobile();
  };

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-emerald-950/50 backdrop-blur-xs lg:hidden no-print"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 flex w-[264px] shrink-0 flex-col border-r border-emerald-200 bg-[#DCFCE7] text-emerald-950 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Identity Header */}
        <div className="flex items-center justify-between gap-3 border-b border-emerald-200 px-5 py-4 bg-emerald-100/70">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={SCHOOL_ASSETS.logoSekolah}
              alt="Logo SMP Negeri 8 Batang Hari"
              referrerPolicy="no-referrer"
              className="h-10 w-10 shrink-0 rounded-lg bg-white p-1 object-contain border border-emerald-200"
            />
            <div className="min-w-0">
              <div className="font-display text-sm font-bold tracking-tight text-emerald-950 truncate">
                {SCHOOL_IDENTITY.appName}
              </div>
              <div className="text-[11px] font-medium text-emerald-800 truncate">
                SMPN 8 Batang Hari
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu navigasi"
            className="rounded-lg p-1.5 text-emerald-900 hover:bg-emerald-200/70 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-emerald-900 hover:bg-emerald-200/70 hover:text-emerald-950'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-emerald-700'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Institutional Footer Context */}
        <div className="border-t border-emerald-200 bg-emerald-200/55 px-4 py-3.5 text-xs">
          <div className="flex items-center gap-2.5">
            <img
              src={SCHOOL_ASSETS.logoPemkab}
              alt="Logo Pemkab Batang Hari"
              referrerPolicy="no-referrer"
              className="h-8 w-8 shrink-0 rounded bg-white p-0.5 object-contain border border-emerald-200"
            />
            <div className="min-w-0">
              <div className="font-semibold text-emerald-950 truncate">
                TP {activeYear.tahunPelajaran} · {activeYear.semester}
              </div>
              <div className="text-[11px] text-emerald-800 truncate">
                Peran: {userRole}
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-emerald-300/60 text-[11px] text-emerald-800">
            NPSN {SCHOOL_IDENTITY.npsn} · Kab. Batang Hari
          </div>
        </div>
      </aside>
    </>
  );
};
