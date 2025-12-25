<script lang="ts">
	import { API_BASE_URL } from '$lib/config';
	import { getAuthHeaders } from '$lib/auth/context';


	export let supplyRequests: any[] = [];
	export let onToast: (msg: string, type?: 'success' | 'error') => void;

	let reviewingId: string | null = null;

	async function setStatus(id: string, status: 'APPROVED' | 'REJECTED') {
		if (reviewingId) return;
		reviewingId = id;

		const original = [...supplyRequests];
		// optimistic remove
		supplyRequests = supplyRequests.filter((r) => r.id !== id);

		try {
			const res = await fetch(`${API_BASE_URL}/api/teacher/supply-requests/${id}/status`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...getAuthHeaders()
				},
				body: JSON.stringify({ status })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error((err as any).message ?? 'Failed to update request');
			}

			onToast(status === 'APPROVED' ? 'Supply request approved ✅' : 'Supply request rejected ❌', 'success');
		} catch (e) {
			// rollback
			supplyRequests = original;
			console.error(e);
			onToast('Failed to update supply request', 'error');
		} finally {
			reviewingId = null;
		}
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold text-slate-800">Supply Requests</h2>
		<p class="text-sm text-slate-600 mt-1">Approve or reject student supply requests</p>
	</div>

	{#if supplyRequests.length > 0}
		<div class="space-y-4">
			{#each supplyRequests as req}
				<div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 overflow-hidden p-4 sm:p-5">
					<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div class="min-w-0">
							<p class="font-semibold text-slate-800 truncate">{req.supply?.name || 'Supply'}</p>
							<p class="text-sm text-slate-600 truncate">
								Requested by:
								{req.user?.firstName} {req.user?.lastName} (@{req.user?.username})
							</p>
							<p class="text-xs text-slate-500 mt-1">{new Date(req.createdAt).toLocaleString()}</p>
						</div>

						<div class="flex gap-3">
							<button
								onclick={() => setStatus(req.id, 'APPROVED')}
								disabled={reviewingId === req.id}
								class="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all min-h-touch-target disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{#if reviewingId === req.id}
									<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								{:else}
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
								<span>Approve</span>
							</button>

							<button
								onclick={() => setStatus(req.id, 'REJECTED')}
								disabled={reviewingId === req.id}
								class="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all min-h-touch-target disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{#if reviewingId === req.id}
									<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								{:else}
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
								{/if}
								<span>Reject</span>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-12 text-center">
			<div class="text-6xl mb-4">🧤</div>
			<h3 class="text-xl font-bold text-slate-800 mb-2">No Pending Supply Requests</h3>
			<p class="text-slate-600">Students haven’t requested any supplies yet.</p>
		</div>
	{/if}
</div>
