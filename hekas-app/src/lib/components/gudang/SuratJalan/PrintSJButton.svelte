<script lang="ts">
	/**
	 * PrintSJButton (HEKAS POS — gudang/SuratJalan)
	 * Tombol print SJ.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 */
	import type { SuratJalan } from '$lib/api/surat-jalan';
	interface Props { sj: SuratJalan; disabled?: boolean; }
	let { sj, disabled = false }: Props = $props();
	let printing = $state(false);
	async function handlePrint() {
		printing = true;
		try {
			const win = window.open('', '_blank', 'width=400,height=600');
			if (!win) return;
			win.document.write(`<html><head><title>${sj.sjNumber}</title><style>body{font-family:monospace;width:80mm;padding:8px;font-size:11px}table{width:100%;border-collapse:collapse}td,th{padding:2px;text-align:left;border-bottom:1px dashed #999}h1{text-align:center;font-size:14px}</style></head><body><h1>SURAT JALAN</h1><p>${sj.sjNumber}<br>${sj.fromOutlet} → ${sj.toOutlet}<br>${new Date(sj.createdAt).toLocaleString('id-ID')}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Unit</th></tr></thead><tbody>`);
			for (const it of sj.items) win.document.write(`<tr><td>${it.productName}</td><td>${it.qty}</td><td>${it.unit}</td></tr>`);
			win.document.write(`</tbody></table><p style="margin-top:24px">Penerima: ____________</p><p>Pengirim: ____________</p></body></html>`);
			win.document.close();
			win.print();
		} finally { printing = false; }
	}
</script>

<button type="button" {disabled} onclick={handlePrint} class="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold disabled:opacity-50">{printing ? '⏳' : '🖨️'} Print</button>
