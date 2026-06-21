<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const avatarVariants = tv({
		base: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100',
		variants: {
			size: {
				default: 'h-10 w-10',
				sm: 'h-8 w-8',
				lg: 'h-12 w-12',
				xl: 'h-16 w-16'
			}
		},
		defaultVariants: { size: 'default' }
	});

	export type AvatarSize = VariantProps<typeof avatarVariants>['size'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	type Props = {
		size?: AvatarSize;
		class?: string;
		children?: Snippet;
	};
	let { size = 'default', class: className = '', children }: Props = $props();
</script>

<span
	data-slot="avatar"
	class={cn(avatarVariants({ size }), className)}
>
	{#if children}{@render children()}{/if}
</span>
