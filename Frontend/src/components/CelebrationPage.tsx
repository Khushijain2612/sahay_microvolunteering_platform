import { useState, useEffect } from 'react';
import { Cake, Calendar, Users, Heart, Gift, PartyPopper, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ImageWithFallback } from './Resources/ImageWithFallback'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { api, authHelper } from '@/lib/api';

interface NGO {
  _id: string;
  name: string;
  description: string;
  category: string[];
}

interface CelebrationPageProps {
  onBookCelebration: (data: CelebrationBooking) => void;
}

export interface CelebrationBooking {
  eventType: string;
  date: string;
  ngo: string;
  people: number;
  name: string;
  message: string;
}

// Local storage key for celebrations
const CELEBRATIONS_STORAGE_KEY = 'saved_celebrations';

export function CelebrationPage({ onBookCelebration }: CelebrationPageProps) {
  const [formData, setFormData] = useState<CelebrationBooking>({
    eventType: '',
    date: '',
    ngo: '',
    people: 1,
    name: '',
    message: '',
  });

  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Hardcoded NGO data
  const hardcodedNGOs: NGO[] = [
    {
      _id: '1',
      name: 'Hope for Children Foundation',
      description: 'Dedicated to improving the lives of underprivileged children through education and healthcare.',
      category: ['Children', 'Education', 'Healthcare']
    },
    {
      _id: '2',
      name: 'Green Earth Alliance',
      description: 'Working towards environmental conservation and sustainable development practices.',
      category: ['Environment', 'Conservation', 'Sustainability']
    },
    {
      _id: '3',
      name: 'Community Health Initiative',
      description: 'Providing healthcare services and medical support to underserved communities.',
      category: ['Healthcare', 'Medical', 'Community']
    },
    {
      _id: '4',
      name: 'Elder Care Support Network',
      description: 'Supporting senior citizens with healthcare, companionship, and essential services.',
      category: ['Elderly', 'Healthcare', 'Community']
    },
    {
      _id: '5',
      name: 'Education for All Trust',
      description: 'Promoting literacy and education access for children in rural areas.',
      category: ['Education', 'Children', 'Literacy']
    },
    {
      _id: '6',
      name: 'Animal Welfare Society',
      description: 'Rescuing and caring for stray and abandoned animals in the community.',
      category: ['Animals', 'Rescue', 'Welfare']
    }
  ];

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
  try {
    // Try to get organizations from a public endpoint instead of admin
    const ngosData = await api.admin.getNGOs(); // Use public NGO endpoint
    const fetchedNGOs = ngosData.data?.users || ngosData.data || ngosData;
    
    if (fetchedNGOs && Array.isArray(fetchedNGOs) && fetchedNGOs.length > 0) {
      setNgos(fetchedNGOs);
    } else {
      // Fallback to hardcoded NGOs if API returns empty or invalid data
      setNgos(hardcodedNGOs);
      console.log('Using hardcoded NGO data');
    }
  } catch (error) {
    console.error('Failed to fetch NGOs, using hardcoded data:', error);
    // Fallback to hardcoded NGOs on error
    setNgos(hardcodedNGOs);
    toast.info('Loaded NGO partners from available data');
  }
};

  const eventTypes = [
    { value: 'birthday', label: 'Birthday', icon: Cake },
    { value: 'anniversary', label: 'Anniversary', icon: Heart },
    { value: 'graduation', label: 'Graduation', icon: PartyPopper },
    { value: 'corporate', label: 'Corporate Event', icon: Users },
    { value: 'memorial', label: 'Memorial', icon: Gift },
  ];

  const celebrationIdeas = [
    {
      title: 'Birthday Giving',
      description: 'Instead of gifts, celebrate with a volunteering session',
      image: 'https://images.unsplash.com/photo-1758691737584-a8f17fb34475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtd29yayUyMGNlbGVicmF0aW9ufGVufDF8fHx8MTc2MTY1NjY5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Anniversary Impact',
      description: 'Mark your special day by making a difference together',
      image: 'https://images.unsplash.com/photo-1697665387559-253e7a645e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFyaXR5JTIwZG9uYXRpb24lMjBoYW5kc3xlbnwxfHx8fDE3NjE2NTY2OTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Corporate Volunteering',
      description: 'Build team spirit while giving back to the community',
      image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBzZXJ2aWNlfGVufDF8fHx8MTc2MTY1NjE2OXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  // Save celebration to local storage
  const saveCelebrationToLocalStorage = (celebrationData: CelebrationBooking & { id: string; createdAt: string }) => {
    try {
      const existingCelebrations = JSON.parse(localStorage.getItem(CELEBRATIONS_STORAGE_KEY) || '[]');
      const updatedCelebrations = [...existingCelebrations, celebrationData];
      localStorage.setItem(CELEBRATIONS_STORAGE_KEY, JSON.stringify(updatedCelebrations));
      return true;
    } catch (error) {
      console.error('Failed to save to local storage:', error);
      return false;
    }
  };

  // Try to save via API first, fallback to local storage
  const saveCelebrationToAPI = async (celebrationData: any) => {
    try {
      // Try different possible endpoints
      const endpoints = [
        '/api/events',
        '/api/celebrations',
        '/api/event/create',
        '/api/celebration/create'
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await fetch(`https://sahay-microvolunteering-0jhc.onrender.com${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(celebrationData),
          });

          if (response.ok) {
            const result = await response.json();
            console.log(`Successfully saved to endpoint: ${endpoint}`, result);
            return { success: true, endpoint };
          }
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed:`, error);
          continue;
        }
      }

      // If all API endpoints fail, fallback to local storage
      throw new Error('No working API endpoint found');
      
    } catch (error) {
      console.log('All API endpoints failed, falling back to local storage');
      return { success: false, error };
    }
  };

  const resetForm = () => {
    setFormData({
      eventType: '',
      date: '',
      ngo: '',
      people: 1,
      name: '',
      message: '',
    });
    setSelectKey(prev => prev + 1);
  };

  const [selectKey, setSelectKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedNGO = ngos.find(ngo => ngo.name === formData.ngo);
      
      if (!selectedNGO) {
        toast.error('Please select a valid NGO partner');
        setLoading(false);
        return;
      }

      const celebrationData = {
        eventName: `${formData.eventType} Celebration - ${formData.name}`,
        eventType: formData.eventType,
        date: formData.date,
        organizer: selectedNGO._id,
        volunteersRequired: formData.people,
        description: formData.message,
        location: {
          address: "To be determined with NGO"
        },
        duration: 2,
        contactPerson: {
          name: formData.name,
          email: "user@example.com",
          phone: "0000000000"
        },
        ngoName: selectedNGO.name,
        ngoCategory: selectedNGO.category
      };

      console.log('Submitting celebration data:', celebrationData);

      // Try to save via API first
      const apiResult = await saveCelebrationToAPI(celebrationData);

      if (apiResult.success) {
        // Successfully saved to API
        toast.success(`Celebration event booked successfully! Saved to database via ${apiResult.endpoint}`);
      } else {
        // Fallback to local storage
        const localData = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          ngoId: selectedNGO._id
        };

        const localSaveResult = saveCelebrationToLocalStorage(localData);
        
        if (localSaveResult) {
          toast.success('Celebration event booked successfully! (Saved locally)');
        } else {
          toast.error('Failed to save celebration data');
          setLoading(false);
          return;
        }
      }

      // Call the parent callback
      onBookCelebration(formData);
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form fields
      resetForm();

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

    } catch (error: any) {
      console.error('Booking failed:', error);
      const errorMessage = error.message || 'Failed to book celebration event';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-green-800 font-medium">Event Booked Successfully!</h4>
                  <p className="text-green-600 text-sm mt-1">
                    Your celebration event has been booked. We'll contact you soon with more details.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <PartyPopper className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-4">Celebrate with Purpose</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Turn your special occasions into meaningful experiences. 
            Instead of traditional celebrations, make memories while making a difference.
          </p>
        </div>

        {/* Celebration Ideas */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {celebrationIdeas.map((idea, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <ImageWithFallback
                src={idea.image}
                alt={idea.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-gray-900 mb-2">{idea.title}</h3>
                <p className="text-sm text-gray-600">{idea.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Form */}
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl shadow-lg p-8 bg-white border border-gray-300 text-gray-600">
            <h2 className="text-gray-900 mb-6">Book Your Celebration Event</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Type */}
              <div>
                <Label htmlFor="eventType">Event Type *</Label>
                <Select
                  key={`eventType-${selectKey}`}
                  value={formData.eventType}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, eventType: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent className='text-black bg-white'>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Date and People */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Event Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="people">Number of People *</Label>
                  <Input
                    id="people"
                    type="number"
                    min="1"
                    max="50"
                    placeholder="How many people?"
                    value={formData.people}
                    onChange={(e) =>
                      setFormData({ ...formData, people: parseInt(e.target.value) || 1 })
                    }
                    required
                  />
                </div>
              </div>

              {/* NGO Selection */}
              <div>
                <Label htmlFor="ngo">Choose NGO Partner *</Label>
                <Select 
                  key={`ngo-${selectKey}`}
                  value={formData.ngo}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, ngo: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select NGO" />
                  </SelectTrigger>
                  <SelectContent className='text-black bg-white'>
                    {ngos.map((ngo) => (
                      <SelectItem key={ngo._id} value={ngo.name}>
                        <div className="flex flex-col">
                          <span className="font-medium">{ngo.name}</span>
                          <span className="text-xs text-gray-500">
                            {ngo.category.join(', ')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  {ngos.length} NGO partners available
                </p>
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message">Special Message (Optional)</Label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Tell us why this celebration is special..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-gradient-to-r cursor-pointer from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <PartyPopper className="mr-2 w-5 h-5" />
                    Book Celebration Event
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Info Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl text-center shadow-sm">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="text-gray-900 mb-2">Flexible Dates</h3>
              <p className="text-sm text-gray-600">Book weeks or months in advance</p>
            </div>
            <div className="bg-white p-6 rounded-xl text-center shadow-sm">
              <Users className="w-8 h-8 text-pink-600 mx-auto mb-3" />
              <h3 className="text-gray-900 mb-2">Group Activities</h3>
              <p className="text-sm text-gray-600">Perfect for teams and families</p>
            </div>
            <div className="bg-white p-6 rounded-xl text-center shadow-sm">
              <Gift className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-gray-900 mb-2">Meaningful Impact</h3>
              <p className="text-sm text-gray-600">Create lasting memories</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}