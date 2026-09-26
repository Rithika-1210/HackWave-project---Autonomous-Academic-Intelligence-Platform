import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

// Layout
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Pages
import { LandingPage } from '@/pages/landing/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { HodDashboard } from '@/pages/hod/HodDashboard';
import { FacultyDashboard } from '@/pages/faculty/FacultyDashboard';
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { ExamCellDashboard } from '@/pages/examination/ExamCellDashboard';
import { DepartmentManagement } from '@/pages/departments/DepartmentManagement';
import { FacultyManagement } from '@/pages/faculty-management/FacultyManagement';
import { StudentManagement } from '@/pages/student-management/StudentManagement';
import { CourseSubjectManagement } from '@/pages/courses/CourseSubjectManagement';
import { ResourceManagement } from '@/pages/resources/ResourceManagement';
import { TimetableManagement } from '@/pages/timetables/TimetableManagement';
import { ExaminationManagement } from '@/pages/examinations/ExaminationManagement';
import { NotificationCenter } from '@/pages/notifications/NotificationCenter';
import { UserManagement } from '@/pages/admin/UserManagement';
import { UserProfilePage } from '@/pages/profile/UserProfilePage';

// Stage 2 & Stage 3 AI & Digital Twin Pages
import { AiTimetableGenerator } from '@/pages/ai/AiTimetableGenerator';
import { TimetableOptimizationResults } from '@/pages/ai/TimetableOptimizationResults';
import { ConflictPredictionDashboard } from '@/pages/ai/ConflictPredictionDashboard';
import { ConflictResolutionCenter } from '@/pages/ai/ConflictResolutionCenter';
import { DynamicReschedulingCenter } from '@/pages/ai/DynamicReschedulingCenter';
import { FacultyWorkloadOptimization } from '@/pages/ai/FacultyWorkloadOptimization';
import { ResourceOptimization } from '@/pages/ai/ResourceOptimization';
import { AiRecommendationCenter } from '@/pages/ai/AiRecommendationCenter';
import { ExamTimetableOptimizer } from '@/pages/ai/ExamTimetableOptimizer';
import { DigitalTwinDashboard } from '@/pages/ai/DigitalTwinDashboard';
import { AcademicCopilot } from '@/pages/ai/AcademicCopilot';
import { PredictiveRiskDashboard } from '@/pages/ai/PredictiveRiskDashboard';
import { ScheduleApprovalCenter } from '@/pages/ai/ScheduleApprovalCenter';
import { ScenarioComparison } from '@/pages/ai/ScenarioComparison';
import { AdvancedAnalyticsDashboard } from '@/pages/ai/AdvancedAnalyticsDashboard';
import { AiExplanationCenter } from '@/pages/ai/AiExplanationCenter';
import { ChangeHistoryRollback } from '@/pages/ai/ChangeHistoryRollback';
import { AiOptimizationHub } from '@/pages/ai/AiOptimizationHub';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized for this specific page, redirect to their role home dashboard
    switch (user.role) {
      case 'admin': return <Navigate to="/dashboard/admin" replace />;
      case 'hod': return <Navigate to="/dashboard/hod" replace />;
      case 'faculty': return <Navigate to="/dashboard/faculty" replace />;
      case 'student': return <Navigate to="/dashboard/student" replace />;
      case 'exam_cell': return <Navigate to="/dashboard/exam_cell" replace />;
      default: return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Dashboard Pages */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Role-Specific Dashboards */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/hod"
          element={
            <ProtectedRoute allowedRoles={['admin', 'hod']}>
              <HodDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/faculty"
          element={
            <ProtectedRoute allowedRoles={['admin', 'hod', 'faculty']}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute allowedRoles={['admin', 'student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/exam_cell"
          element={
            <ProtectedRoute allowedRoles={['admin', 'exam_cell']}>
              <ExamCellDashboard />
            </ProtectedRoute>
          }
        />

        {/* Academic Management Modules */}
        <Route path="/departments" element={<DepartmentManagement />} />
        <Route path="/faculty" element={<FacultyManagement />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/courses" element={<CourseSubjectManagement />} />
        <Route path="/resources" element={<ResourceManagement />} />
        <Route path="/timetables" element={<TimetableManagement />} />
        <Route path="/examinations" element={<ExaminationManagement />} />
        <Route path="/notifications" element={<NotificationCenter />} />
        <Route path="/profile" element={<UserProfilePage />} />

        {/* Administrator-Only User Management */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Stage 2 & Stage 3: AI & Academic Intelligence Routes */}
        <Route path="/ai" element={<AiOptimizationHub />} />
        <Route path="/ai/optimization" element={<AiOptimizationHub />} />
        <Route path="/ai/hub" element={<AiOptimizationHub />} />
        <Route path="/ai/timetable-generator" element={<AiTimetableGenerator />} />
        <Route path="/ai/optimization-results" element={<TimetableOptimizationResults />} />
        <Route path="/ai/conflicts" element={<ConflictPredictionDashboard />} />
        <Route path="/ai/conflict-resolution" element={<ConflictResolutionCenter />} />
        <Route path="/ai/rescheduling" element={<DynamicReschedulingCenter />} />
        <Route path="/ai/workload" element={<FacultyWorkloadOptimization />} />
        <Route path="/ai/resources-optimization" element={<ResourceOptimization />} />
        <Route path="/ai/recommendations" element={<AiRecommendationCenter />} />
        <Route path="/ai/exam-optimizer" element={<ExamTimetableOptimizer />} />
        <Route path="/ai/digital-twin" element={<DigitalTwinDashboard />} />
        <Route path="/ai/scenario-comparison" element={<ScenarioComparison />} />
        <Route path="/ai/copilot" element={<AcademicCopilot />} />
        <Route path="/ai/risk-analysis" element={<PredictiveRiskDashboard />} />
        <Route path="/ai/predictive-risks" element={<PredictiveRiskDashboard />} />
        <Route path="/ai/analytics" element={<AdvancedAnalyticsDashboard />} />
        <Route path="/ai/xai" element={<AiExplanationCenter />} />
        <Route path="/ai/xai-explainer" element={<AiExplanationCenter />} />
        <Route path="/ai/approvals" element={<ScheduleApprovalCenter />} />
        <Route path="/ai/change-history" element={<ChangeHistoryRollback />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
