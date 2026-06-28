<script lang="ts">
  import TransaksiTable from '$lib/components/TransaksiTable.svelte';
  import { penjualanList } from '$lib/mock/transaksi';
</script>

<TransaksiTable
  title="Penjualan"
  typeLabel="Tipe"
  typeOptions={['Invoice Penjualan', 'Retur Penjualan', 'Semua']}
  rows={penjualanList}
  columnDate="Tanggal"
/>