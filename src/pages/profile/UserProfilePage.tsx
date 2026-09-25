import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, departmentsApi } from '@/services/api';
import { Department, UserCertificate, UserResume, UserMaterial } from '@/types';
import {
  User, Mail, Phone, Building2, Briefcase, Calendar, Shield, Award,
  FileText, Upload, Download, Trash2, Plus, CheckCircle2, AlertCircle,
  Camera, ExternalLink, Lock, Save, FileCheck, Eye, BookOpen, Sparkles, X,
  FolderOpen, FileUp, Check
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const certificateFileInputRef = useRef<HTMLInputElement>(null);
  const materialFileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'certificates' | 'resume' | 'materials'>('profile');
  
  // Profile settings state
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [bio, setBio] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // Profile picture
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Resume state
  const [resume, setResume] = useState<UserResume | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState<string>('');

  // Certificates state
  const [certificates, setCertificates] = useState<UserCertificate[]>([]);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [certTitle, setCertTitle] = useState<string>('');
  const [certIssuer, setCertIssuer] = useState<string>('');
  const [certDate, setCertDate] = useState<string>('');
  const [certCredentialId, setCertCredentialId] = useState<string>('');
  const [certFileName, setCertFileName] = useState<string>('');
  const [certFileData, setCertFileData] = useState<string>('');

  // Academic Materials state
  const [materials, setMaterials] = useState<UserMaterial[]>([]);
  const [showMaterialModal, setShowMaterialModal] = useState<boolean>(false);
  const [matTitle, setMatTitle] = useState<string>('');
  const [matCategory, setMatCategory] = useState<string>('Lecture Notes');
  const [matSubject, setMatSubject] = useState<string>('');
  const [matDesc, setMatDesc] = useState<string>('');
  const [matFileName, setMatFileName] = useState<string>('');
  const [matFileData, setMatFileData] = useState<string>('');
  const [materialFilter, setMaterialFilter] = useState<string>('All');

  // Status feedback
  const [loading, setLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getCleanRole = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'hod': return 'Head of Department';
      case 'faculty': return 'Faculty Member';
      case 'student': return 'Student';
      case 'exam_cell': return 'Examination Cell';
      default: return role || 'Institutional Member';
    }
  };

  useEffect(() => {
    if (!user) return;

    setFullName(user.full_name || '');
    setEmail(user.email || '');
    setDepartmentId(user.department_id || 1);

    // Load persistent profile data from localStorage
    const savedPhone = localStorage.getItem(`aaip_phone_${user.id}`);
    const savedDesignation = localStorage.getItem(`aaip_designation_${user.id}`);
    const savedBio = localStorage.getItem(`aaip_bio_${user.id}`);
    const savedAvatar = localStorage.getItem(`aaip_avatar_${user.id}`);
    const savedResume = localStorage.getItem(`aaip_resume_${user.id}`);
    const savedSkills = localStorage.getItem(`aaip_skills_${user.id}`);
    const savedCerts = localStorage.getItem(`aaip_certs_${user.id}`);
    const savedMats = localStorage.getItem(`aaip_materials_${user.id}`);

    setPhone(savedPhone || '+91 98765 43210');
    setDesignation(savedDesignation || (user.role === 'admin' ? 'System Administrator' : user.role === 'faculty' ? 'Assistant Professor' : user.role === 'hod' ? 'Head of Department' : user.role === 'exam_cell' ? 'Examination Coordinator' : 'Enrolled Student'));
    setBio(savedBio || `Institutional academic professional specializing in modern curriculum operations, academic scheduling, and institutional workflows.`);
    setAvatarUrl(savedAvatar || user.avatar_url || null);

    // Initial Resume
    if (savedResume) {
      try { setResume(JSON.parse(savedResume)); } catch (e) {}
    } else {
      setResume({
        fileName: `${user.full_name.replace(/\s+/g, '_')}_Academic_CV.pdf`,
        fileSize: '1.4 MB',
        uploadedAt: '2026-09-20',
      });
    }

    // Initial Skills
    if (savedSkills) {
      try { setSkills(JSON.parse(savedSkills)); } catch (e) {}
    } else {
      setSkills(['Curriculum Design', 'Academic Administration', 'Distributed Scheduling', 'Research & Pedagogy', 'Quality Assurance']);
    }

    // Initial Certificates
    if (savedCerts) {
      try { setCertificates(JSON.parse(savedCerts)); } catch (e) {}
    } else {
      setCertificates([
        {
          id: 'cert-1',
          title: 'Advanced Academic Leadership & Higher Education Governance',
          issuer: 'National Board of Higher Education (NBHE)',
          issueDate: '2025-11-15',
          credentialId: 'NBHE-GOV-2025-8842',
          fileName: 'NBHE_Leadership_Certificate.pdf',
          fileSize: '820 KB',
        },
        {
          id: 'cert-2',
          title: 'Institutional Resource & Timetable Optimization Expert',
          issuer: 'Academic Technology Council',
          issueDate: '2026-02-10',
          credentialId: 'ATC-OPT-9921',
          fileName: 'ATC_Optimization_Credential.pdf',
          fileSize: '650 KB',
        }
      ]);
    }

    // Initial Materials
    if (savedMats) {
      try { setMaterials(JSON.parse(savedMats)); } catch (e) {}
    } else {
      setMaterials([
        {
          id: 'mat-1',
          title: 'Semester Operating Guidelines & Exam Hall Protocol 2026',
          category: 'Syllabus',
          subject: 'Academic Administration',
          description: 'Official comprehensive policy manual for classroom and examination conduct.',
          fileName: 'Exam_Hall_Protocol_2026.pdf',
          fileSize: '2.1 MB',
          uploadedAt: '2026-09-18',
        },
        {
          id: 'mat-2',
          title: 'Autonomous Scheduling Algorithms - Core Lecture Slide Deck',
          category: 'Slide Deck',
          subject: 'CS402 Systems Architecture',
          description: 'Lecture slides covering constraint satisfaction and graph coloring in university timetables.',
          fileName: 'Lecture_Deck_Scheduling.pdf',
          fileSize: '4.8 MB',
          uploadedAt: '2026-09-22',
        }
      ]);
    }

    // Fetch active departments for selector
    departmentsApi.getAll({ status_filter: 'Active' })
      .then((data) => setDepartments(data))
      .catch(() => {
        setDepartments([
          { id: 1, name: 'Computer Science & Engineering', code: 'CSE', status: 'Active', created_at: '' },
          { id: 2, name: 'Electronics & Communication Engineering', code: 'ECE', status: 'Active', created_at: '' },
          { id: 3, name: 'Mechanical Engineering', code: 'MECH', status: 'Active', created_at: '' },
          { id: 4, name: 'Data Science & Artificial Intelligence', code: 'DSAI', status: 'Active', created_at: '' },
        ]);
      });
  }, [user]);

  // Handle Profile Picture Upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64);
      if (user?.id) {
        localStorage.setItem(`aaip_avatar_${user.id}`, base64);
      }
      setSaveSuccess('Profile picture updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    if (user?.id) {
      localStorage.removeItem(`aaip_avatar_${user.id}`);
    }
    setSaveSuccess('Profile picture removed.');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // Save Profile Settings
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaveSuccess(null);

    if (!fullName.trim()) {
      setErrorMessage('Full name cannot be blank.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Institutional email cannot be blank.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New password and confirm password do not match.');
        return;
      }
    }

    try {
      setLoading(true);
      const updatePayload: any = {
        full_name: fullName.trim(),
        email: email.trim(),
        department_id: user?.role === 'admin' ? null : (departmentId ? Number(departmentId) : null),
      };
      if (newPassword) {
        updatePayload.password = newPassword;
      }

      const updated = await authApi.updateProfile(updatePayload);
      updateUser(updated);

      // Save custom fields in localStorage
      if (user?.id) {
        localStorage.setItem(`aaip_phone_${user.id}`, phone);
        localStorage.setItem(`aaip_designation_${user.id}`, designation);
        localStorage.setItem(`aaip_bio_${user.id}`, bio);
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaveSuccess('Institutional profile settings updated successfully!');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  // Resume Upload
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const newResumeData: UserResume = {
      fileName: file.name,
      fileSize: sizeFormatted,
      uploadedAt: new Date().toISOString().split('T')[0],
    };

    setResume(newResumeData);
    if (user?.id) {
      localStorage.setItem(`aaip_resume_${user.id}`, JSON.stringify(newResumeData));
    }
    setSaveSuccess('Resume / CV uploaded successfully!');
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  // Add / Remove Skills
  const handleAddSkill = () => {
    if (!newSkill.trim() || skills.includes(newSkill.trim())) return;
    const updated = [...skills, newSkill.trim()];
    setSkills(updated);
    setNewSkill('');
    if (user?.id) {
      localStorage.setItem(`aaip_skills_${user.id}`, JSON.stringify(updated));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    if (user?.id) {
      localStorage.setItem(`aaip_skills_${user.id}`, JSON.stringify(updated));
    }
  };

  // Certificate Modal Handlers
  const handleCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCertFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCertFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle.trim() || !certIssuer.trim()) {
      setErrorMessage('Please fill in the certificate title and issuing organization.');
      return;
    }

    const newCert: UserCertificate = {
      id: `cert-${Date.now()}`,
      title: certTitle.trim(),
      issuer: certIssuer.trim(),
      issueDate: certDate || new Date().toISOString().split('T')[0],
      credentialId: certCredentialId.trim() || `ID-${Math.floor(100000 + Math.random() * 900000)}`,
      fileName: certFileName || 'Certificate_Document.pdf',
      fileSize: '1.2 MB',
      fileData: certFileData,
    };

    const updated = [newCert, ...certificates];
    setCertificates(updated);
    if (user?.id) {
      localStorage.setItem(`aaip_certs_${user.id}`, JSON.stringify(updated));
    }

    // Reset Modal
    setCertTitle('');
    setCertIssuer('');
    setCertDate('');
    setCertCredentialId('');
    setCertFileName('');
    setCertFileData('');
    setShowCertModal(false);
    setSaveSuccess('New certificate credential added successfully!');
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const handleDeleteCert = (id: string) => {
    const updated = certificates.filter((c) => c.id !== id);
    setCertificates(updated);
    if (user?.id) {
      localStorage.setItem(`aaip_certs_${user.id}`, JSON.stringify(updated));
    }
    setSaveSuccess('Certificate removed.');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // Academic Materials Handlers
  const handleMaterialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMatFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMatFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) {
      setErrorMessage('Please enter a title for the academic material.');
      return;
    }

    const newMat: UserMaterial = {
      id: `mat-${Date.now()}`,
      title: matTitle.trim(),
      category: matCategory,
      subject: matSubject.trim() || 'General Academic',
      description: matDesc.trim(),
      fileName: matFileName || 'Academic_Document.pdf',
      fileSize: '2.5 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      fileData: matFileData,
    };

    const updated = [newMat, ...materials];
    setMaterials(updated);
    if (user?.id) {
      localStorage.setItem(`aaip_materials_${user.id}`, JSON.stringify(updated));
    }

    setMatTitle('');
    setMatCategory('Lecture Notes');
    setMatSubject('');
    setMatDesc('');
    setMatFileName('');
    setMatFileData('');
    setShowMaterialModal(false);
    setSaveSuccess('Academic material published to your portfolio!');
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const handleDeleteMaterial = (id: string) => {
    const updated = materials.filter((m) => m.id !== id);
    setMaterials(updated);
    if (user?.id) {
      localStorage.setItem(`aaip_materials_${user.id}`, JSON.stringify(updated));
    }
    setSaveSuccess('Academic material deleted.');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const filteredMaterials = materialFilter === 'All'
    ? materials
    : materials.filter((m) => m.category === materialFilter);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Toast Feedbacks */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Profile Banner - Rich Dark Color */}
      <div
        className="relative overflow-hidden rounded-3xl bg-slate-950 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8 text-white shadow-2xl shadow-slate-950/50"
        style={{ backgroundColor: '#020617' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          
          {/* Avatar with Camera Overlay */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-slate-900 border-2 border-sky-400/50 shadow-xl overflow-hidden flex items-center justify-center text-3xl font-extrabold text-white">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.full_name} className="w-full h-full object-cover" />
              ) : (
                user?.full_name?.charAt(0) || 'U'
              )}
            </div>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white shadow-lg transition-transform group-hover:scale-110 cursor-pointer"
              title="Upload new profile picture"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* User Header Details */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-xs">
                {user?.full_name}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-sky-500/20 text-sky-300 border border-sky-400/40">
                {getCleanRole(user?.role)}
              </span>
            </div>
            
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {designation} &bull; <span className="text-sky-300 font-mono">{user?.email}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 shadow-xs">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>RBAC Verified</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 shadow-xs">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{certificates.length} Credentials</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 shadow-xs">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>{materials.length} Academic Materials</span>
              </div>
            </div>
          </div>

          {/* Quick Avatar Actions */}
          {avatarUrl && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition-all cursor-pointer"
              >
                Remove Picture
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'certificates'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificates & Credentials</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-bold">
            {certificates.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resume')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'resume'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume / Curriculum Vitae</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'materials'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Academic Materials</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-bold">
            {materials.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Institutional Profile Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Institutional Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Contact Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Designation / Role Title</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* Department (Excluded for Overall Administrator) */}
              {user?.role !== 'admin' ? (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Assigned Department</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all cursor-pointer bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Institutional Governance Scope</label>
                  <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 text-sky-900 text-xs font-medium flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Overall Administrator &bull; Cross-Departmental Governance across All Institutional Faculties</span>
                  </div>
                </div>
              )}

              {/* Bio */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Academic Biography & Specializations
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>

            </div>
          </div>

          {/* Password & Security Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-600" />
              <span>Change Access Password</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave empty to keep current password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-sky-600/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: CERTIFICATES & CREDENTIALS */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic & Professional Certifications</h3>
              <p className="text-xs text-slate-500">
                Verified institutional qualifications, pedagogy training, and technological accreditations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCertModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Certificate</span>
            </button>
          </div>

          {/* Certificate Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all space-y-4 group relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-sky-600 transition-colors">
                        {cert.title}
                      </h4>
                      <p className="text-xs text-slate-500">{cert.issuer}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCert(cert.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Certificate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Issue Date</span>
                    <span>{cert.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Credential ID</span>
                    <span className="truncate block font-bold text-slate-700">{cert.credentialId}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-medium font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Document ({cert.fileSize || '1.1 MB'})
                  </span>
                  <a
                    href={cert.fileData || '#'}
                    download={cert.fileName || 'certificate.pdf'}
                    onClick={(e) => {
                      if (!cert.fileData) {
                        e.preventDefault();
                        alert('Certificate document downloaded successfully.');
                      }
                    }}
                    className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RESUME / CV */}
      {activeTab === 'resume' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Curriculum Vitae (CV) & Resume Document</h3>
                <p className="text-xs text-slate-500">
                  Official academic career summary, research background, and institutional credentials.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Upload / Replace Resume</span>
                </button>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeUpload}
                />
              </div>
            </div>

            {/* Current Resume Display Card */}
            {resume && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0 border border-sky-500/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{resume.fileName}</h4>
                    <p className="text-xs text-slate-500 font-mono">
                      File Size: {resume.fileSize} &bull; Updated: {resume.uploadedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => alert(`Previewing official resume for ${user?.full_name}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Downloading resume: ${resume.fileName}`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}

            {/* Drag & Drop Zone */}
            <div
              onClick={() => resumeInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-8 text-center cursor-pointer hover:bg-sky-50/30 transition-all group"
            >
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-sky-600 mx-auto transition-colors" />
              <p className="text-xs font-bold text-slate-700 mt-2">
                Click here or drag & drop to update your resume document
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Accepted formats: PDF, DOCX (Max size: 10MB)
              </p>
            </div>

            {/* Key Skills & Competencies */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Core Academic & Technical Skills
              </h4>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 max-w-md pt-1">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill (e.g. Cloud Architecture, AI Ethics)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: ACADEMIC MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic Teaching & Study Materials</h3>
              <p className="text-xs text-slate-500">
                Course lecture notes, syllabi, slide decks, lab manuals, and research publications.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowMaterialModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Material</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['All', 'Lecture Notes', 'Slide Deck', 'Lab Manual', 'Research Paper', 'Syllabus'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setMaterialFilter(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  materialFilter === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Materials Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all space-y-3.5 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0 border border-sky-500/20">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100">
                          {mat.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{mat.subject}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug group-hover:text-sky-600 transition-colors">
                        {mat.title}
                      </h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMaterial(mat.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {mat.description && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {mat.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 font-mono">
                  <span>{mat.fileName} ({mat.fileSize})</span>
                  <a
                    href={mat.fileData || '#'}
                    download={mat.fileName}
                    onClick={(e) => {
                      if (!mat.fileData) {
                        e.preventDefault();
                        alert(`Downloaded material: ${mat.title}`);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD CERTIFICATE MODAL */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Certificate or Credential</h3>
              <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCertificate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Certificate Title *</label>
                <input
                  type="text"
                  required
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Issuing Organization *</label>
                <input
                  type="text"
                  required
                  value={certIssuer}
                  onChange={(e) => setCertIssuer(e.target.value)}
                  placeholder="e.g. Amazon Web Services / Stanford University"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Issue Date</label>
                  <input
                    type="date"
                    value={certDate}
                    onChange={(e) => setCertDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Credential ID / Reference</label>
                  <input
                    type="text"
                    value={certCredentialId}
                    onChange={(e) => setCertCredentialId(e.target.value)}
                    placeholder="e.g. AWS-2026-9021"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Certificate File (PDF or Image)</label>
                <input
                  ref={certificateFileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleCertificateFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all shadow-md shadow-sky-600/20"
                >
                  Save Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MATERIAL MODAL */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Publish Academic Material</h3>
              <button onClick={() => setShowMaterialModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Material Title *</label>
                <input
                  type="text"
                  required
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Unit 3 Lecture Notes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Category *</label>
                  <select
                    value={matCategory}
                    onChange={(e) => setMatCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:border-sky-500 bg-white"
                  >
                    <option value="Lecture Notes">Lecture Notes</option>
                    <option value="Slide Deck">Slide Deck</option>
                    <option value="Lab Manual">Lab Manual</option>
                    <option value="Research Paper">Research Paper</option>
                    <option value="Syllabus">Syllabus</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Subject / Course</label>
                  <input
                    type="text"
                    value={matSubject}
                    onChange={(e) => setMatSubject(e.target.value)}
                    placeholder="e.g. CS301 Systems"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Description / Summary</label>
                <textarea
                  rows={2}
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  placeholder="Brief summary of the document contents..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Material Document (PDF, PPTX, DOCX, ZIP)</label>
                <input
                  ref={materialFileInputRef}
                  type="file"
                  onChange={handleMaterialFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all shadow-md shadow-sky-600/20"
                >
                  Publish Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
