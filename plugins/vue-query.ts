import type {
  DehydratedState,
  VueQueryPluginOptions,
} from '@tanstack/vue-query';
import {
  VueQueryPlugin,
  QueryClient,
  hydrate,
  dehydrate,
  QueryCache,
} from '@tanstack/vue-query';
// Nuxt 3 app aliases
import { useState } from '#app';
import { NuxtError } from 'nuxt/app';

export default defineNuxtPlugin(nuxt => {
  const vueQueryState = useState<DehydratedState | null>('vue-query');

  // Modify your Vue Query global settings here
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError(error) {
        switch ((error as NuxtError).statusCode) {
          case 401:
            return navigateTo('/signin', { replace: true });
          case 403:
            return navigateTo('/reports', { replace: true });
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        cacheTime: Infinity,
        retry(failureCount, error) {
          const statusCode = (error as NuxtError).statusCode;
          if (statusCode >= 400 && statusCode < 500) return false;
          return failureCount <= 3;
        },
      },
    },
  });
  const options: VueQueryPluginOptions = { queryClient };

  nuxt.vueApp.use(VueQueryPlugin, options);

  if (process.server) {
    nuxt.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient);
    });
  }

  if (process.client) {
    nuxt.hooks.hook('app:created', () => {
      hydrate(queryClient, vueQueryState.value);
    });
  }
});
