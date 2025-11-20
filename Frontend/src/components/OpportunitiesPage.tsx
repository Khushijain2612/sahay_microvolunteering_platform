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
import { api, authHelper } from '@/lib/api';

interface Opportunity {
  _id: string; 
  title: string;
  organization: {
    name: string; 
  };
  duration: number; 
  date: string;
  location: string;
  skillsRequired: string[];
  volunteersRequired: number; 
  volunteersApplied: any[]; 
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

  // Hardcoded opportunities data
  const hardcodedOpportunities: Opportunity[] = [
    {
      _id: '1',
      title: 'Beach Cleanup Drive',
      organization: {
        name: 'Green Earth Alliance'
      },
      duration: 3,
      date: '2024-12-15',
      location: 'Marina Beach, Chennai',
      skillsRequired: ['Environment', 'Physical Work', 'Teamwork'],
      volunteersRequired: 20,
      volunteersApplied: Array(15),
      description: 'Join us for a coastal cleanup drive to protect marine life and keep our beaches clean.'
    },
    {
      _id: '2',
      title: 'Teaching Underprivileged Children',
      organization: {
        name: 'Education for All Trust'
      },
      duration: 2,
      date: '2024-12-10',
      location: 'Community Center, Bangalore',
      skillsRequired: ['Teaching', 'Communication', 'Patience'],
      volunteersRequired: 10,
      volunteersApplied: Array(8),
      description: 'Help teach basic English and Mathematics to children from underprivileged backgrounds.'
    },
    {
      _id: '3',
      title: 'Animal Shelter Assistance',
      organization: {
        name: 'Animal Welfare Society'
      },
      duration: 4,
      date: '2024-12-12',
      location: 'Animal Rescue Center, Delhi',
      skillsRequired: ['Animal Care', 'Compassion', 'Physical Work'],
      volunteersRequired: 15,
      volunteersApplied: Array(12),
      description: 'Assist in feeding, cleaning, and caring for rescued animals at our shelter.'
    },
    {
      _id: '4',
      title: 'Elderly Care & Companionship',
      organization: {
        name: 'Elder Care Support Network'
      },
      duration: 2,
      date: '2024-12-08',
      location: 'Senior Citizen Home, Mumbai',
      skillsRequired: ['Empathy', 'Communication', 'Listening'],
      volunteersRequired: 8,
      volunteersApplied: Array(6),
      description: 'Spend quality time with elderly residents, listen to their stories, and provide companionship.'
    },
    {
      _id: '5',
      title: 'Tree Plantation Campaign',
      organization: {
        name: 'Green Earth Alliance'
      },
      duration: 3,
      date: '2024-12-20',
      location: 'City Park, Hyderabad',
      skillsRequired: ['Environment', 'Gardening', 'Physical Work'],
      volunteersRequired: 25,
      volunteersApplied: Array(18),
      description: 'Help us plant 500+ saplings to increase green cover in the city.'
    },
    {
      _id: '6',
      title: 'Medical Camp Support',
      organization: {
        name: 'Community Health Initiative'
      },
      duration: 5,
      date: '2024-12-05',
      location: 'Urban Slum Area, Kolkata',
      skillsRequired: ['Organization', 'Communication', 'First Aid'],
      volunteersRequired: 12,
      volunteersApplied: Array(10),
      description: 'Support medical professionals in organizing and managing a free health checkup camp.'
    },
    {
      _id: '7',
      title: 'Digital Literacy Workshop',
      organization: {
        name: 'Education for All Trust'
      },
      duration: 2,
      date: '2024-12-18',
      location: 'Community Library, Pune',
      skillsRequired: ['Teaching', 'Technology', 'Patience'],
      volunteersRequired: 6,
      volunteersApplied: Array(4),
      description: 'Teach basic computer skills and internet usage to senior citizens.'
    },
    {
      _id: '8',
      title: 'Food Distribution Drive',
      organization: {
        name: 'Hope for Children Foundation'
      },
      duration: 2,
      date: '2024-12-25',
      location: 'Various Locations, Chennai',
      skillsRequired: ['Organization', 'Teamwork', 'Compassion'],
      volunteersRequired: 30,
      volunteersApplied: Array(25),
      description: 'Help distribute food packets and essential items to homeless people across the city.'
    },
    {
      _id: '9',
      title: 'Disaster Relief Support',
      organization: {
        name: 'Community Health Initiative'
      },
      duration: 6,
      date: '2024-12-22',
      location: 'Flood Affected Area, Kerala',
      skillsRequired: ['First Aid', 'Physical Work', 'Crisis Management'],
      volunteersRequired: 20,
      volunteersApplied: Array(15),
      description: 'Assist in relief operations including distribution of supplies and basic medical aid.'
    }
  ];

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await api.opportunities.getAll();
      const fetchedOpportunities = data.data?.opportunities || data.data || data;
      
      if (fetchedOpportunities && Array.isArray(fetchedOpportunities) && fetchedOpportunities.length > 0) {
        setOpportunities(fetchedOpportunities);
      } else {
        // Fallback to hardcoded opportunities if API returns empty or invalid data
        setOpportunities(hardcodedOpportunities);
        console.log('Using hardcoded opportunities data');
      }
    } catch (error) {
      console.error('Failed to fetch opportunities, using hardcoded data:', error);
      // Fallback to hardcoded opportunities on error
      setOpportunities(hardcodedOpportunities);
    } finally {
      setLoading(false);
    }
  };

  const filterOpportunities = () => {
    return opportunities.filter((opp) => {
      const durationMatch = selectedDuration === 'all' || 
        (selectedDuration === '4' ? opp.duration >= 4 : opp.duration.toString() === selectedDuration);
      const skillMatch = selectedSkill === 'all' || opp.skillsRequired.includes(selectedSkill); 
      const ngoMatch = selectedNGO === 'all' || opp.organization.name === selectedNGO;
      return durationMatch && skillMatch && ngoMatch;
    });
  };

  const filteredOpportunities = filterOpportunities();

  // Get unique NGOs for filter
  const uniqueNGOs = Array.from(new Set(opportunities.map(opp => opp.organization.name)));
  // Get unique skills for filter
  const allSkills = opportunities.flatMap(opp => opp.skillsRequired);
  const uniqueSkills = Array.from(new Set(allSkills));

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
                  <SelectItem value="4">4+ Hours</SelectItem>
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
                  {uniqueSkills.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
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
                  {uniqueNGOs.map(ngo => (
                    <SelectItem key={ngo} value={ngo}>{ngo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => {
            const filledSpots = opportunity.volunteersApplied?.length || 0;
            const availableSpots = opportunity.volunteersRequired - filledSpots;
            
            return (
              <div
                key={opportunity._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-gray-900">{opportunity.title}</h3>
                    {availableSpots <= 5 && availableSpots > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {availableSpots} spots left
                      </Badge>
                    )}
                    {availableSpots === 0 && (
                      <Badge variant="outline" className="text-xs">
                        Fully Booked
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-blue-600 mb-4">{opportunity.organization.name}</div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{opportunity.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{opportunity.duration} hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(opportunity.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{opportunity.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{availableSpots} spots available</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {opportunity.skillsRequired.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    className="w-full cursor-pointer"
                    onClick={() => onBookSlot(opportunity._id)}
                    disabled={availableSpots === 0}
                  >
                    {availableSpots === 0 ? 'Fully Booked' : 'Book Slot'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOpportunities.length === 0 && !loading && (
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

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading opportunities...</p>
          </div>
        )}
      </div>
    </div>
  );
}