<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { onMount } from 'svelte';
	import { initTheme } from '$lib/utils/theme';
	import { initSound } from '$lib/utils/sound';

	let { children } = $props();

	onMount(() => {
		initTheme();
		initSound();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
