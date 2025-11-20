// app/opportunities/page.tsx
'use client';
import { OpportunitiesPage } from '../../src/components/OpportunitiesPage';
import { useRouter } from 'next/navigation';

export default function OpportunitiesRoute() {
  const router = useRouter();

  const handleBookSlot = (opportunityId: string) => {
    console.log('Booking slot for opportunity:', opportunityId);
    // You can add booking logic here or redirect to booking page
    // For example:
    // router.push(`/booking/${opportunityId}`);
    // Or show a confirmation modal
  };

  return (
    <OpportunitiesPage onBookSlot={handleBookSlot} />
  );
}