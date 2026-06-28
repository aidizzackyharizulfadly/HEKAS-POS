<script lang="ts">
  import TransaksiTable from '$lib/components/TransaksiTable.svelte';
  import { pengeluaranList } from '$lib/mock/transaksi';
</script>

<TransaksiTable
  title="Pengeluaran Lain-lain"
  typeLabel="Tipe"
  typeOptions={['Beban Operasional', 'Beban Gaji', 'Beban Utilitas', 'Semua']}
  rows={pengeluaranList}
  columnDate="Tanggal"
/>