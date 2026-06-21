<script lang="ts">
	/**
	 * Select — shadcn-svelte style dropdown.
	 *
	 * Self-contained (tidak butuh bits-ui). ARIA combobox + listbox pattern.
	 * Keyboard: Enter/Space/↓ open, ↑↓ navigate, Enter select, Esc close, Home/End jump.
	 *
	 * Usage:
	 *   <Select
	 *     bind:value={selected}
	 *     options={[{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }]}
	 *     placeholder="Pilih buah..."
	 *     onchange={(v) => console.log(v)}
	 *   />
	 */
	import { cn } from '$lib/utils/cn';

	export interface SelectOption {
		value: string;
		label: string;
		disabled?: boolean;
	}

	type Props = {
		value?: string;
		options: SelectOption[];
		placeholder?: string;
		disabled?: boolean;
		name?: string;
		id?: string;
		required?: boolean;
		class?: string;
		onchange?: (value: string) => void;
	};

	let {
		value = $bindable(''),
		options,
		placeholder = 'Pilih…',
		disabled = false,
		name,
		id,
		required = false,
		class: className = '',
		onchange
	}: Props = $props();

	let open = $state(false);
	let activeIndex = $state(-1);
	let triggerEl: HTMLButtonElement | undefined = $state();
	let listboxEl: HTMLUListElement | undefined = $state();

	const selected = $derived(options.find((o) => o.value === value));
	const listboxId = $derived(id ? `${id}-listbox` : undefined);

	function open_dropdown() {
		if (disabled) return;
		open = true;
		const cur = options.findIndex((o) => o.value === value);
		activeIndex = cur >= 0 ? cur : 0;
		// Focus first option (or current)
		queueMicrotask(() => {
			const li = listboxEl?.querySelectorAll<HTMLLIElement>('[role="option"]')[activeIndex];
			li?.focus();
		});
	}

	function close(returnFocus = true) {
		open = false;
		activeIndex = -1;
		if (returnFocus) triggerEl?.focus();
	}

	function selectOption(opt: SelectOption) {
		if (opt.disabled) return;
		value = opt.value;
		onchange?.(opt.value);
		close();
	}

	function onTriggerKeydown(e: KeyboardEvent) {
		if (disabled) return;
		if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
			e.preventDefault();
			open_dropdown();
		}
	}

	function onListKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = Math.min(options.length - 1, activeIndex + 1);
			focusOption();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = Math.max(0, activeIndex - 1);
			focusOption();
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const opt = options[activeIndex];
			if (opt) selectOption(opt);
		} else if (e.key === 'Home') {
			e.preventDefault();
			activeIndex = 0;
			focusOption();
		} else if (e.key === 'End') {
			e.preventDefault();
			activeIndex = options.length - 1;
			focusOption();
		} else if (e.key === 'Tab') {
			// Allow tab to close without preventing default
			close(false);
		}
	}

	function focusOption() {
		const li = listboxEl?.querySelectorAll<HTMLLIElement>('[role="option"]')[activeIndex];
		li?.focus();
	}

	function onWindowClick(e: MouseEvent) {
		if (!open) return;
		const target = e.target as Node;
		if (triggerEl?.contains(target)) return;
		if (listboxEl?.contains(target)) return;
		close(false);
	}

	$effect(() => {
		if (open) {
			window.addEventListener('mousedown', onWindowClick);
			return () => window.removeEventListener('mousedown', onWindowClick);
		}
	});
</script>

<div class={cn('relative w-full', className)}>
	{#if name}
		<input type="hidden" {name} {value} />
	{/if}
	<button
		bind:this={triggerEl}
		type="button"
		role="combobox"
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-controls={listboxId}
		{id}
		{disabled}
		onclick={open_dropdown}
		onkeydown={onTriggerKeydown}
		class={cn(
			'flex h-9 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors',
			'hover:border-slate-400',
			'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
			disabled && 'cursor-not-allowed opacity-50',
			!selected && 'text-slate-400'
		)}
	>
		<span class="truncate">{selected?.label ?? placeholder}</span>
		<svg
			class={cn('h-4 w-4 opacity-60 transition-transform', open && 'rotate-180')}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if open}
		<ul
			bind:this={listboxEl}
			id={listboxId}
			role="listbox"
			tabindex="-1"
			onkeydown={onListKeydown}
			class="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg focus:outline-none"
		>
			{#each options as opt, i (opt.value)}
				<li
					role="option"
					tabindex={activeIndex === i ? 0 : -1}
					aria-selected={opt.value === value}
					aria-disabled={opt.disabled}
					onclick={() => selectOption(opt)}
					onmouseenter={() => (activeIndex = i)}
					class={cn(
						'relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none',
						opt.disabled && 'cursor-not-allowed opacity-50',
						activeIndex === i && 'bg-blue-50 text-blue-900',
						opt.value === value && 'font-medium text-blue-700'
					)}
				>
					<span class="flex-1 truncate">{opt.label}</span>
					{#if opt.value === value}
						<svg
							class="ml-2 h-4 w-4 text-blue-600"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
