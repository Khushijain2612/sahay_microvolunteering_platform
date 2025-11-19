// app/test/page.tsx
'use client';
import { useEffect } from 'react';
import { apiClient } from '../../lib/api';

export default function TestPage() {
  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const opportunities = await apiClient.getOpportunities();
      console.log('Backend connection successful!', opportunities);
    } catch (error) {
      console.error('Backend connection failed:', error);
    }
  };

  return (
    <div className="p-8">
      <h1>Testing Backend Connection</h1>
      <p>Check browser console for connection status</p>
    </div>
  );
}