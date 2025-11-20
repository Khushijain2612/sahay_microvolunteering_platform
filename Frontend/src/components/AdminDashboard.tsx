import { useState, useEffect } from 'react';
import { Plus, Users, CheckCircle, Clock, Star, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { api, authHelper } from '@/lib/api';
import { useRouter } from 'next/router';

interface Task {
  _id: string;
  title: string;
  date: string;
  duration_hours: number;
  total_spots: number;
  filled_spots: number;
  status: 'active' | 'completed' | 'cancelled';
  location: {
    address: string;
  };
  description: string;
}

interface Volunteer {
  _id: string;
  name: string;
  email: string;
  total_hours: number;
  badge: 'none' | 'bronze' | 'silver' | 'gold';
  rating: number;
  completed_opportunities: number;
}

interface Booking {
  _id: string;
  volunteer_id: {
    name: string;
    email: string;
  };
  opportunity_id: {
    title: string;
    date: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'volunteer';
}

export function AdminDashboard() {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    duration_hours: 0,
    date: '',
    location: '',
    total_spots: 0,
    description: '',
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = authHelper.getToken();
      if (!token) {
        toast.error('Please login first');
        router.push('/login');
        return;
      }

      // Get current user data
      try {
        const userData = await api.auth.getMe();
        const currentUser = userData.data?.user || userData.user || userData;
        
        if (!currentUser) {
          throw new Error('No user data received');
        }
        
        setUser(currentUser);
        
        // Check if user is admin
        if (currentUser.role !== 'admin') {
          toast.error('Access denied. Admin role required.');
          router.push('/');
          return;
        }
        
        // If admin, fetch dashboard data
        await fetchDashboardData();
        
      } catch (authError) {
        console.error('Auth check failed:', authError);
        toast.error('Authentication failed. Please login again.');
        authHelper.removeToken();
        router.push('/login');
      }
      
    } catch (error) {
      console.error('Initialization failed:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch all dashboard data in parallel
      const [tasksData, volunteersData, bookingsData] = await Promise.all([
        api.opportunities.getAll().catch(err => {
          console.error('Failed to fetch tasks:', err);
          return { data: [] };
        }),
        api.admin.getVolunteers().catch(err => {
          console.error('Failed to fetch volunteers:', err);
          return { data: [] };
        }),
        api.admin.getEventBookings().catch(err => {
          console.error('Failed to fetch bookings:', err);
          return { data: [] };
        })
      ]);

      // Set data with proper error handling
      setTasks(tasksData.data || tasksData || []);
      setVolunteers(volunteersData.data || volunteersData || []);
      setPendingBookings(bookingsData.data || bookingsData || []);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // If unauthorized, redirect to login
      if ((error as any).response?.status === 401) {
        authHelper.removeToken();
        router.push('/login');
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.opportunities.create({
        title: newTask.title,
        date: newTask.date,
        duration: newTask.duration_hours,
        location: newTask.location,
        volunteersRequired: newTask.total_spots,
        description: newTask.description,
        status: 'active'
      });
      
      toast.success('New task created successfully!');
      setShowNewTaskForm(false);
      setNewTask({
        title: '',
        duration_hours: 0,
        date: '',
        location: '',
        total_spots: 0,
        description: '',
      });
      
      await fetchDashboardData();
    } catch (error: any) {
      console.error('Failed to create task:', error);
      toast.error(`Failed to create task: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      await api.admin.updateBookingStatus(bookingId, { status: 'confirmed' });
      toast.success('Booking approved!');
      await fetchDashboardData();
    } catch (error: any) {
      console.error('Failed to approve booking:', error);
      toast.error(`Failed to approve booking: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await api.admin.updateBookingStatus(bookingId, { status: 'cancelled' });
      toast.success('Booking rejected');
      await fetchDashboardData();
    } catch (error: any) {
      console.error('Failed to reject booking:', error);
      toast.error(`Failed to reject booking: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleLogout = () => {
    authHelper.removeToken();
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    router.push('/');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Access denied. Admin privileges required.</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const activeTasksCount = tasks.filter(t => t.status === 'active').length;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const totalVolunteersCount = volunteers.length;
  const pendingBookingsCount = pendingBookings.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user.name}! Manage tasks, volunteers, and bookings
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
              <Plus className="w-5 h-5 mr-2" />
              New Task
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* New Task Form */}
        {showNewTaskForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration_hours">Duration (hours)</Label>
                  <Input
                    id="duration_hours"
                    type="number"
                    placeholder="e.g., 2"
                    value={newTask.duration_hours || ''}
                    onChange={(e) => setNewTask({ ...newTask, duration_hours: parseInt(e.target.value) || 0 })}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTask.date}
                    onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newTask.location}
                    onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="spots">Available Spots</Label>
                  <Input
                    id="spots"
                    type="number"
                    min="1"
                    value={newTask.total_spots || ''}
                    onChange={(e) => setNewTask({ ...newTask, total_spots: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit">Create Task</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewTaskForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{activeTasksCount}</div>
            <p className="text-sm text-gray-600">Active Tasks</p>
          </Card>
          <Card className="p-6">
            <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalVolunteersCount}</div>
            <p className="text-sm text-gray-600">Total Volunteers</p>
          </Card>
          <Card className="p-6">
            <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-4">
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{pendingBookingsCount}</div>
            <p className="text-sm text-gray-600">Pending Approvals</p>
          </Card>
          <Card className="p-6">
            <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{completedTasksCount}</div>
            <p className="text-sm text-gray-600">Completed Tasks</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="bookings">Pending Bookings</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">All Tasks</h2>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tasks found</p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                          <Badge
                            variant={
                              task.status === 'active'
                                ? 'default'
                                : task.status === 'completed'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {task.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span>{new Date(task.date).toLocaleDateString()}</span>
                          <span>{task.duration_hours} hours</span>
                          <span>
                            {task.filled_spots}/{task.total_spots} spots filled
                          </span>
                          <span>{task.location?.address || 'Location not specified'}</span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Registered Volunteers</h2>
              {volunteers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No volunteers found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-900">Name</th>
                        <th className="text-left py-3 px-4 text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 text-gray-900">Hours</th>
                        <th className="text-left py-3 px-4 text-gray-900">Badge</th>
                        <th className="text-left py-3 px-4 text-gray-900">Rating</th>
                        <th className="text-left py-3 px-4 text-gray-900">Tasks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteers.map((volunteer) => (
                        <tr key={volunteer._id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900">{volunteer.name}</td>
                          <td className="py-3 px-4 text-gray-600">{volunteer.email}</td>
                          <td className="py-3 px-4 text-gray-900">{volunteer.total_hours}h</td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" className="capitalize">
                              {volunteer.badge}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-gray-900">{volunteer.rating}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {volunteer.completed_opportunities}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Bookings</h2>
              {pendingBookings.filter(booking => booking.status === 'pending').length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending bookings</p>
              ) : (
                <div className="space-y-4">
                  {pendingBookings
                    .filter(booking => booking.status === 'pending')
                    .map((booking) => (
                      <div
                        key={booking._id}
                        className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                      >
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">
                            {booking.volunteer_id?.name || 'Unknown Volunteer'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {booking.opportunity_id?.title || 'Unknown Task'} •{' '}
                            {booking.opportunity_id?.date 
                              ? new Date(booking.opportunity_id.date).toLocaleDateString()
                              : 'Date not specified'
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.volunteer_id?.email || 'Email not available'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveBooking(booking._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectBooking(booking._id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}