import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for prefetching routes for faster navigation
 * @param routes - Array of routes to prefetch
 */
export function usePrefetch(routes: string[]) {
  const router = useRouter();

  useEffect(() => {
    // Prefetch routes in background for faster navigation
    routes.forEach((route) => {
      try {
        router.prefetch(route);
      } catch (error) {
        // Silently fail if prefetch fails
        console.debug('Failed to prefetch route:', route);
      }
    });
  }, [router, routes]);
}

