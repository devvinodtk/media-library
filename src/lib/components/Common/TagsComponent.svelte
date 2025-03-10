<script lang="ts">
  import { writable } from "svelte/store";

  let inputValue = $state<String>("");

  const tags = writable<string[]>([]);

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      event.preventDefault();
      tags.update((t) => [...t, inputValue.trim()]);
      inputValue = "";
    }
  }

  function removeTag(index: number) {
    tags.update((t) => t.filter((_, i) => i !== index));
  }
</script>

<div class="sm:col-span-4">
  <label for="tags" class="block text-sm/6 font-medium text-gray-900">
    Tags
  </label>
  <div class="mt-2">
    <input
      id="tags"
      name="tags"
      type="text"
      class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
      bind:value={inputValue}
      onkeydown={handleKeyDown}
      placeholder="Add a tag and press Enter"
    />
  </div>
  <div class="mt-2 flex flex-wrap gap-2">
    {#each $tags as tag, index}
      <div
        class="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-900"
      >
        {tag}
        <button
          onclick={() => removeTag(index)}
          class="ml-1 text-gray-500 hover:text-gray-700"
        >
          X
        </button>
      </div>
    {/each}
  </div>
</div>
