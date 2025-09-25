'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile, Role } from '@/lib/types';

export function useRole() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();

  const userProfileRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isUserProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const roleRef = useMemoFirebase(
    () => (firestore && userProfile ? doc(firestore, 'roles', userProfile.roleId) : null),
    [firestore, userProfile]
  );
  const { data: role, isLoading: isRoleLoading } = useDoc<Role>(roleRef);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loading = isUserLoading || isUserProfileLoading || isRoleLoading;
    setIsLoading(loading);
    if (!loading) {
      setIsAdmin(role?.name === 'Admin');
    }
  }, [isUserLoading, isUserProfileLoading, isRoleLoading, role]);

  return { user, isAdmin, isLoading };
}
