<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div class="min-h-screen bg-[#F3F4F6] flex flex-col">
  <Navbar session={data.session} />
  <main class="flex-1 p-6">
    {@render children()}
  </main>
</div>