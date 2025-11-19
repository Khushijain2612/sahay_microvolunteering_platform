// Mock API client for testing
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Mock data
const mockUsers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'volunteer',
    total_hours: 25,
    badge: 'silver',
    rating: 4.8,
    skills: ['Teaching', 'Communication']
  }
];

const mockOpportunities = [
  {
    _id: '1',
    title: 'Food Distribution Support',
    description: 'Help distribute food packages to families in need',
    ngo_id: {
      _id: '1',
      name: 'City Food Bank',
      logo_url: '',
      verified: true
    },
    duration_hours: 2,
    date: '2024-12-05',
    location: {
      address: 'Downtown Center',
      type: 'onsite'
    },
    skills_required: ['Physical Work', 'Communication'],
    total_spots: 8,
    filled_spots: 3,
    status: 'active'
  },
  {
    _id: '2',
    title: 'Animal Shelter Care',
    description: 'Assist with feeding and cleaning shelter animals',
    ngo_id: {
      _id: '2',
      name: 'Happy Paws Shelter', 
      logo_url: '',
      verified: true
    },
    duration_hours: 3,
    date: '2024-12-06',
    location: {
      address: 'West Side Shelter',
      type: 'onsite'
    },
    skills_required: ['Animal Care', 'Patience'],
    total_spots: 4,
    filled_spots: 2,
    status: 'active'
  }
];

const mockNGOs = [
  {
    _id: '1',
    name: 'City Food Bank',
    description: 'Providing meals to underprivileged communities',
    email: 'contact@cityfoodbank.org',
    category: ['food-security'],
    verified: true
  },
  {
    _id: '2',
    name: 'Happy Paws Shelter',
    description: 'Rescuing and rehabilitating stray animals', 
    email: 'info@happypaws.org',
    category: ['animal-welfare'],
    verified: true
  }
];

// Mock API client
export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    console.log(`📡 Mock API Call: ${endpoint}`, options);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Handle different endpoints
    switch (endpoint) {
      case '/auth/login':
        if (options.method === 'POST') {
          const body = JSON.parse(options.body as string);
          if (body.password === 'password') {
            return {
              token: 'mock-jwt-token',
              user: {
                id: '1',
                email: body.email,
                name: 'John Doe',
                role: body.role || 'volunteer'
              }
            };
          }
          throw new Error('Invalid credentials');
        }
        break;
        
      case '/auth/register':
        if (options.method === 'POST') {
          const body = JSON.parse(options.body as string);
          return {
            token: 'mock-jwt-token', 
            user: {
              id: '2',
              email: body.email,
              name: body.name,
              role: body.role || 'volunteer'
            }
          };
        }
        break;
        
      case '/users/me':
        return mockUsers[0];
        
      case '/opportunities':
        return {
          opportunities: mockOpportunities,
          total: mockOpportunities.length
        };
        
      case '/opportunities/ngo':
        return mockOpportunities;
        
      case '/bookings/user':
        return [{
          _id: '1',
          opportunity_id: mockOpportunities[0],
          status: 'confirmed',
          hours_completed: 2,
          rating: 5
        }];
        
      case '/bookings/pending':
        return [];
        
      case '/ngos':
        return mockNGOs;
        
      case '/stats/platform':
        return {
          total_volunteers: 1250,
          total_ngos: 45, 
          total_hours: 12500,
          completed_tasks_today: 28
        };
        
      case '/reviews/featured':
        return [{
          _id: '1',
          user_id: {
            name: 'Sarah Johnson',
            profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
          },
          review_text: 'Sahay made it so easy to fit volunteering into my busy schedule!',
          rating: 5,
          total_hours: 45
        }];
        
      case '/admin/volunteers':
        return mockUsers;
        
      default:
        // For POST requests (bookings, celebrations, etc.)
        if (options.method === 'POST') {
          return { 
            success: true, 
            message: 'Mock operation successful',
            id: 'mock-id-' + Date.now()
          };
        }
        throw new Error(`Mock API endpoint not found: ${endpoint}`);
    }
  },

  async login(email: string, password: string) {
    const data: any = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  },

  async register(userData: any) {
    const data: any = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  },

  async getOpportunities() {
    return this.request('/opportunities');
  },

  async createBooking(opportunityId: string) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify({ opportunity_id: opportunityId }),
    });
  }
};