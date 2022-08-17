<script lang="ts">
  // TODO implement custom transition so height collapses as well
  import { beforeUpdate, tick } from "svelte";
  import { fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { Post } from "~constants/posts";

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

  // TODO add fuzzy search
  // https://fzf.netlify.app/docs/latest
  // https://github.com/krisk/Fuse
  // TODO add sort
  $: {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("search") !== query) {
        searchParams.set("search", query);
        window.history.pushState(
          null,
          "",
          `${window.location.pathname}?${searchParams.toString()}`
        );
      }
    }
    const regexQuery = new RegExp(query, "i");
    filteredItems = items.filter(
      (item) =>
        item.title.match(regexQuery) ||
        item.tags.some((tag) => tag.match(regexQuery))
    );
    duration = Math.min(
      Math.max((filteredItems.length / items.length) * 500, 300),
      500
    );
  }

  beforeUpdate(async () => {
    await tick();
    if (typeof window !== "undefined" && filteredItems.length) {
      import("~utils/page-transitions").then((module) =>
        module.setupPageTransitions()
      );
    }
  });
</script>

<form
  on:submit|preventDefault
  class="container relative flex w-full flex-col items-center justify-center space-y-2 py-2"
>
  <div
    class="sticky top-0 z-40 flex w-full max-w-md flex-col space-y-1 bg-black/20 p-1"
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
      class="container grid h-full max-w-xs gap-2 sm:max-w-full sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
    >
      {#each filteredItems as item (item)}
        <a
          class="group relative h-60 w-full max-w-xs overflow-hidden rounded-lg border-2 border-neutral-800 transition duration-300 hover:border-white focus:border-white focus:outline-none focus-visible:ring focus-visible:ring-white"
          href={item.href}
          in:fade={{
            duration,
          }}
          animate:flip={{
            delay: 100,
            duration,
          }}
        >
          {#if item.image}
            <img
              src={item.image}
              alt={item.title}
              class="absolute inset-0 z-0 h-full w-full bg-neutral-900/50 object-cover"
              loading="lazy"
            />
          {:else}
            <div
              class="flex h-full w-full items-center justify-center text-center text-xl font-bold"
            >
              <p>{item.title}</p>
            </div>
          {/if}
          <!-- TODO revise this -->
          <div
            class="absolute inset-0 bg-black/20 opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100 group-focus:opacity-100"
          />
          <div
            class="absolute inset-0 z-10 flex h-full w-full flex-col items-center space-y-2 bg-black/50 p-4"
            title={item.description}
          >
            <header class="text-center text-lg font-bold">
              {item.title}
            </header>
            <div
              class="flex h-full translate-y-full flex-col {item.description
                ? 'justify-between'
                : 'justify-end'} opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100"
            >
              {#if item.description}
                <p class="line-clamp-4">
                  {item.description}
                </p>
              {/if}
              <div class="flex w-full items-center justify-center">
                <p
                  class="rounded-md border-2 border-white/50 px-3 py-1 text-white/75 transition-colors duration-500 hover:border-white hover:text-white group-focus:border-white group-focus:text-white"
                >
                  {cta}
                </p>
              </div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <div in:fade={{ duration: 300 }}>
      <p>No results were found, maybe try again later...</p>
      <button type="reset" on:click={() => (query = "")}>Clear search</button>
    </div>
  {/if}
</form>
