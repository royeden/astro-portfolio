<script lang="ts">
  // TODO implement custom transition so height collapses as well
  import { fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { Post } from "~constants/posts";
  import {
    addPageTransitionLink,
    removePageTransitionLink,
  } from "~utils/page-transitions";
  import { REDUCED_MOTION } from "~constants/mediaQueries";
  import { debounce } from "~utils/helpers";

  interface Item extends Post {
    href: string;
  }

  interface $$Props {
    cta: string;
    items: Item[];
    placeholder?: string;
    query: string;
  }

  export let cta: string;
  export let items: Item[];
  export let placeholder: string = undefined;
  export let query = "";

  let filteredItems = items;

  let duration: number;

  function filter(search: string) {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("search") !== search) {
        searchParams.set("search", search);
        window.history.pushState(
          null,
          "",
          `${window.location.pathname}?${searchParams.toString()}`
        );
      }
    }

    // TODO add fuzzy search
    // https://fzf.netlify.app/docs/latest
    // https://github.com/krisk/Fuse
    // TODO add sort
    const regexSearch = new RegExp(search, "i");
    filteredItems = items.filter(
      (item) =>
        item.title.match(regexSearch) ||
        item.tags.some((tag) => tag.match(regexSearch))
    );
    duration = Math.min(
      Math.max((filteredItems.length / items.length) * 500, 400),
      500
    );
  }

  const debouncedFilter = debounce(filter, 250);

  $: debouncedFilter(query);
</script>

<form
  on:submit|preventDefault
  class="container relative flex w-full flex-col items-center justify-center space-y-2 py-2"
>
  <div
    class="sticky top-0 z-40 flex w-full max-w-md flex-col space-y-1 rounded-lg bg-black/50 p-2"
  >
    <!-- TODO add presets -->
    <!-- TODO add sort -->
    <label class="w-full cursor-pointer" for="search"> Search: </label>
    <div class="flex items-center space-x-2">
      <input
        class="flex w-full flex-col rounded-md border-2 border-pink-500/50 bg-neutral-900/80 p-1.5 transition duration-300 hover:border-pink-500 focus:outline-none focus-visible:ring focus-visible:ring-white/80 focus-visible:hover:ring-white"
        id="search"
        name="search"
        {placeholder}
        type="search"
        bind:value={query}
      />
      <noscript>
        <button>Search</button>
      </noscript>
    </div>
  </div>

  {#if filteredItems.length > 0}
    <div
      class="container flex h-full w-full flex-wrap items-center justify-center gap-2"
    >
      {#each filteredItems as item (item)}
        <a
          class="group flex w-full max-w-md flex-col justify-between space-y-2 self-stretch overflow-hidden rounded-md border-2 border-neutral-800 bg-black/20 pb-2 transition duration-300 hover:border-white hover:bg-white/5 focus:border-white focus:outline-none focus-visible:bg-white/5 focus-visible:ring focus-visible:ring-white md:max-w-xs"
          href={item.href}
          in:fade={{
            duration: REDUCED_MOTION ? 0 : duration,
          }}
          animate:flip={{
            delay: REDUCED_MOTION ? 0 : duration / 8,
            duration: REDUCED_MOTION ? 0 : duration,
          }}
          on:introend={(event) => addPageTransitionLink(event.currentTarget)}
          on:outrostart={(event) =>
            removePageTransitionLink(event.currentTarget)}
        >
          {#if item.image}
            <img
              src={item.image}
              alt={item.title}
              class="aspect-video w-full bg-neutral-900/50 object-cover"
            />
          {:else}
            <div
              class="flex aspect-video h-full w-full items-center justify-center text-center text-xl font-bold"
            >
              <p>{item.title}</p>
            </div>
          {/if}
          <div
            class="flex w-full flex-col items-center space-y-2 p-4"
            title={item.description}
          >
            <header class="text-center text-lg font-bold">
              {item.title}
            </header>
            <div
              class="flex h-full flex-col {item.description
                ? 'justify-between'
                : 'justify-end'}"
            >
              {#if item.description}
                <p class="line-clamp-6">
                  {item.description}
                </p>
              {/if}
            </div>
          </div>
          <div class="flex w-full items-center justify-center">
            <p
              class="rounded-md border-2 border-white/75 px-3 py-1 text-white/75 opacity-0 transition duration-300 hover:border-white hover:bg-white/5 hover:text-white group-hover:opacity-100 group-focus:border-white group-focus:text-white group-focus-visible:opacity-100"
            >
              {cta}
            </p>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <div in:fade={{ duration: REDUCED_MOTION ? 0 : 300 }}>
      <p>No results were found, maybe try again later...</p>
      <button type="reset" on:click={() => (query = "")}>Clear search</button>
    </div>
  {/if}
</form>
