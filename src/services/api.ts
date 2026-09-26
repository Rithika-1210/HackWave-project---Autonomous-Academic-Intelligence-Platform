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

// High-Speed In-Memory Client Cache for instantaneous tab & route switching
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 30_000; // 30 seconds TTL

export const clearApiCache = (pattern?: string) => {
  if (!pattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
};

export const cachedGet = async <T>(url: string, config?: any): Promise<T> => {
  const cacheKey = `${url}_${JSON.stringify(config?.params || {})}`;
  const now = Date.now();
  const cached = apiCache.get(cacheKey);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  const res = await api.get<T>(url, config);
  apiCache.set(cacheKey, { data: res.data, timestamp: now });
  return res.data;
};

// Response Interceptor: Handle Unauthorized Expiry & Invalidate Cache on Mutations
api.interceptors.response.use(
  (response) => {
    // Automatically invalidate cache on write operations
    const method = response.config.method?.toLowerCase();
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      const url = response.config.url || '';
      const parts = url.split('/').filter(Boolean);
      const resource = parts[0] || '';
      if (resource) {
        clearApiCache(resource);
      } else {
        clearApiCache();
      }
    }
    return response;
  },
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
    clearApiCache();
    return res.data;
  },
  register: async (userData: {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    department_id?: number | null;
    semester?: number;
    course_code?: string;
  }) => {
    const res = await api.post<{ access_token: string; token_type: string; user: User }>('/auth/register', userData);
    clearApiCache();
    return res.data;
  },
  getPublicDepartments: async () => {
    return cachedGet<{ id: number; name: string; code: string }[]>('/auth/departments');
  },
  getMe: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
  updateProfile: async (data: {
    full_name?: string;
    email?: string;
    department_id?: number | null;
    password?: string;
  }) => {
    const res = await api.put<User>('/auth/profile', data);
    clearApiCache();
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    clearApiCache();
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Department Services
// --------------------------------------------------------------------------
export const departmentsApi = {
  getAll: async (params?: { status_filter?: string; search?: string }) => {
    return cachedGet<Department[]>('/departments', { params });
  },
  getById: async (id: number) => {
    return cachedGet<Department>(`/departments/${id}`);
  },
  create: async (data: Partial<Department>) => {
    const res = await api.post<Department>('/departments', data);
    clearApiCache('department');
    return res.data;
  },
  update: async (id: number, data: Partial<Department>) => {
    const res = await api.put<Department>(`/departments/${id}`, data);
    clearApiCache('department');
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/departments/${id}`);
    clearApiCache('department');
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Faculty Services
// --------------------------------------------------------------------------
export const facultyApi = {
  getAll: async (params?: { department_id?: number; status_filter?: string; search?: string }) => {
    return cachedGet<Faculty[]>('/faculty', { params });
  },
  getById: async (id: number) => {
    return cachedGet<Faculty>(`/faculty/${id}`);
  },
  create: async (data: any) => {
    const res = await api.post<Faculty>('/faculty', data);
    clearApiCache('faculty');
    return res.data;
  },
  update: async (id: number, data: Partial<Faculty>) => {
    const res = await api.put<Faculty>(`/faculty/${id}`, data);
    clearApiCache('faculty');
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/faculty/${id}`);
    clearApiCache('faculty');
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Student Services
// --------------------------------------------------------------------------
export const studentsApi = {
  getAll: async (params?: { department_id?: number; course_id?: number; semester?: number; batch?: string; search?: string }) => {
    return cachedGet<Student[]>('/students', { params });
  },
  getById: async (id: number) => {
    return cachedGet<Student>(`/students/${id}`);
  },
  create: async (data: any) => {
    const res = await api.post<Student>('/students', data);
    clearApiCache('student');
    return res.data;
  },
  update: async (id: number, data: Partial<Student>) => {
    const res = await api.put<Student>(`/students/${id}`, data);
    clearApiCache('student');
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/students/${id}`);
    clearApiCache('student');
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Course Services
// --------------------------------------------------------------------------
export const coursesApi = {
  getAll: async (params?: { department_id?: number; status_filter?: string }) => {
    return cachedGet<Course[]>('/courses', { params });
  },
  create: async (data: Partial<Course>) => {
    const res = await api.post<Course>('/courses', data);
    clearApiCache('course');
    return res.data;
  },
  update: async (id: number, data: Partial<Course>) => {
    const res = await api.put<Course>(`/courses/${id}`, data);
    clearApiCache('course');
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/courses/${id}`);
    clearApiCache('course');
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Subject Services
// --------------------------------------------------------------------------
export const subjectsApi = {
  getAll: async (params?: { department_id?: number; course_id?: number; semester?: number; search?: string; status_filter?: string }) => {
    return cachedGet<Subject[]>('/subjects', { params });
  },
  create: async (data: Partial<Subject>) => {
    const res = await api.post<Subject>('/subjects', data);
    clearApiCache('subject');
    return res.data;
  },
  update: async (id: number, data: Partial<Subject>) => {
    const res = await api.put<Subject>(`/subjects/${id}`, data);
    clearApiCache('subject');
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/subjects/${id}`);
    clearApiCache('subject');
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Classroom & Lab Resource Services
// --------------------------------------------------------------------------
export const resourcesApi = {
  getAll: async (params?: { resource_type?: string; availability_status?: string; search?: string }) => {
    return cachedGet<Classroom[]>('/resources', { params });
  },
  create: async (data: Partial<Classroom>) => {
    const res = await api.post<Classroom>('/resources', data);
    clearApiCache('resource');
    return res.data;
  },
  update: async (id: number, data: Partial<Classroom>) => {
    const res = await api.put<Classroom>(`/resources/${id}`, data);
    clearApiCache('resource');
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/resources/${id}`);
    clearApiCache('resource');
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Timetable Services
// --------------------------------------------------------------------------
export const timetablesApi = {
  getEntries: async (params?: { department_id?: number; course_id?: number; semester?: number; batch?: string; faculty_id?: number; classroom_id?: number; day_of_week?: string }) => {
    return cachedGet<TimetableEntry[]>('/timetables', { params });
  },
  createEntry: async (data: Partial<TimetableEntry>) => {
    const res = await api.post<TimetableEntry>('/timetables', data);
    clearApiCache('timetable');
    return res.data;
  },
  updateEntry: async (id: number, data: Partial<TimetableEntry>) => {
    const res = await api.put<TimetableEntry>(`/timetables/${id}`, data);
    clearApiCache('timetable');
    return res.data;
  },
  deleteEntry: async (id: number) => {
    const res = await api.delete(`/timetables/${id}`);
    clearApiCache('timetable');
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Examination Services
// --------------------------------------------------------------------------
export const examinationsApi = {
  getAll: async (params?: { department_id?: number; semester?: number; status_filter?: string; search?: string }) => {
    return cachedGet<Examination[]>('/examinations', { params });
  },
  create: async (data: Partial<Examination>) => {
    const res = await api.post<Examination>('/examinations', data);
    clearApiCache('examination');
    return res.data;
  },
  update: async (id: number, data: Partial<Examination>) => {
    const res = await api.put<Examination>(`/examinations/${id}`, data);
    clearApiCache('examination');
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/examinations/${id}`);
    clearApiCache('examination');
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Notification Services
// --------------------------------------------------------------------------
export const notificationsApi = {
  getAll: async () => {
    return cachedGet<NotificationItem[]>('/notifications');
  },
  getUnreadCount: async () => {
    return cachedGet<{ unread_count: number }>('/notifications/unread-count');
  },
  markRead: async (id: number) => {
    const res = await api.put(`/notifications/${id}/read`);
    clearApiCache('notification');
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.put('/notifications/read-all');
    clearApiCache('notification');
    return res.data;
  }
};

// --------------------------------------------------------------------------
// Role-Based Dashboard Services
// --------------------------------------------------------------------------
export const dashboardApi = {
  getAdmin: async () => {
    return cachedGet<AdminStats>('/dashboard/admin');
  },
  getHod: async () => {
    return cachedGet<HodStats>('/dashboard/hod');
  },
  getFaculty: async () => {
    return cachedGet<FacultyStats>('/dashboard/faculty');
  },
  getStudent: async () => {
    return cachedGet<StudentStats>('/dashboard/student');
  },
  getExamCell: async () => {
    return cachedGet<ExamCellStats>('/dashboard/exam_cell');
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

export const usersApi = {
  getAll: async (params?: { role?: string; search?: string }) => {
    return cachedGet<User[]>('/users', { params });
  },
  create: async (userData: any) => {
    const res = await api.post<User>('/users', userData);
    clearApiCache('users');
    return res.data;
  },
  update: async (userId: number, userData: any) => {
    const res = await api.put<User>(`/users/${userId}`, userData);
    clearApiCache('users');
    return res.data;
  },
  delete: async (userId: number) => {
    const res = await api.delete(`/users/${userId}`);
    clearApiCache('users');
    return res.data;
  },
  approve: async (userId: number) => {
    const res = await api.put<User>(`/users/${userId}/approve`);
    clearApiCache('users');
    return res.data;
  },
  reject: async (userId: number) => {
    const res = await api.put<User>(`/users/${userId}/reject`);
    clearApiCache('users');
    return res.data;
  }
};

export default api;
