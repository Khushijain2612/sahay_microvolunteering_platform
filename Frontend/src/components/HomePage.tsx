import { ArrowRight, Clock, Award, Users, Heart, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './Resources/ImageWithFallback';
import { useState, useEffect } from 'react'; // ADD: useEffect
import { apiClient } from '@/lib/api'; // ADD: API client

interface HomePageProps {
  onNavigate: (page: string) => void;
}

// ADD: Interface for backend stats
interface PlatformStats {
  total_volunteers: number;
  total_ngos: number;
  total_hours: number;
  completed_tasks_today: number;
}

// ADD: Interface for testimonials from backend
interface Testimonial {
  _id: string;
  user_id: {
    name: string;
    profile_image?: string;
  };
  review_text: string;
  rating: number;
  created_at: string;
  total_hours?: number;
}

export function HomePage({ onNavigate }: HomePageProps) {
  // ADD: State for backend data
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    total_volunteers: 0,
    total_ngos: 0,
    total_hours: 0,
    completed_tasks_today: 0
  });
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // ADD: Fetch platform stats and testimonials
  useEffect(() => {
    fetchHomePageData();
  }, []);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);
      
      // Fetch platform statistics
      const statsData = await apiClient.request('/stats/platform');
      setPlatformStats(statsData);
      
      // Fetch featured testimonials
      const testimonialsData = await apiClient.request('/reviews/featured');
      setTestimonials(testimonialsDataa);
      
    } catch (error) {
      console.error('Failed to fetch homepage data:', error);
      // Fallback to default data
      setPlatformStats({
        total_volunteers: 10000,
        total_ngos: 500,
        total_hours: 50000,
        completed_tasks_today: 234
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Clock,
      title: 'Flexible Hours',
      description: 'Volunteer for as little as 1 hour. Perfect for busy schedules.',
    },
    {
      icon: Award,
      title: 'Earn Rewards',
      description: 'Get recognized with Gold, Silver, and Bronze badges.',
    },
    {
      icon: Users,
      title: 'Community Impact',
      description: 'Join thousands making a difference in local communities.',
    },
    {
      icon: Heart,
      title: 'Celebrate Together',
      description: 'Turn special occasions into meaningful volunteer experiences.',
    },
  ];

  const ngoPartners = [
    'Red Cross',
    'Habitat for Humanity',
    'Food Bank',
    'Animal Shelter',
    'Youth Mentorship',
    'Environmental Care',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-gray-900">
                Give a little time.<br />Make a big difference.
              </h1>
              <p className="text-gray-600">
                Sahay connects you with meaningful micro-volunteering opportunities. 
                Whether you have an hour or a day, your time can transform lives.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => onNavigate('opportunities')}
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Find Opportunities
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate('celebration')}
                  className="cursor-pointer"
                >
                  Celebrate with Us
                </Button>
              </div>
              {/* UPDATE: Use real platform stats */}
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-blue-600">
                    {loading ? '...' : platformStats.total_volunteers.toLocaleString()}+
                  </div>
                  <div className="text-sm text-gray-600">Volunteers</div>
                </div>
                <div>
                  <div className="text-green-600">
                    {loading ? '...' : platformStats.total_ngos}+
                  </div>
                  <div className="text-sm text-gray-600">NGO Partners</div>
                </div>
                <div>
                  <div className="text-amber-600">
                    {loading ? '...' : platformStats.total_hours.toLocaleString()}+
                  </div>
                  <div className="text-sm text-gray-600">Hours Given</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758599668125-e154250f24bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2x1bnRlZXJzJTIwY29tbXVuaXR5JTIwaGVscGluZ3xlbnwxfHx8fDE3NjE1NTY4MzR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Volunteers working together"
                className="rounded-2xl shadow-2xl w-full"
              />
              {/* UPDATE: Use real completed tasks count */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-gray-900">
                      {loading ? '...' : platformStats.completed_tasks_today} Tasks
                    </div>
                    <div className="text-sm text-gray-600">Completed Today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Micro-Volunteering */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-gray-900 mb-4">What is Micro-Volunteering?</h2>
            <p className="text-gray-600">
              Micro-volunteering is about making a big impact with small commitments. 
              Whether you have 30 minutes during lunch or a few hours on the weekend, 
              every moment counts. No long-term commitments, just meaningful action when you're available.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NGO Partners */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Our NGO Partners</h2>
            <p className="text-gray-600">
              We work with trusted organizations making real impact
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {ngoPartners.map((ngo, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center text-center hover:shadow-md transition-shadow"
              >
                <div className="text-gray-700">{ngo}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - UPDATE: Use real testimonials from backend */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Volunteer Stories</h2>
            <p className="text-gray-600">
              Hear from our amazing community members
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <div
                key={testimonial._id}
                className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-2xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <ImageWithFallback
                    src={testimonial.user_id.profile_image || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'}
                    alt={testimonial.user_id.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-gray-900">{testimonial.user_id.name}</div>
                    <div className="text-sm text-gray-600">
                      {testimonial.total_hours || 'Multiple'} hours volunteered
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.review_text}"</p>
                <div className="flex items-center gap-1 mt-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
              </div>
            ))}
            {/* Fallback if no testimonials from backend */}
            {testimonials.length === 0 && (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
                      alt="Sarah Johnson"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-gray-900">Sarah Johnson</div>
                      <div className="text-sm text-gray-600">45 hours volunteered</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"Sahay made it so easy to fit volunteering into my busy schedule. I love that I can help even with just an hour to spare!"</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
                      alt="Michael Chen"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-gray-900">Michael Chen</div>
                      <div className="text-sm text-gray-600">32 hours volunteered</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"I celebrated my birthday by volunteering at a food bank through Sahay. Best birthday ever!"</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                      alt="Emily Rodriguez"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-gray-900">Emily Rodriguez</div>
                      <div className="text-sm text-gray-600">67 hours volunteered</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"The badge system keeps me motivated. Just earned my Gold badge after 50 hours!"</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-blue-100 mb-8">
            Join {loading ? 'thousands of' : platformStats.total_volunteers.toLocaleString()} volunteers who are changing lives, one hour at a time.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => onNavigate('opportunities')}
            className="bg-white text-blue-600 hover:bg-gray-100 cursor-pointer"
          >
            Get Started Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}