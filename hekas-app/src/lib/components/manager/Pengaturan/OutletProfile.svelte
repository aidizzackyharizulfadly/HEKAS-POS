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
	<label class="block">
		<span class="block text-sm font-semibold">Nama Toko *</span>
		<input type="text" bind:value={name} required class="w-full mt-1 px-3 py-2 border rounded-lg" />
	</label>
	<label class="block">
		<span class="block text-sm font-semibold">Alamat</span>
		<textarea bind:value={address} rows="2" class="w-full mt-1 px-3 py-2 border rounded-lg text-sm"></textarea>
	</label>
	<div class="grid grid-cols-2 gap-3">
		<label class="block">
			<span class="block text-sm font-semibold">Telepon</span>
			<input type="tel" bind:value={phone} class="w-full mt-1 px-3 py-2 border rounded-lg" />
		</label>
		<label class="block">
			<span class="block text-sm font-semibold">Email</span>
			<input type="email" bind:value={email} class="w-full mt-1 px-3 py-2 border rounded-lg" />
		</label>
	</div>
	<label class="block">
		<span class="block text-sm font-semibold">NPWP / Tax ID</span>
		<input type="text" bind:value={taxId} class="w-full mt-1 px-3 py-2 border rounded-lg" />
	</label>
	<button type="submit" class="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold">Simpan</button>
</form>
