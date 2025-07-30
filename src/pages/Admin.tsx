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
import { buildApiUrl } from '@/config/api';
import { Users, FileText, Search, Calendar, Mail, Phone, Building, Eye, Check, Clock, Filter, Image, UserPlus, Shield, Bell, BellOff, Download, Paperclip, Settings, MoreVertical, Edit, Trash2, Palette, FolderOpen, Star, Menu, ChevronLeft } from 'lucide-react';
import { ProjectCard } from '@/components/shared';
import '@/components/Admin/admin-improvements.css';

// Lazy load components
const OrganizedImageManager = lazy(() => import('@/components/Admin/OrganizedImageManager'));
const AdminRatings = lazy(() => import('@/components/Admin/AdminRatings'));
const ContactSettings = lazy(() => import('@/components/Admin/ContactSettings'));
const SimpleThemeSettings = lazy(() => import('@/components/Admin/SimpleThemeSettings'));
const ProjectManager = lazy(() => import('@/components/Admin/ProjectManager'));

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
  { id: 'dashboard', label: 'Dashboard', icon: Settings },
  { id: 'images', label: 'Images', icon: Image },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'admins', label: 'Admins', icon: Shield },
  { id: 'ratings', label: 'Reviews', icon: Star },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'submissions', label: 'Submissions', icon: FileText },
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
    }
  }, [isAdmin]);

  const fetchNotificationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(buildApiUrl('/api/admin/notifications/status'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotificationsEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Failed to fetch notification status:', error);
    }
  };

  const toggleNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(buildApiUrl('/api/admin/notifications/toggle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: !notificationsEnabled })
      });
      
      if (response.ok) {
        setNotificationsEnabled(!notificationsEnabled);
        toast({
          title: "Notifications mises à jour",
          description: `Notifications ${!notificationsEnabled ? 'activées' : 'désactivées'} avec succès`
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
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, adminsRes, submissionsRes] = await Promise.all([
        fetch(buildApiUrl('/api/admin/users'), { headers }),
        fetch(buildApiUrl('/api/admin/admins'), { headers }),
        fetch(buildApiUrl('/api/admin/submissions'), { headers })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (adminsRes.ok) {
        const adminsData = await adminsRes.json();
        setAdmins(adminsData);
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setSubmissions(submissionsData);
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
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/admin/submissions/${submissionId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId ? { ...sub, status: newStatus } : sub
        ));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const downloadFile = async (filename: string, originalName: string) => {
    try {
      const token = localStorage.getItem('token');
      const filenameOnly = filename.split(/[\\/]/).pop() || filename;
      const downloadUrl = buildApiUrl(`/api/contact/download/${filenameOnly}`);
      
      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/admin/users/${deleteUserId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Utilisateur supprimé",
          description: "L'utilisateur a été supprimé avec succès"
        });
        fetchData();
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
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/admin/admins'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAdmin)
      });

      if (response.ok) {
        const result = await response.json();
        setAdmins(prev => [...prev, result.admin]);
        setNewAdmin({ name: '', email: '', password: '' });
        setShowCreateAdmin(false);
        toast({
          title: "Admin créé",
          description: "Le nouvel administrateur a été créé avec succès"
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
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
          <p className="text-muted-foreground ml-4">Loading admin data...</p>
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
              <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users and view contact submissions</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className={notificationsEnabled ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" : "bg-gradient-to-r from-gray-500 to-slate-600 text-white"}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    {notificationsEnabled ? (
                      <span className="flex items-center">
                        <Bell className="h-4 w-4 mr-2" /> Notifications Email
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <BellOff className="h-4 w-4 mr-2" /> Notifications Email
                      </span>
                    )}
                  </CardTitle>
                  <Mail className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">
                      {notificationsEnabled ? 'Activées' : 'Désactivées'}
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
                          <span className="animate-spin mr-1">⟳</span> Chargement...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          {notificationsEnabled ? (
                            <>
                              <BellOff className="h-3 w-3 mr-1" /> Désactiver
                            </>
                          ) : (
                            <>
                              <Bell className="h-3 w-3 mr-1" /> Activer
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
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{submissions.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
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
          <Suspense fallback={<div className="admin-loading"><div className="admin-spinner"></div><p>Loading images...</p></div>}>
            <OrganizedImageManager />
          </Suspense>
        );
      case 'projects':
        return (
          <Suspense fallback={<div className="admin-loading"><div className="admin-spinner"></div><p>Loading projects...</p></div>}>
            <ProjectManager />
          </Suspense>
        );
      case 'theme':
        return (
          <Suspense fallback={<div className="admin-loading"><div className="admin-spinner"></div><p>Loading theme settings...</p></div>}>
            <SimpleThemeSettings />
          </Suspense>
        );
      case 'contact':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Contact Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="admin-loading"><div className="admin-spinner"></div><p>Loading contact settings...</p></div>}>
                <ContactSettings />
              </Suspense>
            </CardContent>
          </Card>
        );
      case 'admins':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Admin Management</CardTitle>
              <Button onClick={() => setShowCreateAdmin(true)} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Create Admin
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created</TableHead>
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
      case 'ratings':
        return (
          <Suspense fallback={<div className="admin-loading"><div className="admin-spinner"></div><p>Loading reviews...</p></div>}>
            <AdminRatings />
          </Suspense>
        );
      case 'users':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="admin-table-container">
                <Table className="admin-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden lg:table-cell">Company</TableHead>
                      <TableHead className="hidden lg:table-cell">Phone</TableHead>
                      <TableHead className="hidden sm:table-cell">Role</TableHead>
                      <TableHead className="hidden md:table-cell">Registered</TableHead>
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
                                  View Details
                                </DropdownMenuItem>
                                {u.id !== Number(user?.id) && (
                                  <DropdownMenuItem 
                                    onClick={() => confirmDeleteUser(u.id, u.name)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
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
                {!sidebarCollapsed && <h2 className="text-lg font-semibold">Admin Panel</h2>}
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
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      {!sidebarCollapsed && (
                        <>
                          {item.label}
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
                    placeholder="Search users, submissions, or content..."
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
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="done">Completed</SelectItem>
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