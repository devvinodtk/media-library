<script lang="ts">
  import { A, Button, Card, Input, Label } from "flowbite-svelte";
  import mediaLibraryLogo from "$assets/app-logo.svg";
  import type { ActionData } from "../../../routes/login/$types";

  type AuthFormProps = {
    isRegistration: boolean;
    form: ActionData;
  };

  let { isRegistration, form }: AuthFormProps = $props();
  let haveAccount: boolean = true;
  let mainClass = "w-full";
  let mainDivClass =
    "flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen pt:mt-0 dark:bg-gray-900";
  let siteLinkClass =
    "flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white";
  let siteImgClass = "mr-4 h-11";
  let cardH1Class = "text-2xl font-bold text-gray-900 dark:text-white";
  let haveAccountDivClass =
    "text-sm font-medium text-gray-500 dark:text-gray-400";
  const labelClass = "space-y-2 dark:text-white";
</script>

<main class={mainClass}>
  <div class={mainDivClass}>
    <a href="/login" class={siteLinkClass}>
      <img src={mediaLibraryLogo} class={siteImgClass} alt="" />
      <span>Media Library App</span>
    </a>
    <Card class="w-full" size="md" border={false}>
      <h1 class={cardH1Class}>
        {`${isRegistration ? "Register" : "Login"}`} to the App
      </h1>
      {#if form && form.errors?.length}
        {#each form.errors as error}
          <p class="mt-2 text-sm text-red-500">{error}</p>
        {/each}
      {/if}
      <form class="mt-8 space-y-6" method="POST">
        {#if isRegistration}
          <div>
            <Label class={labelClass}>
              <span>Name</span>
              <Input
                type="text"
                name="name"
                id="name"
                required
                value={form?.name || ""}
                class="border outline-none dark:border-gray-600 dark:bg-gray-700"
              />
            </Label>
          </div>
        {/if}
        <div>
          <Label class={labelClass}>
            <span>Your email</span>
            <Input
              type="email"
              name="email"
              id="email"
              value={form?.email || ""}
              required
              class="border outline-none dark:border-gray-600 dark:bg-gray-700"
            />
          </Label>
        </div>
        <div>
          <Label class={labelClass}>
            <span>Your password</span>
            <Input
              type="password"
              name="password"
              id="password"
              value={form?.password || ""}
              required
              class="border outline-none dark:border-gray-600 dark:bg-gray-700"
            />
          </Label>
        </div>
        {#if isRegistration}
          <div>
            <Label class={labelClass}>
              <span>Confirm password</span>
              <Input
                type="password"
                name="passwordConfirmation"
                id="passwordConfirmation"
                value={form?.passwordConfirmation || ""}
                required
                class="border outline-none dark:border-gray-600 dark:bg-gray-700"
              />
            </Label>
          </div>
        {/if}
        <Button type="submit" size="lg"
          >{isRegistration ? "Create account" : "Login to your account"}</Button
        >
        {#if isRegistration}
          <div class={haveAccountDivClass}>
            Already have an account? <A href="/login">Login here</A>
          </div>
        {:else}
          <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Not registered? <A href="/register">Register</A>
          </div>
        {/if}
      </form>
    </Card>
  </div>
</main>
