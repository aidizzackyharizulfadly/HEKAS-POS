<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const calendarVariants = tv({
		base: 'rounded-md border border-slate-200 bg-white p-3 shadow-sm',
		variants: {
			size: {
				default: 'w-72',
				sm: 'w-60',
				lg: 'w-80'
			}
		},
		defaultVariants: { size: 'default' }
	});

	export type CalendarSize = VariantProps<typeof calendarVariants>['size'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		value?: Date;
		min?: Date;
		max?: Date;
		size?: CalendarSize;
		class?: string;
		onselect?: (d: Date) => void;
	};
	let {
		value = $bindable(),
		min,
		max,
		size = 'default',
		class: className = '',
		onselect
	}: Props = $props();

	let viewYear = $state(value?.getFullYear() ?? new Date().getFullYear());
	let viewMonth = $state(value?.getMonth() ?? new Date().getMonth());

	const MONTHS_ID = [
		'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
		'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
	];

	const days = $derived.by(() => {
		const firstDay = new Date(viewYear, viewMonth, 1);
		const lastDay = new Date(viewYear, viewMonth + 1, 0);
		const startWeekday = firstDay.getDay(); // 0=Sun
		const totalDays = lastDay.getDate();

		const cells: Array<{ day: number | null; date?: Date }> = [];
		// Padding before
		for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
		// Days
		for (let d = 1; d <= totalDays; d++) {
			cells.push({ day: d, date: new Date(viewYear, viewMonth, d) });
		}
		// Padding after to fill last row (multiple of 7)
		while (cells.length % 7 !== 0) cells.push({ day: null });
		return cells;
	});

	function prevMonth() {
		if (viewMonth === 0) {
			viewMonth = 11;
			viewYear--;
		} else viewMonth--;
	}
	function nextMonth() {
		if (viewMonth === 11) {
			viewMonth = 0;
			viewYear++;
		} else viewMonth++;
	}
	function selectDate(d: Date) {
		if (min && d < min) return;
		if (max && d > max) return;
		value = d;
		onselect?.(d);
	}
	function isSelected(d?: Date) {
		if (!d || !value) return false;
		return d.toDateString() === value.toDateString();
	}
	function isToday(d?: Date) {
		if (!d) return false;
		return d.toDateString() === new Date().toDateString();
	}
</script>

<div data-slot="calendar" class={cn(calendarVariants({ size }), className)}>
	<!-- Header -->
	<div class="flex items-center justify-between mb-2">
		<button type="button" onclick={prevMonth} aria-label="Bulan sebelumnya" class="p-1 hover:bg-slate-100 rounded">
			‹
		</button>
		<div class="text-sm font-semibold">
			{MONTHS_ID[viewMonth]} {viewYear}
		</div>
		<button type="button" onclick={nextMonth} aria-label="Bulan berikutnya" class="p-1 hover:bg-slate-100 rounded">
			›
		</button>
	</div>

	<!-- Weekday headers -->
	<div class="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-1">
		{#each ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as wd}
			<div>{wd}</div>
		{/each}
	</div>

	<!-- Day grid -->
	<div class="grid grid-cols-7 gap-1 text-center text-sm">
		{#each days as cell, i (i)}
			{#if cell.day === null}
				<div></div>
			{:else}
				<button
					type="button"
					onclick={() => cell.date && selectDate(cell.date)}
					class={cn(
						'h-8 w-8 rounded-md transition-colors',
						isSelected(cell.date) && 'bg-blue-600 text-white font-semibold',
						!isSelected(cell.date) && isToday(cell.date) && 'bg-blue-100 text-blue-700 font-semibold',
						!isSelected(cell.date) && !isToday(cell.date) && 'hover:bg-slate-100 text-slate-700'
					)}
				>
					{cell.day}
				</button>
			{/if}
		{/each}
	</div>
</div>
