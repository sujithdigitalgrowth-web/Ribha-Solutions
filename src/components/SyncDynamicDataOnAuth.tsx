import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENABLED } from '@/config/api';
import { syncAllDynamicDataFromApi } from '@/services/dynamicDataApi';

/**
 * Ensure dynamic API-backed data is synced after login.
 * AppInitializer runs only once on initial app mount; logout/login without a full reload needs a re-sync.
 */
export function SyncDynamicDataOnAuth() {
  const { user } = useAuth();

  useEffect(() => {
    if (!API_ENABLED) return;
    if (!user?.id) return;
    syncAllDynamicDataFromApi();
  }, [user?.id]);

  return null;
}

