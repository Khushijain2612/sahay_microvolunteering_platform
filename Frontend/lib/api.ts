// // Mock API client for testing
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// async function apiCall(endpoint: string, options: any = {}) {
//   const url = `${API_URL}${endpoint}`;
//   const token = localStorage.getItem('token');
  
//   const headers = {
//     'Content-Type': 'application/json',
//     ...(token && { 'Authorization': `Bearer ${token}` }),
//     ...options.headers,
//   };

//   try {
//     const response = await fetch(url, {
//       ...options,
//       headers,
//     });

//     const data = await response.json();
    
//     if (!response.ok) {
//       throw new Error(data.message || 'Something went wrong');
//     }
    
//     return data;
//   } catch (error) {
//     console.error('API Error:', error);
//     throw error;
//   }
// }

// export const api = {
//   auth: {
//     login: (email: string, password: string) => 
//       apiCall('/auth/login', {
//         method: 'POST',
//         body: JSON.stringify({ email, password }),
//       }),

//     register: (userData: any) =>
//       apiCall('/auth/register', {
//         method: 'POST',
//         body: JSON.stringify(userData),
//       }),

//     getMe: () => apiCall('/auth/me'),
//   },

//   events: {
//     getOne: (id: string) => apiCall(`/events/${id}`),
//     create: (eventData: any) =>
//       apiCall('/events', {
//         method: 'POST',
//         body: JSON.stringify(eventData),
//       }),
//     update: (id: string, eventData: any) =>
//       apiCall(`/events/${id}`, {
//         method: 'PUT',
//         body: JSON.stringify(eventData),
//       }),
//     delete: (id: string) =>
//       apiCall(`/events/${id}`, { method: 'DELETE' }),
//     getMyBookings: () => apiCall('/events/my-bookings'),
//   },

//   opportunities: {
//     getAll: () => apiCall('/opportunities'),
//     getOne: (id: string) => apiCall(`/opportunities/${id}`),
//     create: (opportunityData: any) =>
//       apiCall('/opportunities/create', {
//         method: 'POST',
//         body: JSON.stringify(opportunityData),
//       }),
//   },

//   volunteer: {
//     getDashboard: () => apiCall('/volunteer/dashboard'),
//     getWorkHistory: () => apiCall('/volunteer//work/${workId}/proof'),
//     getBookedOpportunities: () => apiCall('/volunteer//events'),
//   },

//   admin: {
//   getDashboardStats: () => apiCall('/admin/stats'),
//   getVolunteers: (user:string) => apiCall('/admin/users'), // Maps to users endpoint
//   getEventBookings: () => apiCall('/admin/opportunities/review'), // Maps to opportunities review
//    getNGOs: (params?: any) => 
//       apiCall('/admin/users', { params: { ...params, role: 'ngo' } }),
//   updateEventBookingStatus: (id: string, statusData: any) =>
//     apiCall(`/admin/opportunities/${id}/review`, { // Maps to opportunity review
//       method: 'PUT',
//       body: JSON.stringify(statusData),
//     }),

//     reviewVolunteerWork: (id: string, reviewData: any) =>
//       apiCall(`/admin/opportunities/${id}/review`, {
//         method: 'PUT',
//         body: JSON.stringify(reviewData),
//       }),
//   },
// };

// export const authHelper = {
//   saveToken: (token: string) => localStorage.setItem('token', token),
//   getToken: () => localStorage.getItem('token'),
//   removeToken: () => localStorage.removeItem('token'),
//   isLoggedIn: () => !!localStorage.getItem('token'),
// };
// Mock API client for testing
const API_URL = 'https://sahay-microvolunteering-0jhc.onrender.com/api';

async function apiCall(endpoint: string, options: any = {}) {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  console.log('🔗 API Call to:', url);
  console.log('📦 Request Body:', options.body ? JSON.parse(options.body) : 'No body');
  console.log('⚙️ Request Method:', options.method || 'GET');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    console.log('🔄 Making fetch request...');
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('📡 Response Status:', response.status);
    console.log('📡 Response OK:', response.ok);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    // Get the response text first to see what we're dealing with
    const responseText = await response.text();
    console.log('📄 Raw Response Text:', responseText);
    
    if (!response.ok) {
      console.error('❌ Response not OK!');
      let errorData;
      try {
        errorData = responseText ? JSON.parse(responseText) : { message: `HTTP ${response.status}` };
      } catch (e) {
        errorData = { message: responseText || `HTTP ${response.status}` };
      }
      console.error('❌ Error Data:', errorData);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    // Try to parse the response as JSON
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
      console.log('✅ Parsed Response Data:', data);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('❌ Could not parse response as JSON:', responseText);
      throw new Error('Server returned invalid JSON response');
    }
    
    return data;
    
  } catch (error: any) {
    console.error('❌ API Call Failed:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      endpoint,
      url
    });
    
    throw error;
  }
}

