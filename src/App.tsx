import { useEffect, useMemo, useState } from 'react';
import { AcademicInstrumentView } from './components/AcademicInstrumentView';
import { DashboardView } from './components/DashboardView';
import { ManagerialInstrumentView } from './components/ManagerialInstrumentView';
import { MasterDataView } from './components/MasterDataView';
import { ProgramView } from './components/ProgramView';
import { ReportsView } from './components/ReportsView';
import { ScheduleView } from './components/ScheduleView';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import {
  INITIAL_ACADEMIC_ASSESSMENTS,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_FINAL_EVALUATION,
  INITIAL_MANAGERIAL_ASSESSMENTS,
  INITIAL_PROGRAMS,
  INITIAL_SCHEDULES,
  INITIAL_STAFF,
  INITIAL_SUPERVISORS,
  INITIAL_TEACHERS,
} from './data/initialData';
import {
  AcademicAssessment,
  AcademicYearConfig,
  ActiveView,
  FinalEvaluationNote,
  ManagerialAssessment,
  ScheduleItem,
  Staff,
  SupervisionProgram,
  SupervisorMember,
  Teacher,
  UserRole,
} from './types/supervision';

function usePersistedState<T>(key: string, initialValue: T): [T, (val: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw) as T;
      }
    } catch {
      // ignore storage errors
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [key, state]);

  return [state, setState];
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('Kepala Sekolah');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Domain State persisted in localStorage
  const [teachers, setTeachers] = usePersistedState<Teacher[]>(
    'sip_smpn8_teachers_v1',
    INITIAL_TEACHERS
  );
  const [staff, setStaff] = usePersistedState<Staff[]>(
    'sip_smpn8_staff_v1',
    INITIAL_STAFF
  );
  const [supervisors, setSupervisors] = usePersistedState<SupervisorMember[]>(
    'sip_smpn8_supervisors_v1',
    INITIAL_SUPERVISORS
  );
  const [academicYears, setAcademicYears] = usePersistedState<AcademicYearConfig[]>(
    'sip_smpn8_years_v1',
    INITIAL_ACADEMIC_YEARS
  );
  const [programs, setPrograms] = usePersistedState<SupervisionProgram[]>(
    'sip_smpn8_programs_v1',
    INITIAL_PROGRAMS
  );
  const [schedules, setSchedules] = usePersistedState<ScheduleItem[]>(
    'sip_smpn8_schedules_v1',
    INITIAL_SCHEDULES
  );
  const [academicAssessments, setAcademicAssessments] = usePersistedState<
    AcademicAssessment[]
  >('sip_smpn8_academic_assessments_v1', INITIAL_ACADEMIC_ASSESSMENTS);
  const [managerialAssessments, setManagerialAssessments] = usePersistedState<
    ManagerialAssessment[]
  >('sip_smpn8_managerial_assessments_v1', INITIAL_MANAGERIAL_ASSESSMENTS);
  const [finalEvaluation, setFinalEvaluation] = usePersistedState<FinalEvaluationNote>(
    'sip_smpn8_final_eval_v1',
    INITIAL_FINAL_EVALUATION
  );

  // Cross-view handoff states
  const [selectedCycleMonthIndex, setSelectedCycleMonthIndex] = useState<number>(4); // Nov 2026
  const [prefillSchedule, setPrefillSchedule] = useState<ScheduleItem | null>(null);
  const [printAcademicId, setPrintAcademicId] = useState<string | null>(null);
  const [printManagerialId, setPrintManagerialId] = useState<string | null>(null);
  const [openRekapSignal, setOpenRekapSignal] = useState<number>(0);

  const activeYear = useMemo(
    () => academicYears.find((y) => y.isActive) || academicYears[0],
    [academicYears]
  );

  const handleStartAssessmentFromSchedule = (schedule: ScheduleItem) => {
    setPrefillSchedule(schedule);
    if (schedule.supervisionType === 'Akademik') {
      setActiveView('academic-instrument');
    } else {
      setActiveView('managerial-instrument');
    }
  };

  const handleSelectCycleMonth = (monthIndex: number) => {
    setSelectedCycleMonthIndex(monthIndex);
    setActiveView('schedule');
  };

  const handleSaveAcademicAssessment = (
    assessment: AcademicAssessment,
    scheduleId?: string
  ) => {
    const exists = academicAssessments.some((a) => a.id === assessment.id);
    const next = exists
      ? academicAssessments.map((a) => (a.id === assessment.id ? assessment : a))
      : [assessment, ...academicAssessments];
    setAcademicAssessments(next);

    if (scheduleId) {
      setSchedules(
        schedules.map((s) =>
          s.id === scheduleId ? { ...s, status: 'Terlaksana' } : s
        )
      );
    }
  };

  const handleSaveManagerialAssessment = (
    assessment: ManagerialAssessment,
    scheduleId?: string
  ) => {
    const exists = managerialAssessments.some((a) => a.id === assessment.id);
    const next = exists
      ? managerialAssessments.map((a) => (a.id === assessment.id ? assessment : a))
      : [assessment, ...managerialAssessments];
    setManagerialAssessments(next);

    if (scheduleId) {
      setSchedules(
        schedules.map((s) =>
          s.id === scheduleId ? { ...s, status: 'Terlaksana' } : s
        )
      );
    }
  };

  const handlePrintAcademic = (id: string) => {
    setPrintManagerialId(null);
    setPrintAcademicId(id);
    setActiveView('reports');
  };

  const handlePrintManagerial = (id: string) => {
    setPrintAcademicId(null);
    setPrintManagerialId(id);
    setActiveView('reports');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        activeYear={activeYear}
        userRole={userRole}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          activeView={activeView}
          userRole={userRole}
          onChangeRole={setUserRole}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigateReports={() => setActiveView('reports')}
        />

        <main className="flex-1">
          {activeView === 'dashboard' && (
            <DashboardView
              activeYear={activeYear}
              teachers={teachers}
              programs={programs}
              schedules={schedules}
              academicAssessments={academicAssessments}
              managerialAssessments={managerialAssessments}
              finalEvaluation={finalEvaluation}
              onNavigate={setActiveView}
              onStartAssessmentFromSchedule={handleStartAssessmentFromSchedule}
              onSelectCycleMonth={handleSelectCycleMonth}
              onOpenFinalEvaluationReport={() => {
                setPrintAcademicId(null);
                setPrintManagerialId(null);
                setOpenRekapSignal((n) => n + 1);
                setActiveView('reports');
              }}
            />
          )}

          {activeView === 'master-data' && (
            <MasterDataView
              teachers={teachers}
              onSaveTeachers={setTeachers}
              staff={staff}
              onSaveStaff={setStaff}
              supervisors={supervisors}
              onSaveSupervisors={setSupervisors}
              academicYears={academicYears}
              onSaveAcademicYears={setAcademicYears}
            />
          )}

          {activeView === 'programs' && (
            <ProgramView programs={programs} onSavePrograms={setPrograms} />
          )}

          {activeView === 'schedule' && (
            <ScheduleView
              activeYear={activeYear}
              schedules={schedules}
              onSaveSchedules={setSchedules}
              teachers={teachers}
              supervisors={supervisors}
              programs={programs}
              selectedCycleMonthIndex={selectedCycleMonthIndex}
              onChangeCycleMonthIndex={setSelectedCycleMonthIndex}
              onStartAssessment={handleStartAssessmentFromSchedule}
            />
          )}

          {activeView === 'academic-instrument' && (
            <AcademicInstrumentView
              teachers={teachers}
              supervisors={supervisors}
              assessments={academicAssessments}
              onSaveAssessment={handleSaveAcademicAssessment}
              onDeleteAssessment={(id) =>
                setAcademicAssessments(
                  academicAssessments.filter((a) => a.id !== id)
                )
              }
              prefillSchedule={prefillSchedule}
              onClearPrefill={() => setPrefillSchedule(null)}
              onPrintAssessment={handlePrintAcademic}
            />
          )}

          {activeView === 'managerial-instrument' && (
            <ManagerialInstrumentView
              supervisors={supervisors}
              assessments={managerialAssessments}
              onSaveAssessment={handleSaveManagerialAssessment}
              onDeleteAssessment={(id) =>
                setManagerialAssessments(
                  managerialAssessments.filter((a) => a.id !== id)
                )
              }
              prefillSchedule={prefillSchedule}
              onClearPrefill={() => setPrefillSchedule(null)}
              onPrintAssessment={handlePrintManagerial}
            />
          )}

          {activeView === 'reports' && (
            <ReportsView
              activeYear={activeYear}
              academicAssessments={academicAssessments}
              managerialAssessments={managerialAssessments}
              programs={programs}
              schedules={schedules}
              finalEvaluation={finalEvaluation}
              onSaveFinalEvaluation={setFinalEvaluation}
              preselectedAcademicId={printAcademicId}
              preselectedManagerialId={printManagerialId}
              openRekapSignal={openRekapSignal}
            />
          )}
        </main>
      </div>
    </div>
  );
}
