import { useQuery } from '@tanstack/vue-query';

export default function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => $fetch('/api/auth/me'),
    staleTime: 5 * 60 * 1000,
  });
}
