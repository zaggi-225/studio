'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';

// This is the hardcoded admin email.
// In a real-world scenario, you might want to manage this in a more flexible way,
// but for this implementation, it's defined here.
const ADMIN_EMAIL = 'me.jagadeesh.225@gmail.com';

export function useRole() {
  const { user, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // The loading state of useRole is directly tied to the user loading state.
    if (!isUserLoading) {
      // Once user loading is complete, check if the user object exists and if the email matches.
      if (user) {
        setIsAdmin(user.email === ADMIN_EMAIL);
      } else {
        // If there's no user, they are not an admin.
        setIsAdmin(false);
      }
    }
  }, [user, isUserLoading]);

  // The hook's loading state is simply the user loading state.
  return { user, isAdmin, isLoading: isUserLoading };
}
