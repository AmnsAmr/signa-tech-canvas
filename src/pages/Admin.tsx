import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminService, ContactDownloadApi } from '@/api';
import { secureApiRequest, handleCSRFError } from '@/utils/csrf';
import { Users, FileText, Search, Calendar, Mail, Phone, Building, Eye, Check, Clock, Filter, Image, UserPlus, Shield, Bell, BellOff, Download, Paperclip, Settings, MoreVertical, Edit, Trash2, Palette, FolderOpen, Star, Menu, ChevronLeft, HardDrive } from 'lucide-react';
import { ProjectCard } from '@/components/shared';
import '@/components/Admin/admin-improvements.css';

// Lazy load components
const OrganizedImageManager = lazy(() => import('@/components/Admin/OrganizedImageManager'));
const ProjectManager = lazy(() => import('@/components/Admin/ProjectManager'));
const FileManager = lazy(() => import('@/components/Admin/FileManager'));
const AdminRatings = lazy(() => import('@/components/Admin/AdminRatings'));
const ContactSettings = lazy(() => import('@/components/Admin/ContactSettings'));
const ThemeSettings = lazy(() => import('@/components/Admin/ThemeSettings'));
const MenuManagement = lazy(() => import('@/components/Admin/MenuManagement'));
const MegaMenuManager = lazy(() => import('@/components/Admin/MegaMenuManager'));
const AuthDebug = lazy(() => import('@/components/Debug/AuthDebug'));

interface User {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  role: string;
  created_at: string;
}

