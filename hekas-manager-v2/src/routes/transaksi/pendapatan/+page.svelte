<script lang="ts">
  import TransaksiTable from '$lib/components/TransaksiTable.svelte';
  import { pendapatanList } from '$lib/mock/transaksi';
</script>

<TransaksiTable
  title="Pendapatan Lain-lain"
  typeLabel="Tipe"
  typeOptions={['Pendapatan Bunga', 'Pendapatan Sewa', 'Pendapatan Lain', 'Semua']}
  rows={pendapatanList}
  columnDate="Tanggal"
/>