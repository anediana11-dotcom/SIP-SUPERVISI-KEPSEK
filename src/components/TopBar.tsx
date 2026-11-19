import React from 'react';
import { Menu, Printer } from 'lucide-react';
import { ActiveView, UserRole } from '../types/supervision';

interface TopBarProps {
  activeView: ActiveView;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onOpenMobileMenu: () => void;
  onNavigateReports: () => void;
}

const VIEW_TITLES: Record<ActiveView, string> = {
  dashboard: 'Dashboard Supervisi Kepala Sekolah',
  'master-data': 'Master Data Sekolah',
  programs: 'Program Supervisi Akademik & Manajerial',
  schedule: 'Jadwal Kegiatan Supervisi',
  'academic-instrument': 'Instrumen Supervisi Akademik',
  'managerial-instrument': 'Instrumen Supervisi Manajerial',
  reports: 'Laporan & Cetak Kedinasan A4',
};

const ROLES: UserRole[] = [
  'Kepala Sekolah',
  'Wakil Kepala Sekolah',
  'Guru',
  'Kepala Tata Usaha',
  'Tim Supervisi',
];

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  userRole,
  onChangeRole,
  onOpenMobileMenu,
  onNavigateReports,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-emerald-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6">
      {/* Zone 1: Menu toggle + Single-line Breadcrumb / View Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Buka menu navigasi"
          className="rounded-lg border border-emerald-200 p-2 text-emerald-900 hover:bg-emerald-50 lg:hidden shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-base font-bold text-emerald-950 sm:text-lg truncate">
            {VIEW_TITLES[activeView]}
          </h1>
        </div>
      </div>

      {/* Zone 2: Concise Role Switcher */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <label htmlFor="role-selector" className="text-xs font-medium text-slate-600 whitespace-nowrap">
          Akses Pengguna:
        </label>
        <select
          id="role-selector"
          value={userRole}
          onChange={(e) => onChangeRole(e.target.value as UserRole)}
          className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-950 focus:border-emerald-600 focus:outline-none"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Zone 3: 1 Primary Action CTA */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onNavigateReports}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700 whitespace-nowrap shrink-0"
        >
          <Printer className="h-4 w-4 shrink-0" />
          <span>Cetak Laporan</span>
        </button>
      </div>
    </header>
  );
};
