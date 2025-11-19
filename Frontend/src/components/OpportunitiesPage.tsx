import { useState, useEffect } from 'react';
import { Clock, MapPin, Users, Calendar, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { apiClient } from '../../lib/api';
interface Opportunity {
  _id: string; 
  title: string;
  ngo_id: {
    name: string; 
  };
  duration_hours: number; 
  date: string;
  location: {
    address: string; 
  };
  skills_required: string[];
  total_spots: number; 
  filled_spots: number; 
  description: string;
}

interface OpportunitiesPageProps {
  onBookSlot: (opportunityId: string) => void;
}

export function OpportunitiesPage({ onBookSlot }: OpportunitiesPageProps) {
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedNGO, setSelectedNGO] = useState<string>('all');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  // const opportunities: Opportunity[] = [
  //   {
  //     id: 1,
  //     title: 'Food Distribution Support',
  //     ngo: 'City Food Bank',
  //     duration: '2 hours',
  //     date: '2025-11-05',
  //     location: 'Downtown Center',
  //     skills: ['Physical Work', 'Communication'],
  //     spots: 8,
  //     description: 'Help distribute food packages to families in need.',
  //   },
  //   {
  //     id: 2,
  //     title: 'Animal Shelter Care',
  //     ngo: 'Happy Paws Shelter',
  //     duration: '3 hours',
  //     date: '2025-11-06',
  //     location: 'West Side',
  //     skills: ['Animal Care', 'Patience'],
  //     spots: 4,
  //     description: 'Assist with feeding, cleaning, and socializing shelter animals.',
  //   },
  //   {
  //     id: 3,
  //     title: 'Youth Tutoring Session',
  //     ngo: 'Youth Mentorship',
  //     duration: '1 hour',
  //     date: '2025-11-07',
  //     location: 'Community Library',
  //     skills: ['Teaching', 'Patience'],
  //     spots: 12,
  //     description: 'Help students with homework and reading comprehension.',
  //   },
  //   {
  //     id: 4,
  //     title: 'Beach Cleanup Drive',
  //     ngo: 'Environmental Care',
  //     duration: '2 hours',
  //     date: '2025-11-08',
  //     location: 'Sunset Beach',
  //     skills: ['Physical Work', 'Teamwork'],
  //     spots: 20,
  //     description: 'Join us in cleaning up our local beach and protecting marine life.',
  //   },
  //   {
  //     id: 5,
  //     title: 'Senior Companionship',
  //     ngo: 'Elder Care Network',
  //     duration: '1 hour',
  //     date: '2025-11-09',
  //     location: 'Sunrise Senior Home',
  //     skills: ['Communication', 'Empathy'],
  //     spots: 6,
  //     description: 'Spend quality time chatting with seniors and brightening their day.',
  //   },
  //   {
  //     id: 6,
  //     title: 'Community Garden Planting',
  //     ngo: 'Green Spaces Initiative',
  //     duration: '3 hours',
  //     date: '2025-11-10',
  //     location: 'Central Park',
  //     skills: ['Physical Work', 'Gardening'],
  //     spots: 15,
  //     description: 'Help plant vegetables and maintain our community garden.',
  //   },
  // ];
  useEffect(() => {
    fetchOpportunities();
  }, []);
   const fetchOpportunities = async () => {
  try {
    setLoading(true);
    const data: any = await apiClient.getOpportunities();
    setOpportunities(data.opportunities || data);
  } catch (error) {
    console.error('Failed to fetch opportunities');
  } finally {
    setLoading(false);
  }
};
  const filterOpportunities = () => {
    return opportunities.filter((opp) => {
      const durationMatch = selectedDuration === 'all' || opp.duration_hours.toString().includes(selectedDuration);
      const skillMatch = selectedSkill === 'all' || opp.skills_required.includes(selectedSkill); 
      const ngoMatch = selectedNGO === 'all' || opp.ngo_id.name === selectedNGO;
      return durationMatch && skillMatch && ngoMatch;
    });
  };

  const filteredOpportunities = filterOpportunities();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-gray-900 mb-4">Volunteer Opportunities</h1>
          <p className="text-gray-600">
            Find the perfect volunteering opportunity that fits your schedule
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-gray-900">Filter Opportunities</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Duration</label>
              <Select value={selectedDuration} onValueChange={setSelectedDuration} >
                <SelectTrigger className="bg-white border border-gray-300 text-gray-600">
                  <SelectValue placeholder="Select duration" className="cursor-pointer" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 text-gray-600">
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="2">2 Hours</SelectItem>
                  <SelectItem value="3">3 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Skill Type</label>
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger className="bg-white border border-gray-300 text-gray-600">
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 text-gray-600">
                  <SelectItem value="all">All Skills</SelectItem>
                  <SelectItem value="Physical Work">Physical Work</SelectItem>
                  <SelectItem value="Teaching">Teaching</SelectItem>
                  <SelectItem value="Communication">Communication</SelectItem>
                  <SelectItem value="Animal Care">Animal Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">NGO</label>
              <Select value={selectedNGO} onValueChange={setSelectedNGO}>
                <SelectTrigger className="bg-white border border-gray-300 text-gray-600">
                  <SelectValue placeholder="Select NGO" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 text-gray-600">
                  <SelectItem value="all">All NGOs</SelectItem>
                  <SelectItem value="City Food Bank">City Food Bank</SelectItem>
                  <SelectItem value="Happy Paws Shelter">Happy Paws Shelter</SelectItem>
                  <SelectItem value="Youth Mentorship">Youth Mentorship</SelectItem>
                  <SelectItem value="Environmental Care">Environmental Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

{/* Opportunities Grid */}
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredOpportunities.map((opportunity) => {
    // CALCULATE: Available spots (moved inside the map callback, before return)
    const availableSpots = opportunity.total_spots - opportunity.filled_spots;
    
    return (
      <div
        key={opportunity._id}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-gray-900">{opportunity.title}</h3>
            {availableSpots <= 5 && (
              <Badge variant="destructive" className="text-xs">
                {availableSpots} spots left
              </Badge>
            )}
          </div>

                <div className="text-sm text-blue-600 mb-4">{opportunity.ngo_id.name}</div>

                <p className="text-sm text-gray-600 mb-4">{opportunity.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{opportunity.duration_hours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(opportunity.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{opportunity.location.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{availableSpots} spots available</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {opportunity.skills_required.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <Button
                  className="w-full cursor-pointer"
                  onClick={() => onBookSlot(opportunity._id)}
                >
                  Book Slot
                </Button>
              </div>
            </div>
            );
          })}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No opportunities found matching your filters.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSelectedDuration('all');
                setSelectedSkill('all');
                setSelectedNGO('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
