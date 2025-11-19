import { useState, useEffect } from 'react';
import { Plus, Users, CheckCircle, Clock, Star, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api';
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

  // const tasks = [
  //   {
  //     id: 1,
  //     title: 'Food Distribution Support',
  //     date: '2025-11-05',
  //     duration: '2 hours',
  //     spots: 8,
  //     booked: 3,
  //     status: 'active',
  //   },
  //   {
  //     id: 2,
  //     title: 'Animal Shelter Care',
  //     date: '2025-11-06',
  //     duration: '3 hours',
  //     spots: 4,
  //     booked: 4,
  //     status: 'full',
  //   },
  //   {
  //     id: 3,
  //     title: 'Beach Cleanup Drive',
  //     date: '2025-10-28',
  //     duration: '2 hours',
  //     spots: 20,
  //     booked: 18,
  //     status: 'completed',
  //   },
  // ];

  // const volunteers = [
  //   {
  //     id: 1,
  //     name: 'Sarah Johnson',
  //     email: 'sarah@email.com',
  //     totalHours: 45,
  //     badge: 'silver',
  //     rating: 4.9,
  //     tasksCompleted: 12,
  //   },
  //   {
  //     id: 2,
  //     name: 'Michael Chen',
  //     email: 'michael@email.com',
  //     totalHours: 32,
  //     badge: 'silver',
  //     rating: 4.8,
  //     tasksCompleted: 9,
  //   },
  //   {
  //     id: 3,
  //     name: 'Emily Rodriguez',
  //     email: 'emily@email.com',
  //     totalHours: 67,
  //     badge: 'gold',
  //     rating: 5.0,
  //     tasksCompleted: 18,
  //   },
  // ];

  // const pendingBookings = [
  //   {
  //     id: 1,
  //     volunteer: 'Sarah Johnson',
  //     task: 'Food Distribution Support',
  //     date: '2025-11-05',
  //     status: 'pending',
  //   },
  //   {
  //     id: 2,
  //     volunteer: 'Michael Chen',
  //     task: 'Youth Tutoring Session',
  //     date: '2025-11-07',
  //     status: 'pending',
  //   },
  // ];

  // const handleCreateTask = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   toast.success('New task created successfully!');
  //   setShowNewTaskForm(false);
  //   setNewTask({
  //     title: '',
  //     duration: '',
  //     date: '',
  //     location: '',
  //     spots: 0,
  //     description: '',
  //   });
  // };
  const [tasks, setTasks] = useState<Task[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
   useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const tasksData: any = await apiClient.request('/opportunities/ngo');
      setTasks(tasksData);

      // Fetch volunteers (you might need to create this endpoint)
      const volunteersData: any = await apiClient.request('/admin/volunteers');
      setVolunteers(volunteersData);

      // Fetch pending bookings
      const bookingsData: any = await apiClient.request('/bookings/pending');
      setPendingBookings(bookingsData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // UPDATE: Create task with real API call
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.request('/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          ...newTask,
          location: {
            address: newTask.location,
            type: 'onsite'
          },
          skills_required: [], // Add if needed
          category: 'general' // Add if needed
        }),
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
      
      // Refresh tasks
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      await apiClient.request(`/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'confirmed' }),
      });
      toast.success('Booking approved!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error('Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await apiClient.request(`/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'cancelled' }),
      });
      toast.error('Booking rejected');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error('Failed to reject booking');
    }
  };
  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiClient.request(`/opportunities/${taskId}`, {
        method: 'DELETE',
      });
      toast.success('Task deleted successfully');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };
  const activeTasksCount = tasks.filter(t => t.status === 'active').length;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const totalVolunteersCount = volunteers.length;
  const pendingBookingsCount = pendingBookings.length;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage tasks, volunteers, and bookings</p>
          </div>
          <Button onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
            <Plus className="w-5 h-5 mr-2" />
            New Task
          </Button>
        </div>

        {/* New Task Form */}
        {showNewTaskForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-gray-900 mb-6">Create New Task</h2>
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
                  <Label htmlFor="duration_hours">Duration</Label>
                  <Input
                    id="duration_hours"
                    placeholder="e.g., 2 hours"
                    value={newTask.duration_hours}
                    onChange={(e) => setNewTask({ ...newTask, duration_hours: parseInt(e.target.value) })}
                    required
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
                    value={newTask.total_spots}
                    onChange={(e) => setNewTask({ ...newTask, total_spots: parseInt(e.target.value) })}
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
            <div className="text-gray-900">{activeTasksCount}</div>
            <p className="text-sm text-gray-600">Active Tasks</p>
          </Card>
          <Card className="p-6">
            <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-gray-900">{totalVolunteersCount}</div>
            <p className="text-sm text-gray-600">Total Volunteers</p>
          </Card>
          <Card className="p-6">
            <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-4">
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-gray-900">{pendingBookingsCount}</div>
            <p className="text-sm text-gray-600">Pending Approvals</p>
          </Card>
          <Card className="p-6">
            <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-gray-900">{completedTasksCount}</div>
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
              <h2 className="text-gray-900 mb-6">All Tasks</h2>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900">{task.title}</h3>
                        <Badge
                          variant={
                            task.status === 'active'
                              ? 'default'
                              :  task.status === 'completed'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>{new Date(task.date).toLocaleDateString()}</span>
                        <span>{task.duration_hours}</span>
                        <span>
                          {task.filled_spots}/{task.total_spots} spots filled
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers">
            <Card className="p-6">
              <h2 className="text-gray-900 mb-6">Registered Volunteers</h2>
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
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card className="p-6">
              <h2 className="text-gray-900 mb-6">Pending Bookings</h2>
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div>
                      <div className="text-gray-900 mb-1">{booking.volunteer_id.name}</div>
                      <div className="text-sm text-gray-600">
                        {booking.opportunity_id.title} • {new Date(booking.opportunity_id.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{booking.volunteer_id.email}</div>
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
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
