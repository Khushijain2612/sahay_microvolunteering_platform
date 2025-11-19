import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { apiClient } from '../../lib/api';
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, role: 'volunteer' | 'ngo') => void;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  const [role, setRole] = useState<'volunteer' | 'ngo'>('volunteer');
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(''); 
  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await apiClient.login(email, password);
      onLogin(email, role);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    setError('Google login coming soon!');
    // TODO: Implement Google OAuth
    // onLogin('user@gmail.com', role);
    // onClose();
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await apiClient.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          role: role === 'ngo' ? 'ngo_admin' : 'volunteer' 
        }),
      });
      onLogin(email, role);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Signup failed');
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
          <h2 className="text-gray-900 mb-2">Welcome to Sahay</h2>
          <p className="text-gray-600">Join our community of volunteers</p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        <Tabs defaultValue="login" className="w-full ">
          <TabsList className="grid w-full grid-cols-2 mb-6 ">
            <TabsTrigger value="login" className="cursor-pointer text-black">Login</TabsTrigger>
            <TabsTrigger value="signup" className="cursor-pointer text-black">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="role" className=" text-black">I am a</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'volunteer' | 'ngo')}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="volunteer" >Volunteer</option>
                  <option value="ngo">NGO/Admin</option>
                </select>
              </div>

              <div>
                <Label htmlFor="email" className=" text-black">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className='border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black'
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className='text-black'>Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className='border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-black cursor-pointer ">
                Login
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 ">Or continue with</span>
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
                  <option value="ngo">NGO/Admin</option>
                </select>
              </div>

              <div>
                <Label htmlFor="signup-name" className='text-black'>Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  className='text-black'
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-email" className='text-black'>Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  className='text-black'
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
                  className='text-black'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full cursor-pointer bg-black" >
                Create Account
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
