import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { Person } from '~/components/EditPerson.vue';

type PersonPayload = Person & { id?: number };

export default function useAddOrEditUser(mode: 'add' | 'edit') {
  const isAdd = mode === 'add';
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (values: PersonPayload) =>
      $fetch(isAdd ? '/api/auth/signup' : '/api/people/edit-person', {
        method: isAdd ? 'POST' : 'PUT',
        body: values,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['people'] }),
  });

  function mutatePerson(person: PersonPayload, callback: () => void): void {
    mutate(person, {
      onSuccess: callback,
    });
  }

  return { mutatePerson };
}
