import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganizedImageManager from '@/components/Admin/OrganizedImageManager';
import AdminRatings from '@/components/Admin/AdminRatings';
import ContactSettings from '@/components/Admin/ContactSettings';
import SimpleThemeSettings from '@/components/Admin/SimpleThemeSettings';
import ProjectManager from '@/components/Admin/ProjectManager';

import { useLanguage } from '@/contexts/LanguageContext';
import { buildApiUrl } from '@/config/api';
import { Users, FileText, Search, Calendar, Mail, Phone, Building, Eye, Check, Clock, Filter, Image, UserPlus, Shield, Bell, BellOff, Download, Paperclip, Settings, MoreVertical, Edit, Trash2, Palette, FolderOpen } from 'lucide-react';
import { ProjectCard } from '@/components/shared';
import FileContextMenu from '@/components/FileContextMenu';
import '@/components/Admin/admin-improvements.css';


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

// Helper function to extract group ID from submission_group string
const getGroupId = (submissionGroup: string): string => {
  if (!submissionGroup) return 'N/A';
  
  // If it's just a number, return it
  if (/^\d+$/.test(submissionGroup)) {
    return submissionGroup;
  }
  
  // Handle format: group_timestamp_randomstring
  const parts = submissionGroup.split('_');
  if (parts.length >= 3) {
    // Return the random string part (last part)
    return parts[parts.length - 1].substring(0, 8).toUpperCase();
  }
  
  // Handle format: group_123456789
  if (parts.length === 2 && parts[0] === 'group') {
    // Create a hash-like ID from timestamp
    const timestamp = parts[1];
    const hash = timestamp.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
  }
  
  // Fallback - create a simple hash
  const hash = submissionGroup.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
};

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
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

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      fetchNotificationStatus();
    }
  }, [isAdmin]);

  const fetchNotificationStatus = async () => {
    try {
      console.log('Fetching notification status...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await fetch(buildApiUrl('/api/admin/notifications/status'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Notification status response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Notification status data:', data);
        setNotificationsEnabled(data.enabled);
      } else {
        console.error('Failed to fetch notification status:', await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch notification status:', error);
    }
  };

  const toggleNotifications = async () => {
    setLoadingNotifications(true);
    try {
      console.log('Toggling notifications to:', !notificationsEnabled);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        alert('Erreur d\'authentification. Veuillez vous reconnecter.');
        return;
      }
      
      const response = await fetch(buildApiUrl('/api/admin/notifications/toggle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: !notificationsEnabled })
      });
      
      console.log('Toggle response status:', response.status);
      const data = await response.json();
      console.log('Toggle response data:', data);
      
      if (response.ok) {
        setNotificationsEnabled(!notificationsEnabled);
        alert(data.message || `Notifications ${!notificationsEnabled ? 'activées' : 'désactivées'} avec succès`);
      } else {
        alert(data.message || 'Erreur lors de la modification des paramètres de notification');
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      alert('Erreur lors de la modification des paramètres de notification. Veuillez réessayer.');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      const headers = { Authorization: `Bearer ${token}` };

      console.log('Fetching admin data...');
      const [usersRes, adminsRes, submissionsRes] = await Promise.all([
        fetch(buildApiUrl('/api/admin/users'), { headers }),
        fetch(buildApiUrl('/api/admin/admins'), { headers }),
        fetch(buildApiUrl('/api/admin/submissions'), { headers })
      ]);

      console.log('Response statuses:', {
        users: usersRes.status,
        admins: adminsRes.status,
        submissions: submissionsRes.status
      });

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log('Users data:', usersData);
        setUsers(usersData);
      } else {
        console.error('Users fetch failed:', await usersRes.text());
      }

      if (adminsRes.ok) {
        const adminsData = await adminsRes.json();
        console.log('Admins data:', adminsData);
        setAdmins(adminsData);
      } else {
        console.error('Admins fetch failed:', await adminsRes.text());
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        console.log('Submissions data:', submissionsData);
        
        // Process submissions to ensure file info is properly set
        const processedSubmissions = submissionsData.map(submission => {
          // Make sure has_file flag is set correctly based on file properties
          if (submission.file_name && submission.file_path) {
            submission.has_file = true;
            
            // Ensure file_info is set for consistency
            if (!submission.file_info) {
              submission.file_info = {
                name: submission.file_name,
                size: submission.file_size || 0,
                type: submission.file_type || 'application/octet-stream',
                path: submission.file_path
              };
            }
          }
          
          // If we have file_info but no direct properties, set them
          if (submission.file_info && !submission.file_path) {
            submission.file_name = submission.file_info.name;
            submission.file_path = submission.file_info.path;
            submission.file_size = submission.file_info.size;
            submission.file_type = submission.file_info.type;
            submission.has_file = true;
          }
          
          return submission;
        });
        
        setSubmissions(processedSubmissions);
      } else {
        console.error('Submissions fetch failed:', await submissionsRes.text());
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
    console.log('Updating status:', submissionId, newStatus);
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
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response:', result);
      
      if (response.ok) {
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId ? { ...sub, status: newStatus } : sub
        ));
        console.log('Status updated successfully');
      } else {
        console.error('Failed to update status:', result.message);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const downloadFile = async (filename: string, originalName: string) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Downloading file:', filename);
      console.log('Original name:', originalName);
      
      // Extract just the filename without path
      const filenameOnly = filename.split(/[\\/]/).pop() || filename;
      console.log('Filename only:', filenameOnly);
      
      const downloadUrl = buildApiUrl(`/api/contact/download/${filenameOnly}`);
      console.log('Download URL:', downloadUrl);
      
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
        console.log('File download successful');
      } else {
        console.error('Download failed with status:', response.status);
        console.error('Response text:', await response.text());
        alert(`Failed to download file: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('File download error:', error);
      alert(`Failed to download file: ${error.message || 'Unknown error'}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le compte de ${userName} ? Cette action est irréversible.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/admin/users/${userId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Utilisateur supprimé avec succès');
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Erreur lors de la suppression');
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
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Failed to create admin:', error);
      alert('Failed to create admin');
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
      submission.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (submission.services && Array.isArray(submission.services) && submission.services.some(service => 
        service?.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service?.material?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and view contact submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className={notificationsEnabled ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" : "bg-gradient-to-r from-gray-500 to-slate-600 text-white"} data-testid="notification-card">
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
                  data-testid="toggle-notifications-button"
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
              <p className="text-xs text-green-100 mt-2">
                {notificationsEnabled 
                  ? "Vous recevez des notifications par email pour les nouvelles demandes" 
                  : "Vous ne recevez pas de notifications par email"}
              </p>
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
              <p className="text-xs text-muted-foreground">{t('admin.total_admins')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
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
        </div>

        {/* Tabs */}
        <Tabs defaultValue="images" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1">
            <TabsTrigger value="images" className="flex items-center gap-1 text-xs md:text-sm">
              <Image className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Images</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-1 text-xs md:text-sm">
              <FolderOpen className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-1 text-xs md:text-sm">
              <Palette className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-1 text-xs md:text-sm">
              <Phone className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-1 text-xs md:text-sm">
              <Shield className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Admins</span>
              <span className="hidden md:inline">({admins.length})</span>
            </TabsTrigger>
            <TabsTrigger value="ratings" className="text-xs md:text-sm">
              <span className="hidden sm:inline">{t('admin.reviews')}</span>
              <span className="sm:hidden">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs md:text-sm">
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">U</span>
              <span className="hidden md:inline">({filteredUsers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="submissions" className="text-xs md:text-sm">
              <span className="hidden sm:inline">Submissions</span>
              <span className="sm:hidden">S</span>
              <span className="hidden md:inline">({filteredSubmissions.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme">
            <SimpleThemeSettings />
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.contact_settings')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.registered_users')}</CardTitle>
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
                                <div className="sm:hidden text-xs text-muted-foreground mt-1">
                                  {u.email}
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
                                  {u.id !== Number(user?.id)&& (
                                    <DropdownMenuItem 
                                      onClick={() => deleteUser(u.id, u.name)}
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
          </TabsContent>

          <TabsContent value="images">
            <OrganizedImageManager />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectManager />
          </TabsContent>

          <TabsContent value="admins">
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
          </TabsContent>

          <TabsContent value="ratings">
            <AdminRatings />
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Contact Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="admin-project-cards">
                  {filteredSubmissions.map((submission) => (
                    <ProjectCard
                      key={submission.id}
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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

      <Footer />
    </div>
  );
};

export default Admin;