<script lang="ts">
	import type { PageData } from './$types';
	import StudentMap from '$lib/components/StudentMap.svelte';
	import { auth } from '$lib/stores/auth';
	import { API_BASE_URL } from '$lib/config';
	import { goto, invalidateAll } from '$app/navigation';
	import { browser } from '$app/environment';
	import { get } from 'svelte/store';

	let { data }: { data: PageData } = $props();

	let sectors = $state(data.sectors);
	let mapWidth = $state(data.mapWidth);
	let mapHeight = $state(data.mapHeight);

	// Sync sectors when data changes
	$effect(() => {
		sectors = data.sectors;
	});

	// Selected mission for the modal
	let selectedMission = $state<any>(null);
	let selectedSector = $state<any>(null);
	let isAccepting = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	// Auth state
	let authState = $state(get(auth));
	
	$effect(() => {
		const unsubscribe = auth.subscribe(value => {
			authState = value;
		});
		return unsubscribe;
	});

	// Redirect to login if not authenticated
	$effect(() => {
		if (browser && !authState.user) {
			goto('/login');
		}
	});

	function handleMissionClick(mission: any, sector: any) {
		selectedMission = mission;
		selectedSector = sector;
		errorMessage = '';
		successMessage = '';
	}

	function closeModal() {
		selectedMission = null;
		selectedSector = null;
		errorMessage = '';
	}

	async function refreshSectors() {
		// Refresh the page data to get updated mission statuses
		await invalidateAll();
	}

	async function acceptMission() {
		if (!selectedMission || !authState.user) return;

		isAccepting = true;
		errorMessage = '';

		try {
			const classId = authState.classes?.[0]?.id;
			if (!classId) {
				throw new Error('No class found');
			}

			const res = await fetch(`${API_BASE_URL}/api/student/missions/${selectedMission.id}/accept`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-user-id': authState.user.id,
					'x-user-role': authState.user.role,
					...(authState.token ? { Authorization: `Bearer ${authState.token}` } : {}),
				},
				body: JSON.stringify({
					userId: authState.user.id,
					classId,
				}),
			});

			const responseData = await res.json().catch(() => ({}));

			if (!res.ok) {
				throw new Error(responseData.message || 'Failed to accept mission');
			}

			const missionId = selectedMission.id;

			sectors = sectors.map(s => {
				if (s.id === selectedSector.id) {
					return {
						...s,
						missions: s.missions.filter((m: any) => m.id !== missionId)
					};
				}
				return s;
			});

			successMessage = 'Mission accepted! Go complete it and come back to submit.';
			
			// Refresh data to update mission statuses
			await refreshSectors();
			
			setTimeout(() => {
				closeModal();
				goto(`/missions/${missionId}/submit`);
			}, 1000);
		} catch (err) {
			console.error('Accept mission error:', err);
			errorMessage = err instanceof Error ? err.message : 'Could not accept mission. Try again later.';
		} finally {
			isAccepting = false;
		}
	}

	// Determine what action to show based on mission status
	function getMissionAction(mission: any): { label: string; action: 'accept' | 'submit' | 'none'; disabled: boolean } {
		switch (mission.missionStatus) {
			case 'my_active':
				return { label: '📸 Submit Photo', action: 'submit', disabled: false };
			case 'available':
				return { label: '🎯 Accept Mission', action: 'accept', disabled: false };
			case 'taken':
				return { label: `🔒 Taken by ${mission.takenBy?.firstName || 'someone'}`, action: 'none', disabled: true };
			case 'cooldown':
				return { label: `⏱️ Available in ${mission.cooldownStatus?.hoursRemaining}h`, action: 'none', disabled: true };
			case 'max_reached':
				return { label: '✅ Max completions reached', action: 'none', disabled: true };
			default:
				return { label: '🎯 Accept Mission', action: 'accept', disabled: false };
		}
	}
</script>

<div class="container mx-auto px-4 py-6 max-w-4xl">
	<StudentMap
		{sectors}
		{mapWidth}
		{mapHeight}
		onMissionClick={(mission, sector) => handleMissionClick(mission, sector)}
	/>
</div>

