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
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganizedImageManager from '@/components/Admin/OrganizedImageManager';
import AdminRatings from '@/components/Admin/AdminRatings';
import ContactSettings from '@/components/Admin/ContactSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { buildApiUrl } from '@/config/api';
import { Users, FileText, Search, Calendar, Mail, Phone, Building, Eye, Check, Clock, Filter, Image, UserPlus, Shield, Bell, BellOff, Download, Paperclip } from 'lucide-react';

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
      const token = localStorage.getItem('token');
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
        setSubmissions(submissionsData);
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
      
      // Extract just the filename without path
      const filenameOnly = filename.split(/[\\/]/).pop() || filename;
      
      const response = await fetch(buildApiUrl(`/api/contact/download/${filenameOnly}`), {
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
      } else {
        console.error('Download failed with status:', response.status);
        alert('Failed to download file: ' + response.statusText);
      }
    } catch (error) {
      console.error('File download error:', error);
      alert('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin data...</p>
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
          <Card className="bg-gradient-to-r from-orange-500 to-violet-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Notifications Email</CardTitle>
              <Mail className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">
                  {notificationsEnabled ? 'Activées' : 'Désactivées'}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={toggleNotifications}
                  disabled={loadingNotifications}
                  className="text-xs"
                >
                  {loadingNotifications ? '...' : (notificationsEnabled ? 'Désactiver' : 'Activer')}
                </Button>
              </div>
              <p className="text-xs text-green-100 mt-1">Notifications par email</p>
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admins ({admins.length})
            </TabsTrigger>
            <TabsTrigger value="ratings">{t('admin.reviews')}</TabsTrigger>
            <TabsTrigger value="users">Users ({filteredUsers.length})</TabsTrigger>
            <TabsTrigger value="submissions">Submissions ({filteredSubmissions.length})</TabsTrigger>
          </TabsList>

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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleUserClick(user)}>
                        <TableCell className="font-medium flex items-center">
                          <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                          {user.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.company ? (
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                              {user.company}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.phone ? (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              {user.phone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <OrganizedImageManager />
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
                <div className="space-y-3">
                  {filteredSubmissions.map((submission) => (
                    <Card key={submission.id} className={`border-l-4 ${submission.status === 'done' ? 'border-l-green-500 bg-green-50/50' : 'border-l-primary'} card-hover-effect`}>
                      <CardContent className="p-4">
                        <details className="group">
                          <summary className="cursor-pointer list-none">
                            <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{submission.name}</h3>
                              <Badge variant={submission.status === 'done' ? 'default' : 'secondary'} className="text-xs">
                                {submission.status === 'done' ? 'Terminé' : 'En attente'}
                              </Badge>
                              {submission.services && submission.services.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {submission.services.length} service{submission.services.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                               {submission.submission_group && (
                                 <Badge variant="outline" className="text-xs bg-blue-50">
                                   ID: {getGroupId(submission.submission_group)}
                                 </Badge>
                               )}
                               {submission.has_file && (
                                 <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                   <Paperclip className="h-3 w-3 mr-1" />
                                   Fichier joint
                                 </Badge>
                               )}
                             </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {submission.user_name} • {submission.email}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(submission.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={submission.status === 'done' ? 'outline' : 'default'}
                            onClick={() => updateSubmissionStatus(submission.id, submission.status === 'done' ? 'pending' : 'done')}
                            className="ml-2"
                          >
                            {submission.status === 'done' ? (
                              <><Clock className="h-3 w-3 mr-1" />Rouvrir</>
                            ) : (
                              <><Check className="h-3 w-3 mr-1" />Marquer terminé</>
                            )}
                          </Button>
                        </div>
                        
                        {submission.project && (
                          <div className="mb-2">
                            <Badge variant="outline" className="text-xs">
                              Projet: {submission.project}
                            </Badge>
                          </div>
                        )}
                        
                            <div className="bg-gradient-to-r from-muted/40 to-muted/20 p-4 rounded-md text-sm mb-3 border border-muted/50">
                              <div className="message-content">
                                <p>{submission.message}</p>
                              </div>
                              <span className="text-xs inline-flex items-center gap-1 text-primary font-medium mt-2 group-open:hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                Voir plus
                              </span>
                              <span className="text-xs inline-flex items-center gap-1 text-primary font-medium mt-2 hidden group-open:inline-flex">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                Voir moins
                              </span>
                            </div>
                          </summary>
                          
                          {/* Services shown when expanded */}
                          <div className="mt-4">
                            
                            {submission.services && Array.isArray(submission.services) && submission.services.length > 0 && (
                             <div className="space-y-3">
                               {/* File Download Section */}
                               {submission.file_info && (
                                 <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                   <div className="flex items-center justify-between">
                                     <div className="flex items-center space-x-3">
                                       <FileText className="h-6 w-6 text-green-600" />
                                       <div>
                                         <h5 className="text-sm font-medium text-green-800">Fichier vectoriel joint</h5>
                                         <p className="text-xs text-green-600">{submission.file_info.name}</p>
                                         <p className="text-xs text-green-500">{formatFileSize(submission.file_info.size)}</p>
                                       </div>
                                     </div>
                                     <Button
                                       size="sm"
                                       variant="outline"
                                       className="border-green-300 hover:bg-green-100"
                                       onClick={() => {
                                         downloadFile(submission.file_info!.path, submission.file_info!.name);
                                       }}
                                     >
                                       <Download className="h-4 w-4 mr-2" />
                                       Télécharger
                                     </Button>
                                   </div>
                                 </div>
                               )}
                               
                               <h4 className="text-sm font-medium">Services demandés ({submission.services.length}):</h4>
                                {Array.isArray(submission.services) && submission.services.map((service, index) => (
                                  <div key={index} className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-md border border-primary/20 hover:border-primary/40 transition-colors">
                                    <div className="flex items-center mb-2">
                                      <Badge variant="secondary" className="text-xs mr-2">
                                        {service.serviceType || 'Service'} #{index + 1}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                      {service.material && (
                                        <div>
                                          <span className="font-medium">Matériau:</span>
                                          <p className="text-muted-foreground truncate">{service.material}</p>
                                        </div>
                                      )}
                                      {service.size && (
                                        <div>
                                          <span className="font-medium">Taille:</span>
                                          <p className="text-muted-foreground truncate">{service.size}</p>
                                        </div>
                                      )}
                                      {service.quantity && (
                                        <div>
                                          <span className="font-medium">Quantité:</span>
                                          <p className="text-muted-foreground truncate">{service.quantity}</p>
                                        </div>
                                      )}
                                      {service.thickness && (
                                        <div>
                                          <span className="font-medium">Épaisseur:</span>
                                          <p className="text-muted-foreground truncate">{service.thickness}</p>
                                        </div>
                                      )}
                                      {service.colors && (
                                        <div>
                                          <span className="font-medium">Couleurs:</span>
                                          <p className="text-muted-foreground truncate">{service.colors}</p>
                                        </div>
                                      )}
                                      {service.finishing && (
                                        <div>
                                          <span className="font-medium">Finition:</span>
                                          <p className="text-muted-foreground truncate">{service.finishing}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </details>
                      </CardContent>
                    </Card>
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
                <Card key={request.id} className="border-l-4 border-l-primary card-hover-effect">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{request.name}</h4>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{new Date(request.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {request.services && request.services.length > 0 && (
                            <Badge variant="outline">
                              {request.services.length} service{request.services.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {request.submission_group && (
                            <Badge variant="outline" className="bg-blue-50">
                              ID: {getGroupId(request.submission_group)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {request.project && (
                      <div className="mb-3">
                        <Badge variant="outline">Projet: {request.project}</Badge>
                      </div>
                    )}
                    
                    <div className="bg-gradient-to-r from-muted/40 to-muted/20 p-4 rounded-md border border-muted/50 mb-4">
                      <h5 className="font-medium mb-2">Message:</h5>
                      <details className="group">
                        <summary className="cursor-pointer list-none">
                          <div className="message-content">
                            <p className="text-sm">{request.message}</p>
                          </div>
                          <span className="text-xs inline-flex items-center gap-1 text-primary font-medium mt-2 group-open:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            Voir plus
                          </span>
                          <span className="text-xs inline-flex items-center gap-1 text-primary font-medium mt-2 hidden group-open:inline-flex">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                            Voir moins
                          </span>
                        </summary>
                      </details>
                    </div>

                    {request.services && Array.isArray(request.services) && request.services.length > 0 && (
                      <div className="space-y-4">
                        <h5 className="font-medium">Services demandés ({request.services.length}):</h5>
                        {Array.isArray(request.services) && request.services.map((service, index) => (
                          <div key={index} className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-md border border-primary/20 hover:border-primary/40 transition-colors">
                            <h6 className="font-medium mb-3 text-primary">
                              Service {index + 1}: {service.serviceType || 'Non spécifié'}
                            </h6>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              {service.material && (
                                <div>
                                  <span className="font-medium">Matériau:</span>
                                  <p className="text-muted-foreground">{service.material}</p>
                                </div>
                              )}
                              {service.size && (
                                <div>
                                  <span className="font-medium">Taille:</span>
                                  <p className="text-muted-foreground">{service.size}</p>
                                </div>
                              )}
                              {service.quantity && (
                                <div>
                                  <span className="font-medium">Quantité:</span>
                                  <p className="text-muted-foreground">{service.quantity}</p>
                                </div>
                              )}
                              {service.thickness && (
                                <div>
                                  <span className="font-medium">Épaisseur:</span>
                                  <p className="text-muted-foreground">{service.thickness}</p>
                                </div>
                              )}
                              {service.colors && (
                                <div>
                                  <span className="font-medium">Couleurs:</span>
                                  <p className="text-muted-foreground">{service.colors}</p>
                                </div>
                              )}
                              {service.finishing && (
                                <div>
                                  <span className="font-medium">Finition:</span>
                                  <p className="text-muted-foreground">{service.finishing}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
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