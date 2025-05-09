import { userActions } from '@/app/actions';
import { User } from '@sentry/nextjs';
import { useState, useEffect } from 'react';
export default function useUser() {
  const [user, setUser] = useState<Partial<User> | undefined>(undefined);
  useEffect(() => {
    async function fetchUser() {
      const res = await userActions.getSelfUser();
      setUser(res.result);
    }
    fetchUser();
  }, []);
  return user;
}