<!-- Mission Detail Modal -->
{#if selectedMission}
	{@const missionAction = getMissionAction(selectedMission)}
	<div
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
		onclick={closeModal}
	>
		<div
			class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-white">
				<div class="flex items-center justify-between">
					<div>
						<h3 class="text-xl font-bold">{selectedMission.title}</h3>
						{#if selectedSector}
							<p class="text-emerald-100 text-sm mt-1">📍 {selectedSector.name}</p>
						{/if}
					</div>
					{#if selectedMission.missionStatus === 'my_active'}
						<span class="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
							📋 Your Mission
						</span>
					{/if}
				</div>
			</div>

			<!-- Content -->
			<div class="p-6">
				<p class="text-slate-700 mb-4">{selectedMission.description}</p>

				<!-- Rewards -->
				<div class="flex flex-wrap gap-2 mb-4">
					<span class="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
						⭐ +{selectedMission.xpReward} XP
					</span>
					<span class="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
						🪙 +{selectedMission.coinReward} Coins
					</span>
				</div>

				<!-- Stat Boosts -->
				{#if selectedMission.thirstBoost || selectedMission.hungerBoost || selectedMission.happinessBoost || selectedMission.cleanlinessBoost}
					<div class="mb-4">
						<p class="text-sm font-semibold text-slate-600 mb-2">Mascot Boosts:</p>
						<div class="flex flex-wrap gap-2">
							{#if selectedMission.thirstBoost}
								<span class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
									💧 +{selectedMission.thirstBoost} Thirst
								</span>
							{/if}
							{#if selectedMission.hungerBoost}
								<span class="px-2 py-1 bg-orange-50 text-orange-700 rounded text-sm">
									🍎 +{selectedMission.hungerBoost} Hunger
								</span>
							{/if}
							{#if selectedMission.happinessBoost}
								<span class="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-sm">
									😊 +{selectedMission.happinessBoost} Happiness
								</span>
							{/if}
							{#if selectedMission.cleanlinessBoost}
								<span class="px-2 py-1 bg-green-50 text-green-700 rounded text-sm">
									✨ +{selectedMission.cleanlinessBoost} Cleanliness
								</span>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Status info for taken/cooldown missions -->
				{#if selectedMission.missionStatus === 'taken'}
					<div class="p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 text-sm mb-4">
						🔒 This mission is currently being done by {selectedMission.takenBy?.firstName || 'another student'}.
					</div>
				{:else if selectedMission.missionStatus === 'cooldown'}
					<div class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm mb-4">
						⏱️ This mission was recently completed. Available again in {selectedMission.cooldownStatus?.hoursRemaining} hour(s).
					</div>
				{:else if selectedMission.missionStatus === 'max_reached'}
					<div class="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
						✅ This mission has been completed the maximum number of times.
					</div>
				{:else if selectedMission.missionStatus === 'my_active'}
					<div class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm mb-4">
						📋 You've accepted this mission! Complete it in the schoolyard and come back to submit a photo.
					</div>
				{/if}

				<!-- Messages -->
				{#if errorMessage}
					<div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
						{errorMessage}
					</div>
				{/if}

				{#if successMessage}
					<div class="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
						✅ {successMessage}
					</div>
				{/if}

				<!-- Actions -->
				<div class="flex gap-3">
					<button
						onclick={closeModal}
						class="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
					>
						Close
					</button>
					
					{#if missionAction.action === 'accept'}
						<button
							onclick={acceptMission}
							disabled={isAccepting || !!successMessage || missionAction.disabled}
							class="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{#if isAccepting}
								<svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Accepting...
							{:else if successMessage}
								✅ Accepted!
							{:else}
								{missionAction.label}
							{/if}
						</button>
					{:else if missionAction.action === 'submit'}
						<button
							disabled={true}
							class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							📸 Submit Photo (Coming Soon)
						</button>
					{:else}
						<button
							disabled={true}
							class="flex-1 px-4 py-3 bg-slate-200 text-slate-500 font-semibold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
						>
							{missionAction.label}
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes scale-in {
		from {
			transform: scale(0.9);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.animate-scale-in {
		animation: scale-in 0.2s ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.animate-scale-in {
			animation: none;
		}
	}
</style>
