import { useEffect, type ReactNode } from 'react';
import { seedIfNeeded } from '@/utils/seedData';
import { syncAllDynamicDataFromApi } from '@/services/dynamicDataApi';

export function AppInitializer({ children }: { children: ReactNode }) {
  useEffect(() => {
    seedIfNeeded();
  }, []);

  useEffect(() => {
    syncAllDynamicDataFromApi();
  }, []);

  return <>{children}</>;
}
