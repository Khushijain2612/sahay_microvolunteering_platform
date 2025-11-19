import { motion } from 'motion/react';
import { Award, Clock, Star, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
interface user {
  _id: string;
  name: string;
  email: string;
  total_hours: number; 
  badge: 'none' | 'bronze' | 'silver' | 'gold'; 
  rating: number;
  skills: string[];
}
interface Booking {
  _id: string;
  opportunity_id: {
    _id: string;
    title: string;
    date: string;
    ngo_id: {
      name: string;
    };
  };
  status: string;
  hours_completed?: number;
  rating?: number;
}

export function VolunteerDashboard() {
  const [user, setUser] = useState<user | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

 const fetchDashboardData = async () => {
  try {
    setLoading(true);
    
    // FIX: Type the response as any to avoid TypeScript errors
    const userData: any = await apiClient.request('/users/me');
    setUser(userData);
    
    const bookingsData: any = await apiClient.request('/bookings/user');
    setBookings(bookingsData);
    
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    setLoading(false);
  }
};

    const calculateTotalHours = () => {
    return bookings
      .filter(booking => booking.status === 'completed' && booking.hours_completed)
      .reduce((total, booking) => total + (booking.hours_completed || 0), 0);
  };

  const calculateMonthlyData = () => {
    const monthlyHours: { [key: string]: number } = {};
    
    bookings
      .filter(booking => booking.status === 'completed' && booking.hours_completed)
      .forEach(booking => {
        const month = new Date(booking.opportunity_id.date).toLocaleDateString('en-US', { 
          month: 'short', 
          year: '2-digit' 
        });
        monthlyHours[month] = (monthlyHours[month] || 0) + (booking.hours_completed || 0);
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
    const ratedBookings = bookings.filter(booking => booking.rating);
    if (ratedBookings.length === 0) return 0;
    
    const totalRating = ratedBookings.reduce((sum, booking) => sum + (booking.rating || 0), 0);
    return totalRating / ratedBookings.length;
  };
  const realTotalHours = calculateTotalHours();
  const monthlydata = calculateMonthlyData();
  const realAverageRating = calculateAverageRating();
  const completedTasksCount = bookings.filter(booking => booking.status === 'completed').length;
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
    if (user?.badge && user.badge !== 'none') return user.badge;
    
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

  // const upcomingTasks = [
  //   {
  //     id: 1,
  //     title: 'Food Distribution Support',
  //     ngo: 'City Food Bank',
  //     date: '2025-11-05',
  //     time: '10:00 AM',
  //     duration: '2 hours',
  //   },
  //   {
  //     id: 2,
  //     title: 'Youth Tutoring Session',
  //     ngo: 'Youth Mentorship',
  //     date: '2025-11-07',
  //     time: '3:00 PM',
  //     duration: '1 hour',
  //   },
  // ];

  // const pastActivity = [
  //   {
  //     id: 1,
  //     title: 'Beach Cleanup Drive',
  //     ngo: 'Environmental Care',
  //     date: '2025-10-28',
  //     hours: 2,
  //     rating: 5,
  //   },
  //   {
  //     id: 2,
  //     title: 'Senior Companionship',
  //     ngo: 'Elder Care Network',
  //     date: '2025-10-25',
  //     hours: 1,
  //     rating: 5,
  //   },
  //   {
  //     id: 3,
  //     title: 'Animal Shelter Care',
  //     ngo: 'Happy Paws Shelter',
  //     date: '2025-10-20',
  //     hours: 3,
  //     rating: 4,
  //   },
  // ];
  const upcomingTasks = bookings
    .filter(booking => booking.status === 'confirmed' || booking.status === 'pending')
    .map(booking => ({
      id: booking._id,
      title: booking.opportunity_id.title,
      ngo: booking.opportunity_id.ngo_id.name,
      date: booking.opportunity_id.date,
      time: '10:00 AM',
      duration: '2 hours',
    }));
    const pastActivity = bookings
    .filter(booking => booking.status === 'completed' && booking.hours_completed)
    .map(booking => ({
      id: booking._id,
      title: booking.opportunity_id.title,
      ngo: booking.opportunity_id.ngo_id.name,
      date: booking.opportunity_id.date,
      hours: booking.hours_completed || 0,
      rating: booking.rating || 5,
    }));

  // const monthlyData = [
  //   { month: 'Jun', hours: 5 },
  //   { month: 'Jul', hours: 8 },
  //   { month: 'Aug', hours: 12 },
  //   { month: 'Sep', hours: 15 },
  //   { month: 'Oct', hours: 22 },
  //   { month: 'Nov', hours: user.totalHours },
  // ];

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
          <h1 className="text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
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
            <div className="text-gray-900">{realTotalHours} Hours</div>
            <p className="text-sm text-gray-600">Total Volunteered</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-gray-900">{currentBadge.name}</div>
            <p className="text-sm text-gray-600">Current Badge</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-gray-900">{realAverageRating.toFixed(1)} / 5.0</div>
            <p className="text-sm text-gray-600">Average Rating</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-gray-900">{completedTasksCount}</div>
            <p className="text-sm text-gray-600">Tasks Completed</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Badge Progress */}
            <Card className="p-6">
              <h2 className="text-gray-900 mb-6">Badge Progress</h2>
              
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
                    <h3 className="text-gray-900">{currentBadge.name}</h3>
                    <span className="text-sm text-gray-600">{realTotalHours} hours</span>
                  </div>
                  <Progress value={progressToNext} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    {userBadge === 'gold' 
                      ? 'You\'ve reached the highest badge! Keep volunteering!'
                      : `${Math.max(0, nextBadgeHours - realTotalHours)} ${userBadge === 'none' ? 'bronze' : userBadge === 'bronze' ? 'silver' : 'gold'} badge`
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
                    <div className="text-sm text-gray-900">{badge.name}</div>
                    <div className="text-xs text-gray-600">{badge.requirement}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Activity Chart */}
            <Card className="p-6">
              <h2 className="text-gray-900 mb-6">Volunteering Growth</h2>
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
              <h2 className="text-gray-900 mb-6">Past Activity</h2>
              <div className="space-y-4">
                {pastActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-gray-900">{activity.title}</div>
                        <div className="text-sm text-gray-600">
                          {activity.ngo} • {new Date(activity.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900">{activity.hours}h</div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-gray-600">{activity.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Tasks */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">Upcoming Tasks</h2>
              </div>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="text-gray-900 mb-1">{task.title}</div>
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
                ))}
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-600" />
                <h2 className="text-gray-900">Recent Reviews</h2>
              </div>
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-900">{review.ngo}</div>
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