export const api = {
  auth: {
    
    login: async (credentials: { email: string, password: string }) => {
  try {
    console.log('🔍 Making login API call with:', credentials);
    
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    console.log('🔍 RAW BACKEND RESPONSE:', response);
    console.log('🔍 Response type:', typeof response);
    console.log('🔍 Response keys:', response ? Object.keys(response) : 'No response');
    
    // Handle different response structures
    if (!response) {
      console.error('❌ No response received');
      throw new Error('No response from server');
    }
    
    // Case 1: Token is at root level
    if (response.token) {
      console.log('✅ Token found at root level');
      return {
        success: true,
        token: response.token,
        user: response.user,
        message: response.message || 'Login successful'
      };
    }
    
    // Case 2: Token is nested under data
    if (response.data && response.data.token) {
      console.log('✅ Token found under data property');
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        message: response.message || 'Login successful'
      };
    }
    
    // Case 3: Backend returned success but no token structure we recognize
    if (response.success) {
      console.warn('⚠️ Success but no recognizable token structure:', response);
      // Return as-is and let frontend handle it
      return response;
    }
    
    // Case 4: Error response
    console.error('❌ No token found in response structure');
    throw new Error(response.message || 'Login failed: No token received');
    
  } catch (error) {
    console.error('❌ Login API error:', error);
    throw error;
  }
},

   register: async (userData: any) => {
  try {
    console.log('🔍 Making registration API call with:', userData);
    
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    console.log('🔍 RAW REGISTRATION RESPONSE:', response);
    console.log('🔍 Response type:', typeof response);
    
    // If we get a non-object response, something is wrong
    if (typeof response !== 'object' || response === null) {
      console.error('❌ Invalid response type from registration:', response);
      throw new Error('Invalid server response during registration');
    }
    
    // Handle different response structures
    if (response.token) {
      console.log('✅ Token found at root level');
      return {
        success: true,
        token: response.token,
        user: response.user,
        message: response.message || 'Registration successful'
      };
    }
    
    if (response.data && response.data.token) {
      console.log('✅ Token found under data property');
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        message: response.message || 'Registration successful'
      };
    }
    
    // If backend returned an error
    if (!response.success) {
      console.error('❌ Backend returned error:', response.message);
      throw new Error(response.message || 'Registration failed');
    }
    
    // If success but no token structure we recognize
    console.warn('⚠️ Success but no recognizable token structure:', response);
    return response;
    
  } catch (error) {
    console.error('❌ Registration API error:', error);
    throw error;
  }
},
    

    getMe: () => apiCall('/auth/me'),
    
    // Add test endpoint
    test: () => apiCall('/auth/test'),
  },

  events: {
    getAll: () => apiCall('/events'),
    getOne: (id: string) => apiCall(`/events/${id}`),
    create: (eventData: any) =>
      apiCall('/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      }),
    update: (id: string, eventData: any) =>
      apiCall(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
      }),
    delete: (id: string) =>
      apiCall(`/events/${id}`, { method: 'DELETE' }),
    getMyBookings: () => apiCall('/events/my-bookings'),
  },

  opportunities: {
    getAll: () => apiCall('/opportunities'),
    getOne: (id: string) => apiCall(`/opportunities/${id}`),
    create: (opportunityData: any) =>
      apiCall('/opportunities', {
        method: 'POST',
        body: JSON.stringify(opportunityData),
      }),
  },

  volunteer: {
    getDashboard: () => apiCall('/volunteer/dashboard'),
    getWorkHistory: () => apiCall('/volunteer/work-history'),
    getBookedOpportunities: () => apiCall('/volunteer/bookings'),
    addWorkProof: (workId: string, proofData: any) =>
      apiCall(`/volunteer/work/${workId}/proof`, {
        method: 'POST',
        body: JSON.stringify(proofData),
      }),
  },

  admin: {
    getDashboardStats: () => apiCall('/admin/stats'),
    getVolunteers: () => apiCall('/admin/volunteers'),
    getNGOs: () => apiCall('/admin/ngos'),
    getEventBookings: () => apiCall('/admin/bookings'),
    updateBookingStatus: (id: string, statusData: any) =>
      apiCall(`/admin/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(statusData),
      }),
  },
};

export const authHelper = {
  saveToken: (token: string) => {
    if (token) {
      localStorage.setItem('token', token);
      console.log('✅ Token saved to localStorage:', token.substring(0, 20) + '...');
    } else {
      console.error('❌ No token provided to save');
    }
  },
  
  getToken: () => {
    const token = localStorage.getItem('token');
    console.log('🔐 Token retrieved from localStorage:', token ? 'YES' : 'NO');
    return token;
  },
  
  removeToken: () => {
    localStorage.removeItem('token');
    console.log('🗑️ Token removed from localStorage');
  },
  
  isLoggedIn: () => {
    const loggedIn = !!localStorage.getItem('token');
    console.log('🔐 Login status check:', loggedIn ? 'LOGGED IN' : 'NOT LOGGED IN');
    return loggedIn;
  },
  
  // Add token verification
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      // Test token by making a simple API call
      await api.auth.getMe();
      return true;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return false;
    }
  }
};