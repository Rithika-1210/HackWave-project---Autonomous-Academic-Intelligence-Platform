import axios from 'axios';
import {
  User, Department, Faculty, Student, Course, Subject, Classroom,
  TimetableEntry, Examination, NotificationItem,
  AdminStats, HodStats, FacultyStats, StudentStats, ExamCellStats
} from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aaip_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle Unauthorized Expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if on the login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('aaip_token');
        localStorage.removeItem('aaip_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --------------------------------------------------------------------------
// Auth Services
// --------------------------------------------------------------------------
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; token_type: string; user: User }>('/auth/login', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Department Services
// --------------------------------------------------------------------------
export const departmentsApi = {
  getAll: async (params?: { status_filter?: string; search?: string }) => {
    const res = await api.get<Department[]>('/departments', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<Department>(`/departments/${id}`);
    return res.data;
  },
  create: async (data: Partial<Department>) => {
    const res = await api.post<Department>('/departments', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Department>) => {
    const res = await api.put<Department>(`/departments/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Faculty Services
// --------------------------------------------------------------------------
export const facultyApi = {
  getAll: async (params?: { department_id?: number; status_filter?: string; search?: string }) => {
    const res = await api.get<Faculty[]>('/faculty', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<Faculty>(`/faculty/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post<Faculty>('/faculty', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Faculty>) => {
    const res = await api.put<Faculty>(`/faculty/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/faculty/${id}`);
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Student Services
// --------------------------------------------------------------------------
export const studentsApi = {
  getAll: async (params?: { department_id?: number; course_id?: number; semester?: number; batch?: string; search?: string }) => {
    const res = await api.get<Student[]>('/students', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<Student>(`/students/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post<Student>('/students', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Student>) => {
    const res = await api.put<Student>(`/students/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/students/${id}`);
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Course Services
// --------------------------------------------------------------------------
export const coursesApi = {
  getAll: async (params?: { department_id?: number; status_filter?: string }) => {
    const res = await api.get<Course[]>('/courses', { params });
    return res.data;
  },
  create: async (data: Partial<Course>) => {
    const res = await api.post<Course>('/courses', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Course>) => {
    const res = await api.put<Course>(`/courses/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/courses/${id}`);
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Subject Services
// --------------------------------------------------------------------------
export const subjectsApi = {
  getAll: async (params?: { department_id?: number; course_id?: number; semester?: number; search?: string; status_filter?: string }) => {
    const res = await api.get<Subject[]>('/subjects', { params });
    return res.data;
  },

  create: async (data: Partial<Subject>) => {
    const res = await api.post<Subject>('/subjects', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Subject>) => {
    const res = await api.put<Subject>(`/subjects/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/subjects/${id}`);
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Classroom & Lab Resource Services
// --------------------------------------------------------------------------
export const resourcesApi = {
  getAll: async (params?: { resource_type?: string; availability_status?: string; search?: string }) => {
    const res = await api.get<Classroom[]>('/resources', { params });
    return res.data;
  },
  create: async (data: Partial<Classroom>) => {
    const res = await api.post<Classroom>('/resources', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Classroom>) => {
    const res = await api.put<Classroom>(`/resources/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/resources/${id}`);
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Timetable Services
// --------------------------------------------------------------------------
export const timetablesApi = {
  getEntries: async (params?: { department_id?: number; course_id?: number; semester?: number; batch?: string; faculty_id?: number; classroom_id?: number; day_of_week?: string }) => {
    const res = await api.get<TimetableEntry[]>('/timetables', { params });
    return res.data;
  },
  createEntry: async (data: Partial<TimetableEntry>) => {
    const res = await api.post<TimetableEntry>('/timetables', data);
    return res.data;
  },
  updateEntry: async (id: number, data: Partial<TimetableEntry>) => {
    const res = await api.put<TimetableEntry>(`/timetables/${id}`, data);
    return res.data;
  },
  deleteEntry: async (id: number) => {
    const res = await api.delete(`/timetables/${id}`);
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Examination Services
// --------------------------------------------------------------------------
export const examinationsApi = {
  getAll: async (params?: { department_id?: number; semester?: number; status_filter?: string; search?: string }) => {
    const res = await api.get<Examination[]>('/examinations', { params });
    return res.data;
  },
  create: async (data: Partial<Examination>) => {
    const res = await api.post<Examination>('/examinations', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Examination>) => {
    const res = await api.put<Examination>(`/examinations/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/examinations/${id}`);
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Notification Services
// --------------------------------------------------------------------------
export const notificationsApi = {
  getAll: async () => {
    const res = await api.get<NotificationItem[]>('/notifications');
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await api.get<{ unread_count: number }>('/notifications/unread-count');
    return res.data;
  },
  markRead: async (id: number) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Role-Based Dashboard Services
// --------------------------------------------------------------------------
export const dashboardApi = {
  getAdmin: async () => {
    const res = await api.get<AdminStats>('/dashboard/admin');
    return res.data;
  },
  getHod: async () => {
    const res = await api.get<HodStats>('/dashboard/hod');
    return res.data;
  },
  getFaculty: async () => {
    const res = await api.get<FacultyStats>('/dashboard/faculty');
    return res.data;
  },
  getStudent: async () => {
    const res = await api.get<StudentStats>('/dashboard/student');
    return res.data;
  },
  getExamCell: async () => {
    const res = await api.get<ExamCellStats>('/dashboard/exam_cell');
    return res.data;
  }
};

// --------------------------------------------------------------------------
// STAGE 2: AI & Academic Intelligence Services
// --------------------------------------------------------------------------
export const aiApi = {
  // Module 1: Timetable Generation
  generateSchedule: async (payload: {
    department_id: number;
    semester: number;
    batch?: string;
    academic_year?: string;
    working_days?: string[];
  }) => {
    const res = await api.post('/ai/schedules/generate', payload);
    return res.data;
  },
  listScheduleJobs: async () => {
    const res = await api.get('/ai/schedules/jobs');
    return res.data;
  },
  saveGeneratedTimetable: async (payload: { job_id: string; action: string }) => {
    const res = await api.post('/ai/schedules/save', payload);
    return res.data;
  },

  // Module 2: Conflict Detection
  getConflicts: async (departmentId?: number) => {
    const res = await api.get('/ai/conflicts', { params: { department_id: departmentId } });
    return res.data;
  },
  analyzeConflicts: async (departmentId?: number) => {
    const res = await api.post('/ai/conflicts/analyze', { department_id: departmentId });
    return res.data;
  },
  resolveConflict: async (conflictId: string, notes?: string) => {
    const res = await api.post(`/ai/conflicts/${conflictId}/resolve`, { resolution_notes: notes });
    return res.data;
  },

  // Module 3: Dynamic Rescheduling
  simulateReschedule: async (payload: {
    department_id: number;
    reason: string;
    target_date: string;
    affected_faculty_id?: number;
    affected_classroom_id?: number;
  }) => {
    const res = await api.post('/ai/schedules/reschedule/simulate', payload);
    return res.data;
  },
  approveReschedule: async (payload: { request_id: string; action: string; comments?: string }) => {
    const res = await api.post('/ai/schedules/reschedule/approve', payload);
    return res.data;
  },
  listReschedulingRequests: async () => {
    const res = await api.get('/ai/schedules/reschedule/requests');
    return res.data;
  },

  // Module 4: Faculty Workload Optimization
  getWorkloadAnalysis: async (departmentId?: number) => {
    const res = await api.get('/ai/workload/analysis', { params: { department_id: departmentId } });
    return res.data;
  },

  // Module 5: Classroom & Lab Optimization
  getResourceAnalysis: async (resourceType?: string) => {
    const res = await api.get('/ai/resources/analysis', { params: { resource_type: resourceType } });
    return res.data;
  },

  // Module 6: AI Recommendations
  getRecommendations: async () => {
    const res = await api.get('/ai/recommendations');
    return res.data;
  },
  actOnRecommendation: async (recId: string, action: 'approve' | 'reject' | 'simulate') => {
    const res = await api.post(`/ai/recommendations/${recId}/action`, null, { params: { action } });
    return res.data;
  },

  // Module 7: Examination Optimizer
  optimizeExams: async (payload: {
    department_id: number;
    semester: number;
    academic_year?: string;
    start_date?: string;
    end_date?: string;
    exam_type?: string;
  }) => {
    const res = await api.post('/ai/examinations/optimize', payload);
    return res.data;
  },

  // Module 8: Academic Copilot
  copilotChat: async (message: string, context?: any[]) => {
    const res = await api.post('/ai/copilot/chat', { message, conversation_context: context });
    return res.data;
  },

  // Module 9: Risk Analysis
  getRiskAnalysis: async (departmentId?: number) => {
    const res = await api.get('/ai/risk/analyze', { params: { department_id: departmentId } });
    return res.data;
  },

  // Module 10: Approvals
  listApprovals: async (statusFilter?: string) => {
    const res = await api.get('/ai/approvals', { params: { status_filter: statusFilter } });
    return res.data;
  },
  takeApprovalAction: async (reqId: string, action: 'Approve' | 'Reject', reviewNotes?: string) => {
    const res = await api.post(`/ai/approvals/${reqId}/action`, { action, review_notes: reviewNotes });
    return res.data;
  },

  // -------------------------------------------------------------
  // STAGE 3: Digital Twin Simulation Engine
  // -------------------------------------------------------------
  runDigitalTwinSimulation: async (payload: {
    name: string;
    scenario_type: string;
    department_id: number;
    parameters: Record<string, any>;
  }) => {
    const res = await api.post('/ai/digital-twin/simulate', payload);
    return res.data;
  },
  listDigitalTwinScenarios: async (departmentId?: number) => {
    const res = await api.get('/ai/digital-twin/scenarios', { params: { department_id: departmentId } });
    return res.data;
  },
  getDigitalTwinScenario: async (scenarioId: string) => {
    const res = await api.get(`/ai/digital-twin/scenarios/${scenarioId}`);
    return res.data;
  },
  discardDigitalTwinScenario: async (scenarioId: string) => {
    const res = await api.post(`/ai/digital-twin/scenarios/${scenarioId}/discard`);
    return res.data;
  },
  deleteDigitalTwinScenario: async (scenarioId: string) => {
    const res = await api.delete(`/ai/digital-twin/scenarios/${scenarioId}`);
    return res.data;
  },
  commitSimulation: async (scenarioId: string, notes?: string) => {
    const res = await api.post(`/ai/digital-twin/scenarios/${scenarioId}/commit`, { scenario_id: scenarioId, notes });
    return res.data;
  },

  // -------------------------------------------------------------
  // STAGE 3: What-If Scenario Comparison
  // -------------------------------------------------------------
  compareScenarios: async (payload: {
    title: string;
    department_id: number;
    scenario_ids: string[];
    priority_weights?: Record<string, number>;
  }) => {
    const res = await api.post('/ai/digital-twin/compare', payload);
    return res.data;
  },

  // -------------------------------------------------------------
  // STAGE 3: Predictive Academic Risk Intelligence
  // -------------------------------------------------------------
  getPredictiveRisks: async (departmentId?: number) => {
    const res = await api.get('/ai/predictive-risks', { params: { department_id: departmentId } });
    return res.data;
  },

  // -------------------------------------------------------------
  // STAGE 3: Advanced Academic Analytics
  // -------------------------------------------------------------
  getAdvancedAnalytics: async (departmentId?: number) => {
    const res = await api.get('/ai/analytics/advanced', { params: { department_id: departmentId } });
    return res.data;
  },

  // -------------------------------------------------------------
  // STAGE 3: Explainable AI (XAI)
  // -------------------------------------------------------------
  getXaiExplanation: async (decisionId: string) => {
    const res = await api.get(`/ai/xai/explanation/${decisionId}`);
    return res.data;
  },

  // -------------------------------------------------------------
  // STAGE 3: Change Management & Rollback
  // -------------------------------------------------------------
  getChangeHistory: async (limit: number = 50) => {
    const res = await api.get('/ai/changes/history', { params: { limit } });
    return res.data;
  },
  rollbackChange: async (changeId: string, reason?: string) => {
    const res = await api.post('/ai/changes/rollback', { change_id: changeId, reason });
    return res.data;
  }
};

export default api;
