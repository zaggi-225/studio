'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { useUser, useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();

  // Ensure admin role exists
  useEffect(() => {
    if (firestore && user) { // Only run if firestore and user are available
      const adminRoleRef = doc(firestore, 'roles', 'admin');
      
      getDoc(adminRoleRef)
        .then(docSnap => {
          if (!docSnap.exists()) {
            const adminRoleData = {
              id: 'admin',
              name: 'Admin',
              permissions: ['read', 'write', 'delete'],
            };
            // Use the non-blocking function which has built-in error handling
            setDocumentNonBlocking(adminRoleRef, adminRoleData, { merge: true });
          }
        })
        .catch(error => {
            // If getDoc fails due to permissions, emit a contextual error
            const permissionError = new FirestorePermissionError({
                path: adminRoleRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }
  }, [firestore, user]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar />
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
            {children}
        </main>
      </div>
    </div>
  );
}
