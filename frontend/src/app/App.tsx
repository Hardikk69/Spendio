import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '../hooks/useAuth';

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  );
}
