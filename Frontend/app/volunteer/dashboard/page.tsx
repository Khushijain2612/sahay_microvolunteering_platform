'use client';
import { VolunteerDashboard } from '@/src/components/VolunteerDashboard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  // Add any required props that VolunteerDashboard needs
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <VolunteerDashboard 
      onNavigate={handleNavigate} 
      // Add any other required props
    />
  );
}