interface Admin {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface Submission {
  id: number;
  user_name: string;
  user_email: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  project?: string;
  message: string;
  services: Array<{
    serviceType: string;
    material?: string;
    size?: string;
    quantity?: string;
    thickness?: string;
    colors?: string;
    finishing?: string;
    cuttingApplication?: string;
  }>;
  submission_group?: string;
  status: 'pending' | 'done';
  created_at: string;
  has_file?: boolean;
  file_name?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  file_info?: {
    name: string;
    size: number;
    type: string;
    path: string;
  } | null;
}

const menuItems = [
  { id: 'dashboard', labelKey: 'admin.dashboard', icon: Settings },
  { id: 'images', labelKey: 'admin.images', icon: Image },
  { id: 'files', labelKey: 'admin.files', icon: HardDrive },
  { id: 'projects', labelKey: 'admin.projects', icon: FolderOpen },
  { id: 'menu', labelKey: 'Menu Management', icon: Menu },
  { id: 'theme', labelKey: 'admin.theme', icon: Palette },
  { id: 'contact', labelKey: 'admin.contact', icon: Phone },
  { id: 'admins', labelKey: 'admin.admins', icon: Shield },
  { id: 'ratings', labelKey: 'admin.reviews', icon: Star },
  { id: 'users', labelKey: 'admin.users', icon: Users },
  { id: 'submissions', labelKey: 'admin.submissions', icon: FileText },
];

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRequests, setUserRequests] = useState<Submission[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deleteUserName, setDeleteUserName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      fetchNotificationStatus();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchNotificationStatus = async () => {
    try {
      const response = await AdminService.getNotificationSettings();
      if (response.success) {
        setNotificationsEnabled(response.data.enabled);
      }
    } catch (error) {
      console.error('Failed to fetch notification status:', error);
    }
  };

  const toggleNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await AdminService.updateNotificationSettings(!notificationsEnabled);
      
      if (response.success) {
        setNotificationsEnabled(!notificationsEnabled);
        toast({
          title: t('admin.notifications_updated'),
          description: !notificationsEnabled ? t('admin.notifications_enabled') : t('admin.notifications_disabled')
        });
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const [usersRes, adminsRes, submissionsRes] = await Promise.all([
        AdminService.getUsers(),
        AdminService.getAdmins(),
        AdminService.getSubmissions()
      ]);

      if (usersRes.success) {
        setUsers(usersRes.data);
      } else {
        console.error('Failed to fetch users:', usersRes.error);
      }

      if (adminsRes.success) {
        setAdmins(adminsRes.data);
      } else {
        console.error('Failed to fetch admins:', adminsRes.error);
      }

      if (submissionsRes.success) {
        setSubmissions(submissionsRes.data);
      } else {
        console.error('Failed to fetch submissions:', submissionsRes.error);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (clickedUser: User) => {
    setSelectedUser(clickedUser);
    const userSubmissions = submissions.filter(sub => sub.user_email === clickedUser.email);
    setUserRequests(userSubmissions);
    setShowUserModal(true);
  };

  const updateSubmissionStatus = async (submissionId: number, newStatus: 'pending' | 'done') => {
    try {
      const response = await AdminService.updateSubmissionStatus(submissionId, newStatus);
      
      if (response.success) {
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId ? { ...sub, status: newStatus } : sub
        ));
        toast({ title: "Success", description: "Status updated successfully" });
      } else {
        toast({ title: "Error", description: response.error || "Failed to update status", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const downloadFile = async (filename: string, originalName: string) => {
    try {
      const filenameOnly = filename.split(/[\\/]/).pop() || filename;
      const response = await ContactDownloadApi.downloadFile(filenameOnly);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('File download error:', error);
    }
  };

  const confirmDeleteUser = (userId: number, userName: string) => {
    setDeleteUserId(userId);
    setDeleteUserName(userName);
  };

  const deleteUser = async () => {
    if (!deleteUserId) return;
    
    try {
      const response = await AdminService.deleteUser(deleteUserId);

      if (response.success) {
        toast({
          title: t('admin.user_deleted'),
          description: t('admin.user_deleted_success')
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setDeleteUserId(null);
      setDeleteUserName('');
    }
  };

  const createAdmin = async () => {
    try {
      const response = await AdminService.createAdmin(newAdmin);

      if (response.success) {
        setAdmins(prev => [...prev, response.data]);
        setNewAdmin({ name: '', email: '', password: '' });
        setShowCreateAdmin(false);
        toast({
          title: t('admin.admin_created'),
          description: t('admin.admin_created_success')
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create admin",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to create admin:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('admin.access_denied')}</h1>
          <p className="text-muted-foreground">{t('admin.no_permission')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p className="text-muted-foreground ml-4">{t('admin.loading_admin_data')}</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">{t('admin.dashboard_title')}</h1>
              <p className="text-muted-foreground">{t('admin.dashboard_desc')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className={notificationsEnabled ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" : "bg-gradient-to-r from-gray-500 to-slate-600 text-white"}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    {notificationsEnabled ? (
                      <span className="flex items-center">
                        <Bell className="h-4 w-4 mr-2" /> {t('admin.notifications.email')}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <BellOff className="h-4 w-4 mr-2" /> {t('admin.notifications.email')}
                      </span>
                    )}
                  </CardTitle>
                  <Mail className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">
                      {notificationsEnabled ? t('admin.notifications.enabled') : t('admin.notifications.disabled')}
                    </div>
                    <Button
                      size="sm"
                      variant={notificationsEnabled ? "destructive" : "secondary"}
                      onClick={toggleNotifications}
                      disabled={loadingNotifications}
                      className="text-xs font-medium"
                    >
                      {loadingNotifications ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-1">⟳</span> {t('debug.loading')}
                        </span>
                      ) : (
                        <span className="flex items-center">
                          {notificationsEnabled ? (
                            <>
                              <BellOff className="h-3 w-3 mr-1" /> {t('admin.notifications.disable')}
                            </>
                          ) : (
                            <>
                              <Bell className="h-3 w-3 mr-1" /> {t('admin.notifications.enable')}
                            </>
                          )}
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.total_users')}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.total_submissions')}</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{submissions.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.admin_users')}</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{admins.length}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'images':
        return (
          <Suspense fallback={<div className="admin-loading"><div className="admin-spinner"></div><p>{t('admin.loading_images')}</p></div>}>
            <OrganizedImageManager />
          </Suspense>
        );
      case 'files':
        return (
          <Suspense fallback={<div className="admin-loading"><div className="admin-spinner"></div><p>Loading files...</p></div>}>
            <FileManager />
          </Suspense>
        );
      case 'projects':
        return (
          <Suspense fallback={<div className="admin-loading"><div className="admin-spinner"></div><p>{t('admin.loading_projects')}</p></div>}>
            <ProjectManager />
          </Suspense>
        );
      case 'theme':
        return (
          <div className="space-y-6">
            <Suspense fallback={<div className="admin-loading"><div className="admin-spinner"></div><p>{t('admin.loading_theme_settings')}</p></div>}>
              <ThemeSettings />
            </Suspense>
            <Suspense fallback={<div>Loading debug...</div>}>
              <AuthDebug />
            </Suspense>
          </div>
        );
      case 'contact':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.contact_settings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="admin-loading"><div className="admin-spinner"></div><p>{t('admin.loading_contact_settings')}</p></div>}>
                <ContactSettings />
              </Suspense>
            </CardContent>
          </Card>
        );
      case 'admins':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('admin.admin_management')}</CardTitle>
              <Button onClick={() => setShowCreateAdmin(true)} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {t('admin.create_admin')}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.name')}</TableHead>
                    <TableHead>{t('admin.email')}</TableHead>
                    <TableHead>{t('admin.created')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-primary" />
                        {admin.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          {admin.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {new Date(admin.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      case 'menu':
        return (
          <Suspense fallback={<div className="admin-loading"><div className="admin-spinner"></div><p>Loading menu management...</p></div>}>
            <MegaMenuManager />
          </Suspense>
        );
      case 'ratings':
        return (
          <Suspense fallback={<div className="admin-loading"><div className="admin-spinner"></div><p>{t('admin.loading_reviews')}</p></div>}>
            <AdminRatings />
          </Suspense>
        );
      case 'users':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.registered_users')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="admin-table-container">
                <Table className="admin-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.name')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('admin.email')}</TableHead>
                      <TableHead className="hidden lg:table-cell">{t('admin.company')}</TableHead>
                      <TableHead className="hidden lg:table-cell">{t('admin.phone')}</TableHead>
                      <TableHead className="hidden sm:table-cell">{t('admin.role')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('admin.registered')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col sm:flex-row sm:items-center cursor-pointer min-w-0" onClick={() => handleUserClick(u)}>
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="truncate">{u.name}</span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 admin-settings-btn">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleUserClick(u)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  {t('admin.view_details')}
                                </DropdownMenuItem>
                                {u.id !== Number(user?.id) && (
                                  <DropdownMenuItem 
                                    onClick={() => confirmDeleteUser(u.id, u.name)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t('admin.delete_user')}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{u.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {u.company ? (
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="truncate max-w-[150px]">{u.company}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {u.phone ? (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              {u.phone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {new Date(u.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      case 'submissions':
        return (
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Contact Submissions</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full overflow-y-auto p-6 space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div key={submission.id} className="flex-shrink-0">
                    <ProjectCard
                      id={submission.id}
                      name={submission.name}
                      message={submission.message}
                      status={submission.status}
                      createdAt={submission.created_at}
                      hasFile={submission.has_file}
                      fileInfo={submission.file_info}
                      fileName={submission.file_name}
                      filePath={submission.file_path}
                      fileSize={submission.file_size}
                      services={Array.isArray(submission.services) ? submission.services : []}
                      project={submission.project}
                      submissionGroup={submission.submission_group}
                      userInfo={{
                        name: submission.user_name,
                        email: submission.email
                      }}
                      onStatusChange={updateSubmissionStatus}
                      onDownloadFile={downloadFile}
                      isAdmin={true}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="header-hover-container flex-shrink-0">
        <Header />
      </div>
      
      <div className="flex flex-1 pt-24 overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border flex-shrink-0 transition-all duration-300`}>
          <div className="h-full overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                {!sidebarCollapsed && <h2 className="text-lg font-semibold">{t('admin.panel')}</h2>}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-8 w-8 p-0"
                >
                  {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              </div>
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                      title={sidebarCollapsed ? t(item.labelKey) : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      {!sidebarCollapsed && (
                        <>
                          {t(item.labelKey)}
                          {item.id === 'admins' && <span className="ml-auto text-xs">({admins.length})</span>}
                          {item.id === 'users' && <span className="ml-auto text-xs">({users.length})</span>}
                          {item.id === 'submissions' && <span className="ml-auto text-xs">({submissions.length})</span>}
                        </>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-shrink-0 p-6 pb-0">
            {/* Search and Filters - only show for relevant sections */}
            {(activeSection === 'users' || activeSection === 'submissions') && (
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('admin.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {activeSection === 'submissions' && (
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('admin.all_statuses')}</SelectItem>
                        <SelectItem value="pending">{t('admin.pending')}</SelectItem>
                        <SelectItem value="done">{t('admin.completed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* User Requests Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Demandes de {selectedUser?.name} ({userRequests.length} demande{userRequests.length !== 1 ? 's' : ''})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {userRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucune demande trouvée pour cet utilisateur.
              </p>
            ) : (
              userRequests.map((request) => (
                <ProjectCard
                  key={request.id}
                  id={request.id}
                  name={request.name}
                  message={request.message}
                  status={request.status || 'pending'}
                  createdAt={request.created_at}
                  hasFile={request.has_file}
                  fileInfo={request.file_info}
                  fileName={request.file_name}
                  filePath={request.file_path}
                  fileSize={request.file_size}
                  services={Array.isArray(request.services) ? request.services : []}
                  project={request.project}
                  submissionGroup={request.submission_group}
                  onDownloadFile={downloadFile}
                  isAdmin={true}
                  isExpanded={true}
                />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Admin Modal */}
      <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newAdmin.name}
                onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Admin name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 6 characters"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateAdmin(false)}>
                Cancel
              </Button>
              <Button onClick={createAdmin} disabled={!newAdmin.name || !newAdmin.email || !newAdmin.password}>
                Create Admin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteUserId !== null} onOpenChange={() => { setDeleteUserId(null); setDeleteUserName(''); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le compte de <strong>{deleteUserName}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  );
};

export default Admin;
