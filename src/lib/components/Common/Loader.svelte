<script lang="ts">
  type LoaderProps = {
    text?: string;
  };
  let { text }: LoaderProps = $props();
</script>

<div class="fixed inset-0 flex items-center justify-center bg-opacity-100 z-50">
  <div class="flex flex-col items-center">
    <svg
      class="animate-spin h-12 w-12 text-orange-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="4"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <span class="mt-4 text-amber-600 font-medium text-md"
      >{`${text ? text : "Loading..."}`}</span
    >
  </div>
</div>
