import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { api, authHelper } from '@/lib/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, role: 'volunteer' | 'ngo') => void;
  onNavigate?: (path: string) => void; // Optional callback for navigation
}
interface SignupData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string; // Optional field
}

export function LoginModal({ isOpen, onClose, onLogin, onNavigate }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  const [role, setRole] = useState<'volunteer' | 'ngo'>('volunteer');
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(''); 
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  if (!isOpen) return null;

  // Safe navigation function
  const navigateTo = (path: string) => {
    if (onNavigate) {
      // Use the callback if provided
      onNavigate(path);
    } else {
      // Fallback: use window.location for direct navigation
      window.location.href = path;
    }
  };

// const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await api.auth.login({ email, password });
      
//       console.log('🔍 Login API Response:', response); // This should now show token at root
      
//       // ✅ Now token is at root level (thanks to your API fix)
//       if (response.token) {
//         // Save the token
//         authHelper.saveToken(response.token);
        
//         // Store user data if returned
//         if (response.user) {
//           localStorage.setItem('user', JSON.stringify(response.user));
//           console.log('✅ User data saved:', response.user);
//         }
        
//         // Call the onLogin callback
//         onLogin(email, role);
        
//         // Get user role to determine dashboard
//         try {
//           const userData = await api.auth.getMe();
//           console.log('🔍 User Data from getMe:', userData);
          
//           // Handle nested response structure for getMe
//           const user = userData.data?.user || userData.user || userData;
//           console.log('👤 Final user object:', user);
          
//           // Close modal first
//           onClose();
          
//           // Redirect based on role using safe navigation
//           if (user.role === 'admin') {
//             navigateTo('/admin/dashboard');
//           } else if (user.role === 'ngo_admin') {
//             navigateTo('/ngo/dashboard');
//           } else {
//             navigateTo('/volunteer/dashboard');
//           }
//         } catch (userError) {
//           console.error('Failed to get user data:', userError);
//           // Fallback redirect
//           onClose();
//           navigateTo('/dashboard');
//         }
//       } else {
//         console.error('❌ No token in response:', response);
//         setError(response.message || 'No token received from server');
//       }
//     } catch (error: any) {
//       console.error('Login failed:', error);
//       setError(error.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await api.auth.login({ email, password });
    
    if (response.token) {
      authHelper.saveToken(response.token);
      
      // Store user data
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('👤 User logged in with role:', response.user.role);
      }
      
      onClose();
      
      // Redirect based on actual user role from response
      setTimeout(() => {
        const userRole = response.user?.role;
        console.log('🎯 Redirecting based on role:', userRole);
        
        if (userRole === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (userRole === 'ngo_admin') {
          window.location.href = '/volunteer/dashboard'; // NGOs go to volunteer dashboard for now
        } else {
          window.location.href = '/volunteer/dashboard';
        }
      }, 100);
      
    } else {
      setError('No token received from server');
    }
  } catch (error: any) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
  const handleGoogleLogin = () => {
    setError('Google login coming soon!');
  };

 // In your signup handler function
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const userData = {
      name: name.trim(),
      email: email.trim(),
      password: password,
      role: role,
    };

    console.log('📤 Sending to backend:', userData);

    const response = await api.auth.register(userData);
    console.log('✅ Registration response:', response);

    if (response.token || (response.data && response.data.token)) {
      const token = response.token || response.data.token;
      authHelper.saveToken(token);
      
      // Store user data
      let userRole = role; // Default to the role we sent
      
      if (response.user || response.data?.user) {
        const user = response.user || response.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        userRole = user.role; // Use the role from backend response
        console.log('👤 User registered with role from backend:', userRole);
      }
      
      console.log('🎯 Final role for redirect:', userRole);
      
      // Redirect based on actual role
      setTimeout(() => {
        if (userRole === 'ngo') {
          console.log('➡️ Redirecting to NGO dashboard');
          window.location.href = '/volunteer/dashboard'; // Change this if you want separate NGO dashboard
        } else {
          console.log('➡️ Redirecting to volunteer dashboard');
          window.location.href = '/volunteer/dashboard';
        }
      }, 100);
      
    } else {
      throw new Error('No token received after registration');
    }
    
  } catch (error: any) {
    console.error('❌ Registration failed:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Sahay</h2>
          <p className="text-gray-600">Join our community of volunteers</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="cursor-pointer text-black">Login</TabsTrigger>
            <TabsTrigger value="signup" className="cursor-pointer text-black">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="role" className="text-black">I am a</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'volunteer' | 'ngo')}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="ngo_admin">NGO/Organization</option>
                </select>
              </div>

              <div>
                <Label htmlFor="login-email" className="text-black">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  className='border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black'
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="login-password" className='text-black'>Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className='border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-black cursor-pointer" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer"
              onClick={handleGoogleLogin}
            >
              <Mail className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-role" className='text-black'>I am a</Label>
                <select
                  id="signup-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'volunteer' | 'ngo')}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="ngo_admin">NGO/Organization</option>
                </select>
              </div>

              <div>
                <Label htmlFor="signup-name" className='text-black'>Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  className='text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-email" className='text-black'>Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  className='text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-password" className='text-black'>Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  className='text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full cursor-pointer bg-black" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer"
              onClick={handleGoogleLogin}
            >
              <Mail className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}