<script lang="ts">
	/**
	 * OutletProfile (HEKAS POS — manager/Pengaturan)
	 * Profil outlet — name, address, kontak.
	 *
	 * Status: SCAFFOLD.
	 */
	import type { AppSettings } from '$lib/api/settings';
	interface Props { settings: AppSettings; onSave: (store: AppSettings['store']) => void; }
	let { settings, onSave }: Props = $props();
	let name = $state(settings.store.name);
	let address = $state(settings.store.address);
	let phone = $state(settings.store.phone);
	let email = $state(settings.store.email ?? '');
	let taxId = $state(settings.store.taxId ?? '');
</script>

<form onsubmit={(e) => { e.preventDefault(); onSave({ name, address, phone, email, taxId }); }} class="space-y-3">
	<h3 class="text-lg font-bold">Profil Outlet</h3>
	<span class="block text-sm font-semibold">Nama Toko *</span>
	<input aria-label="Nama Toko" type="text" bind:value={name} required class="w-full px-3 py-2 border rounded-lg" />
	<span class="block text-sm font-semibold">Alamat</span>
	<textarea aria-label="Alamat" bind:value={address} rows="2" class="w-full px-3 py-2 border rounded-lg text-sm"></textarea>
	<div class="grid grid-cols-2 gap-3">
		<div><label class="block text-sm font-semibold">Telepon</label><input aria-label="Telepon" type="tel" bind:value={phone} class="w-full px-3 py-2 border rounded-lg" /></div>
		<div><label class="block text-sm font-semibold">Email</label><input aria-label="Email" type="email" bind:value={email} class="w-full px-3 py-2 border rounded-lg" /></div>
	</div>
	<span class="block text-sm font-semibold">NPWP / Tax ID</span>
	<input aria-label="NPWP / Tax ID" type="text" bind:value={taxId} class="w-full px-3 py-2 border rounded-lg" />
	<button type="submit" class="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold">Simpan</button>
</form>
