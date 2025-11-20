import { motion } from 'motion/react';
import { Award, Clock, Star, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { api, authHelper } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  totalHours: number; 
  rating: number;
  skills: string[];
  completedTasks: number;
  role?: string;
}

interface Assignment {
  _id: string;
  event: {
    _id: string;
    eventName: string;
    date: string;
    organizer: {
      name: string;
    };
  };
  status: string;
  hoursCompleted?: number;
  rating?: number;
}

interface Application {
  _id: string;
  opportunity: {
    _id: string;
    title: string;
    date: string;
    organization: {
      name: string;
    };
  };
  status: string;
  hoursCompleted?: number;
  rating?: number;
}

interface VolunteerDashboardProps {
  onNavigate?: (path: string) => void;
}

export function VolunteerDashboard({ onNavigate }: VolunteerDashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Safe navigation function
  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      // Fallback: use window.location for direct navigation
      window.location.href = path;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check authentication first
      const token = authHelper.getToken();
      if (!token) {
        navigateTo('/login');
        return;
      }

      // Fetch user data
      try {
        const userData = await api.auth.getMe();
        console.log('User data:', userData);
        
        const currentUser = userData.user || userData.data?.user || userData.data || userData;
        
        if (!currentUser) {
          throw new Error('No user data received');
        }
        
        // Check if user is volunteer
        if (currentUser.role && currentUser.role !== 'volunteer') {
          navigateTo('/');
          return;
        }
        
        setUser(currentUser);
        
        // Fetch volunteer data
        await fetchVolunteerData();
        
      } catch (authError: any) {
        console.error('Auth check failed:', authError);
        authHelper.removeToken();
        navigateTo('/login');
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteerData = async () => {
    try {
      // Fetch booked opportunities (assignments)
      const eventsData = await api.volunteer.getBookedOpportunities();
      console.log('Booked opportunities:', eventsData);
      setAssignments(eventsData.assignments || eventsData.data?.assignments || eventsData.data || eventsData || []);
      
      // Fetch work history (applications)
      const workHistoryData = await api.volunteer.getWorkHistory();
      console.log('Work history:', workHistoryData);
      setApplications(workHistoryData.applications || workHistoryData.data?.applications || workHistoryData.data || workHistoryData || []);
      
    } catch (error: any) {
      console.error('Failed to fetch volunteer data:', error);
      
      // If specific endpoints don't exist, use fallbacks
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        console.log('Using fallback data for volunteer endpoints');
        setAssignments([]);
        setApplications([]);
      }
    }
  };

  const calculateTotalHours = () => {
    const eventHours = assignments
      .filter(assignment => assignment.status === 'completed' && assignment.hoursCompleted)
      .reduce((total, assignment) => total + (assignment.hoursCompleted || 0), 0);
    
    const opportunityHours = applications
      .filter(application => application.status === 'completed' && application.hoursCompleted)
      .reduce((total, application) => total + (application.hoursCompleted || 0), 0);
    
    return eventHours + opportunityHours;
  };

  const calculateMonthlyData = () => {
    const monthlyHours: { [key: string]: number } = {};
    
    // Process event assignments
    assignments
      .filter(assignment => assignment.status === 'completed' && assignment.hoursCompleted)
      .forEach(assignment => {
        if (assignment.event && assignment.event.date) {
          const month = new Date(assignment.event.date).toLocaleDateString('en-US', { 
            month: 'short', 
            year: '2-digit' 
          });
          monthlyHours[month] = (monthlyHours[month] || 0) + (assignment.hoursCompleted || 0);
        }
      });
    
    // Process opportunity applications
    applications
      .filter(application => application.status === 'completed' && application.hoursCompleted)
      .forEach(application => {
        if (application.opportunity && application.opportunity.date) {
          const month = new Date(application.opportunity.date).toLocaleDateString('en-US', { 
            month: 'short', 
            year: '2-digit' 
          });
          monthlyHours[month] = (monthlyHours[month] || 0) + (application.hoursCompleted || 0);
        }
      });
    
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push({
        month: monthKey,
        hours: monthlyHours[monthKey] || 0
      });
    }
    
    return months;
  };

  const calculateAverageRating = () => {
    const ratedAssignments = assignments.filter(assignment => assignment.rating);
    const ratedApplications = applications.filter(application => application.rating);
    const allRated = [...ratedAssignments, ...ratedApplications];
    
    if (allRated.length === 0) return user?.rating || 4.5; // Default rating
    
    const totalRating = allRated.reduce((sum, item) => sum + (item.rating || 0), 0);
    return totalRating / allRated.length;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading volunteer dashboard...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not volunteer
  if (user && user.role && user.role !== 'volunteer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Access denied. Volunteer privileges required.</p>
          <button 
            onClick={() => navigateTo('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const realTotalHours = calculateTotalHours();
  const monthlydata = calculateMonthlyData();
  const realAverageRating = calculateAverageRating();
  const completedTasksCount = 
    assignments.filter(assignment => assignment.status === 'completed').length +
    applications.filter(application => application.status === 'completed').length;

  const badges = {
    none: {
      name: 'No Badge Yet',
      color: 'from-gray-400 to-gray-300',
      icon: '🔰',
      requirement: '0+ hours',
    },
    bronze: {
      name: 'Bronze Volunteer',
      color: 'from-amber-700 to-amber-500',
      icon: '🥉',
      requirement: '10+ hours',
    },
    silver: {
      name: 'Silver Volunteer',
      color: 'from-gray-400 to-gray-300',
      icon: '🥈',
      requirement: '25+ hours',
    },
    gold: {
      name: 'Gold Volunteer',
      color: 'from-yellow-500 to-yellow-300',
      icon: '🥇',
      requirement: '50+ hours',
    },
  };

  const determineBadge = () => {
    if (realTotalHours >= 50) return 'gold';
    if (realTotalHours >= 25) return 'silver';
    if (realTotalHours >= 10) return 'bronze';
    return 'none';
  };

  const userBadge = determineBadge();
  const currentBadge = badges[userBadge];

  const nextBadgeHours = 
    userBadge === 'none' ? 10 : 
    userBadge === 'bronze' ? 25 : 
    userBadge === 'silver' ? 50 : 100;

  const progressToNext = userBadge === 'gold' ? 100 : 
    Math.min(100, (realTotalHours / nextBadgeHours) * 100);

  const upcomingTasks = [
    ...assignments
      .filter(assignment => assignment.status === 'assigned' || assignment.status === 'confirmed')
      .map(assignment => ({
        id: assignment._id,
        title: assignment.event?.eventName || 'Event',
        ngo: assignment.event?.organizer?.name || 'Organization',
        date: assignment.event?.date || new Date().toISOString(),
        time: '10:00 AM',
        duration: '2 hours',
        type: 'event'
      })),
    ...applications
      .filter(application => application.status === 'confirmed' || application.status === 'assigned')
      .map(application => ({
        id: application._id,
        title: application.opportunity?.title || 'Opportunity',
        ngo: application.opportunity?.organization?.name || 'Organization',
        date: application.opportunity?.date || new Date().toISOString(),
        time: '10:00 AM',
        duration: '2 hours',
        type: 'opportunity'
      }))
  ];

  const pastActivity = [
    ...assignments
      .filter(assignment => assignment.status === 'completed' && assignment.hoursCompleted)
      .map(assignment => ({
        id: assignment._id,
        title: assignment.event?.eventName || 'Event',
        ngo: assignment.event?.organizer?.name || 'Organization',
        date: assignment.event?.date || new Date().toISOString(),
        hours: assignment.hoursCompleted || 0,
        rating: assignment.rating || 5,
        type: 'event'
      })),
    ...applications
      .filter(application => application.status === 'completed' && application.hoursCompleted)
      .map(application => ({
        id: application._id,
        title: application.opportunity?.title || 'Opportunity',
        ngo: application.opportunity?.organization?.name || 'Organization',
        date: application.opportunity?.date || new Date().toISOString(),
        hours: application.hoursCompleted || 0,
        rating: application.rating || 5,
        type: 'opportunity'
      }))
  ];

  const reviews = [
    {
      ngo: 'City Food Bank',
      rating: 5,
      comment: 'Excellent volunteer! Very dedicated and helpful.',
      date: '2025-10-28',
    },
    {
      ngo: 'Elder Care Network',
      rating: 5,
      comment: 'Wonderful person. The seniors loved spending time with them.',
      date: '2025-10-25',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || 'Volunteer'}!</h1>
          <p className="text-gray-600">Here's your volunteering journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{realTotalHours} Hours</div>
            <p className="text-sm text-gray-600">Total Volunteered</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{currentBadge.name}</div>
            <p className="text-sm text-gray-600">Current Badge</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{realAverageRating.toFixed(1)} / 5.0</div>
            <p className="text-sm text-gray-600">Average Rating</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{completedTasksCount}</div>
            <p className="text-sm text-gray-600">Tasks Completed</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Badge Progress */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Badge Progress</h2>
              
              <div className="flex items-center gap-6 mb-6">
                <motion.div
                  className={`w-24 h-24 bg-gradient-to-br ${currentBadge.color} rounded-full flex items-center justify-center text-4xl shadow-lg`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  {currentBadge.icon}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{currentBadge.name}</h3>
                    <span className="text-sm text-gray-600">{realTotalHours} hours</span>
                  </div>
                  <Progress value={progressToNext} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    {userBadge === 'gold' 
                      ? 'You\'ve reached the highest badge! Keep volunteering!'
                      : `${Math.max(0, nextBadgeHours - realTotalHours)} hours to ${userBadge === 'none' ? 'bronze' : userBadge === 'bronze' ? 'silver' : 'gold'} badge`
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {Object.entries(badges).map(([key, badge]) => (
                  <div
                    key={key}
                    className={`text-center p-4 rounded-lg ${
                      userBadge === key ? 'bg-gray-100' : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{badge.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{badge.name}</div>
                    <div className="text-xs text-gray-600">{badge.requirement}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Activity Chart */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Volunteering Growth</h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlydata}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#3B82F6"
                    fill="#93C5FD"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Past Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Past Activity</h2>
              <div className="space-y-4">
                {pastActivity.length > 0 ? (
                  pastActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{activity.title}</div>
                          <div className="text-sm text-gray-600">
                            {activity.ngo} • {new Date(activity.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{activity.hours}h</div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-gray-600">{activity.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No past activities yet</p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Tasks */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Upcoming Tasks</h2>
              </div>
              <div className="space-y-4">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="font-medium text-gray-900 mb-1">{task.title}</div>
                      <div className="text-sm text-gray-600 mb-2">{task.ngo}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(task.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{task.time} • {task.duration}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No upcoming tasks</p>
                )}
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
              </div>
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{review.ngo}</div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-500 fill-yellow-500"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">"{review.comment}"</p>
                    <div className="text-xs text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}