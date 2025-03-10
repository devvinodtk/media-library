<script lang="ts">
  import type { Snippet } from "svelte";

  interface BasicProps {
    children: Snippet;
    isSecondary?: boolean;
    isDanger?: boolean;
    isMenu?: boolean;
  }
  interface ButtonProps extends BasicProps {
    onclick?: (e: MouseEvent) => void;
    href?: never;
    type?: "submit" | "button";
  }

  interface LinkProps extends BasicProps {
    href: string;
    onclick?: never;
  }

  type ComponentProps = ButtonProps | LinkProps;

  let {
    children,
    href,
    onclick,
    isSecondary,
    isDanger,
    isMenu,
    ...props
  }: ComponentProps = $props();
</script>

{#if href}
  <a
    class="btn"
    {href}
    class:btn-secondary={isSecondary}
    class:btn-danger={isDanger}
    class:btn-menu={isMenu}
  >
    {@render children()}
  </a>
{:else}
  <button
    {...props}
    {onclick}
    class:btn-secondary={isSecondary}
    class:btn-danger={isDanger}
    class:btn-menu={isMenu}
    class="btn block w-full rounded-m px-3.5 py-3.5 text-center text-sm font-semiboldshadow-xs focus-visible:outline-2 focus-visible:outline-offset-2"
  >
    {@render children()}
  </button>
{/if}

<style>
  a {
    display: block;
    text-decoration: none;
  }

  a:hover {
    text-decoration: none;
  }

  .btn {
    padding: 12px 24px;
    text-align: center;
    background-color: #504b38;
    border-radius: 12px;
    color: #eff3ea;
    border: 1px solid #eff3ea;
    font-weight: normal;
    font-size: 22px;
  }

  .btn-secondary {
    background-color: #eff3ea;
    color: #504b38;
    border: 1px solid #504b38;
  }

  .btn-danger {
    background-color: rgb(136, 4, 4);
  }

  .btn-menu {
    min-width: 150px;
    padding: 8px 20px;
  }
</style>
