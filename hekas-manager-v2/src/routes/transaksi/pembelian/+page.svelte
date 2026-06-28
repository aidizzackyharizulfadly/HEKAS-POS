<script lang="ts">
  import TransaksiTable from '$lib/components/TransaksiTable.svelte';
  import { pembelianList } from '$lib/mock/transaksi';
</script>

<TransaksiTable
  title="Pembelian"
  typeLabel="Tipe"
  typeOptions={['Invoice Pembelian', 'Order Pembelian', 'Retur', 'Semua']}
  rows={pembelianList}
  columnDate="Tanggal"
/>