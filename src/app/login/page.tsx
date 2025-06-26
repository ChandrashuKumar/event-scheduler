'use client';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl mb-4">Login to Scheduler</h1>
      <button onClick={login} className="bg-blue-500 text-white px-4 py-2 rounded">
        Login with Google
      </button>
    </div>
  );
}
