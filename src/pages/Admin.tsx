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
import ImageManager from '@/components/Admin/ImageManager';
import { Users, FileText, Search, Calendar, Mail, Phone, Building, Eye, Check, Clock, Filter, Image } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  role: string;
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
  service_type?: string;
  material?: string;
  size?: string;
  quantity?: string;
  thickness?: string;
  colors?: string;
  finishing?: string;
  cutting_application?: string;
  status: 'pending' | 'done';
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRequests, setUserRequests] = useState<Submission[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, submissionsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users', { headers }),
        fetch('http://localhost:5000/api/admin/submissions', { headers })
      ]);

      if (usersRes.ok && submissionsRes.ok) {
        setUsers(await usersRes.json());
        setSubmissions(await submissionsRes.json());
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
      const response = await fetch(`http://localhost:5000/api/admin/submissions/${submissionId}/status`, {
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
      (submission.service_type && submission.service_type.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <Badge variant="secondary">{users.filter(u => u.role === 'admin').length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.role === 'client').length}</div>
              <p className="text-xs text-muted-foreground">Client users</p>
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
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="done">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users ({filteredUsers.length})</TabsTrigger>
            <TabsTrigger value="submissions">Submissions ({filteredSubmissions.length})</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
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
            <ImageManager />
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Contact Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredSubmissions.map((submission) => (
                    <Card key={submission.id} className={`border-l-4 ${submission.status === 'done' ? 'border-l-green-500 bg-green-50/50' : 'border-l-primary'}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{submission.name}</h3>
                              <Badge variant={submission.status === 'done' ? 'default' : 'secondary'} className="text-xs">
                                {submission.status === 'done' ? 'Terminé' : 'En attente'}
                              </Badge>
                              {submission.service_type && (
                                <Badge variant="outline" className="text-xs">{submission.service_type}</Badge>
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
                        
                        <div className="bg-muted/30 p-3 rounded text-sm mb-3">
                          <p className="line-clamp-2">{submission.message}</p>
                        </div>

                        {submission.service_type && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            {submission.material && (
                              <div>
                                <span className="font-medium">Matériau:</span>
                                <p className="text-muted-foreground truncate">{submission.material}</p>
                              </div>
                            )}
                            {submission.size && (
                              <div>
                                <span className="font-medium">Taille:</span>
                                <p className="text-muted-foreground truncate">{submission.size}</p>
                              </div>
                            )}
                            {submission.quantity && (
                              <div>
                                <span className="font-medium">Quantité:</span>
                                <p className="text-muted-foreground truncate">{submission.quantity}</p>
                              </div>
                            )}
                            {submission.thickness && (
                              <div>
                                <span className="font-medium">Épaisseur:</span>
                                <p className="text-muted-foreground truncate">{submission.thickness}</p>
                              </div>
                            )}
                          </div>
                        )}
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
                <Card key={request.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{request.name}</h4>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{new Date(request.created_at).toLocaleString()}</span>
                        </div>
                        {request.service_type && (
                          <Badge variant="outline" className="mt-2">{request.service_type}</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg mb-4">
                      <h5 className="font-medium mb-2">Message:</h5>
                      <p className="text-sm">{request.message}</p>
                    </div>

                    {request.service_type && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {request.material && (
                          <div>
                            <span className="font-medium">Matériau:</span>
                            <p className="text-muted-foreground">{request.material}</p>
                          </div>
                        )}
                        {request.size && (
                          <div>
                            <span className="font-medium">Taille:</span>
                            <p className="text-muted-foreground">{request.size}</p>
                          </div>
                        )}
                        {request.quantity && (
                          <div>
                            <span className="font-medium">Quantité:</span>
                            <p className="text-muted-foreground">{request.quantity}</p>
                          </div>
                        )}
                        {request.thickness && (
                          <div>
                            <span className="font-medium">Épaisseur:</span>
                            <p className="text-muted-foreground">{request.thickness}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Admin;