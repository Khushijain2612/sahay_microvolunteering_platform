// app/login/page.tsx
'use client';
import { LoginModal } from '../../src/components/LoginModal';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (email: string, role: string) => {
    console.log('User logged in:', email, role);
    // Redirect after successful login
    router.push('/dashboard');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleClose = () => {
    router.push('/'); // Redirect to home when modal closes
  };

  return (
    <LoginModal 
      isOpen={true} 
      onClose={handleClose}
      onLogin={handleLogin}
      onNavigate={handleNavigate}
    />
  );
}