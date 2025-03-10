<script lang="ts">
  import { Button } from "$components";
  import type { ActionData } from "../../../routes/register/$types";

  interface AuthFormProps {
    isRegistration: boolean;
    form: ActionData;
  }

  let { isRegistration, form }: AuthFormProps = $props();
</script>

<div class="isolate px-6 py-10 sm:py-15 lg:px-8">
  <div class="mx-auto max-w-2xl text-center">
    <h2
      class="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl"
    >
      {isRegistration ? "Registration" : "Login"}
    </h2>
    {#if form && form.errors?.length}
      {#each form.errors as error}
        <p class="mt-2 text-lg/8 text-red-800">{error}</p>
      {/each}
    {/if}
    <p class="mt-2 text-lg/8 text-gray-600"></p>
  </div>
  <form method="POST" class="mx-auto mt-12 max-w-xl sm:mt-15">
    <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      {#if isRegistration}
        <div class="sm:col-span-2">
          <label for="name" class="block text-sm/6 font-semibold text-gray-900"
            >Name</label
          >
          <div class="mt-2.5">
            <input
              required={true}
              type="text"
              name="name"
              id="name"
              value={form?.name || ""}
              class="block w-full rounded-md bg-white px-3.5 py-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>
      {/if}
      <div class="sm:col-span-2">
        <label for="email" class="block text-sm/6 font-semibold text-gray-900"
          >Email</label
        >
        <div class="mt-2.5">
          <input
            required={true}
            type="email"
            name="email"
            value={form?.email || ""}
            id="email"
            autocomplete="email"
            class="block w-full rounded-md bg-white px-3.5 py-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-none"
          />
        </div>
      </div>
      <div class="sm:col-span-2">
        <label for="company" class="block text-sm/6 font-semibold text-gray-900"
          >Password</label
        >
        <div class="mt-2.5">
          <input
            required={true}
            type="password"
            name="password"
            value={form?.password || ""}
            id="password"
            class="block w-full rounded-md bg-white px-3.5 py-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-none"
          />
        </div>
      </div>
      {#if isRegistration}
        <div class="sm:col-span-2">
          <label
            for="passwordConfirmation"
            class="block text-sm/6 font-semibold text-gray-900"
            >Confirm Password</label
          >
          <div class="mt-2.5">
            <input
              required={true}
              type="password"
              value={form?.passwordConfirmation || ""}
              name="passwordConfirmation"
              id="passwordConfirmation"
              class="block w-full rounded-md bg-white px-3.5 py-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-none"
            />
          </div>
        </div>
      {/if}
      <div class="mt-10 sm:col-span-2">
        <Button type="submit">{isRegistration ? "Register" : "Login"}</Button>
        {#if isRegistration}
          <p class="mt-2 text-center text-lg/8 text-gray-600">
            Already have an account? <a href="/login">Login</a>.
          </p>
        {:else}
          <p class="mt-2 text-center text-lg/8 text-gray-600">
            Don't have an account? <a href="/register">Register</a>
          </p>
        {/if}
      </div>
    </div>
  </form>
</div>
