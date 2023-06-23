import { useQuery } from '@tanstack/vue-query';

export default function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => $fetch('/api/auth/me'),
  });
}
