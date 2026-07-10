import type { Ref } from 'vue';

/**
 * Calls `onLoadMore` whenever the returned `sentinel` element scrolls into view.
 * Decoupled from data fetching so it can be paired with any pagination source
 * (e.g. vue-query's `useInfiniteQuery`).
 *
 * @example
 * const { sentinel } = useInfiniteScroll(fetchNextPage, canLoadMore);
 * // <div ref="sentinel" /> at the bottom of the list
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  canLoadMore: Ref<boolean>,
  options: { rootMargin?: string } = {}
) {
  const sentinel = ref<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;

  watch(sentinel, (el, _prev, onCleanup) => {
    observer?.disconnect();
    if (!el) return;

    observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && canLoadMore.value) {
          onLoadMore();
        }
      },
      { rootMargin: options.rootMargin ?? '200px' }
    );
    observer.observe(el);

    onCleanup(() => observer?.disconnect());
  });

  onBeforeUnmount(() => observer?.disconnect());

  return { sentinel };
}
