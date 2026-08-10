// app/debug/page.tsx
"use client";
import { useAuth } from '@/app/contexts/AuthContext';

export default function DebugPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify({ isLoading, isAuthenticated, user }, null, 2)}
        </pre>
      </div>
      <div className="mt-4">
        <p>Token: {localStorage.getItem('token') || 'No token found'}</p>
      </div>
    </div>
  );
}