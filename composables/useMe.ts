import { useQuery } from '@tanstack/vue-query';

export default function useMe() {
  return useQuery({
    queryKey: ['me'],
    // /api/auth/me responds 204 (undefined) when logged out; vue-query
    // requires non-undefined data, so normalize to null.
    queryFn: async () => (await $fetch('/api/auth/me')) ?? null,
    staleTime: Infinity,
    cacheTime: Infinity,
  });
}
