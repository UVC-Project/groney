<script lang="ts">
	import type { PageData } from './$types';
	import StudentMap from '$lib/components/StudentMap.svelte';
	import { auth } from '$lib/stores/auth';
	import { API_BASE_URL } from '$lib/config';
	import { goto, invalidateAll } from '$app/navigation';
	import { browser } from '$app/environment';
	import { get } from 'svelte/store';

	let { data }: { data: PageData } = $props();

	// Use $derived to properly track data changes
	let sectors = $derived(data.sectors);
	let decorations = $derived(data.decorations);
	let mapWidth = $derived(data.mapWidth);
	let mapHeight = $derived(data.mapHeight);

	const STATUS_PRIORITY: Record<string, number> = {
		'my_active': 0,
		'available': 1,
		'cooldown': 2,
		'taken': 3,
		'max_reached': 4
	};

	// Prepare data for the map: Sort missions and mark sectors as Red if needed
	let displaySectors = $derived(
		sectors.map(sector => {
			const sortedMissions = [...sector.missions].sort((a: any, b: any) => {
				const priorityA = STATUS_PRIORITY[a.missionStatus] ?? 99;
				const priorityB = STATUS_PRIORITY[b.missionStatus] ?? 99;
				
				if (priorityA !== priorityB) return priorityA - priorityB;
				
				// Urgent missions go to the top of the list
				if (a.isUrgent && !b.isUrgent) return -1;
				if (!a.isUrgent && b.isUrgent) return 1;
				
				return 0;
			});

			// Check if we need to color the sector Red on the map
			const hasUrgent = sortedMissions.some((m: any) => m.isUrgent && m.missionStatus === 'available');

			return {
				...sector,
				missions: sortedMissions,
				color: hasUrgent ? '#ef4444' : undefined 
			};
		})
	);

	let selectedMission = $state<any>(null);
	let selectedSector = $state<any>(null);
	let isAccepting = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	let authState = $state(get(auth));
	
	$effect(() => {
		const unsubscribe = auth.subscribe(value => {
			authState = value;
		});
		return unsubscribe;
	});

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

			successMessage = 'Mission accepted! Go complete it and come back to submit.';
			
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

	function getMissionAction(mission: any): { label: string; action: 'accept' | 'submit' | 'none'; disabled: boolean } {
		switch (mission.missionStatus) {
			case 'my_active':
            	// Only show "Under Review" if they've actually uploaded a photo
            	if (mission.myPendingSubmissionId && mission.mySubmissionHasPhoto) {
                	return { label: '⏳ Under Review', action: 'none', disabled: true };
            	}
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
	<h1 class="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-6 text-center tracking-tight">
		Schoolyard Map
	</h1>
	<StudentMap
		sectors={displaySectors}
		{decorations}
		{mapWidth}
		{mapHeight}
		onMissionClick={(mission, sector) => handleMissionClick(mission, sector)}
	/>
</div>

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
			<div class="px-6 py-4 text-white bg-gradient-to-r from-emerald-500 to-teal-600">
				<div class="flex items-center justify-between">
					<div>
						<div class="flex items-center gap-2">
							<h3 class="text-lg md:text-xl font-bold">{selectedMission.title}</h3>
						</div>
						{#if selectedSector}
							<p class="text-emerald-100 text-sm mt-1 font-medium">📍 {selectedSector.name}</p>
						{/if}
					</div>
					{#if selectedMission.missionStatus === 'my_active'}
						<span class="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
							📋 Your Mission
						</span>
					{/if}
				</div>
			</div>

			<div class="p-6">
				<p class="text-gray-600 text-sm leading-relaxed mb-4">{selectedMission.description}</p>

				<div class="flex flex-wrap gap-2 mb-4">
					<span class="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
						⭐ +{selectedMission.xpReward} XP
					</span>
					<span class="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
						🪙 +{selectedMission.coinReward} Coins
					</span>
				</div>

				{#if selectedMission.thirstBoost || selectedMission.hungerBoost || selectedMission.happinessBoost || selectedMission.cleanlinessBoost}
					<div class="mb-4">
						<p class="text-sm font-bold text-gray-700 mb-2">Mascot Boosts:</p>
						<div class="flex flex-wrap gap-2">
							{#if selectedMission.thirstBoost}
								<span class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
									💧 +{selectedMission.thirstBoost} Thirst
								</span>
							{/if}
							{#if selectedMission.hungerBoost}
								<span class="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-semibold">
									🍎 +{selectedMission.hungerBoost} Hunger
								</span>
							{/if}
							{#if selectedMission.happinessBoost}
								<span class="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs font-semibold">
									😊 +{selectedMission.happinessBoost} Happiness
								</span>
							{/if}
							{#if selectedMission.cleanlinessBoost}
								<span class="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold">
									✨ +{selectedMission.cleanlinessBoost} Clean
								</span>
							{/if}
						</div>
					</div>
				{/if}

				{#if selectedMission.missionStatus === 'taken'}
					<div class="p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm mb-4">
						🔒 This mission is currently being done by <span class="font-semibold">{selectedMission.takenBy?.firstName || 'someone'}</span>.
					</div>
				{:else if selectedMission.missionStatus === 'cooldown'}
					<div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm mb-4">
						⏱️ Available in <span class="font-semibold">{selectedMission.cooldownStatus?.hoursRemaining}h</span>
					</div>
				{:else if selectedMission.missionStatus === 'max_reached'}
					<div class="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm mb-4">
						✅ Max completions reached
					</div>
				{:else if selectedMission.myPendingSubmissionId && selectedMission.mySubmissionHasPhoto}
    				<div class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm mb-4 flex items-start gap-2">
    				    <span class="text-lg">📤</span>
    				    <div>
    				        <p class="font-bold text-blue-800">Submission Received</p>
    				        <p class="text-blue-600">Please wait for your teacher to review it.</p>
    				    </div>
    				</div>
				{:else if selectedMission.myPendingSubmissionId && !selectedMission.mySubmissionHasPhoto}
    				<div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm mb-4 flex items-start gap-2">
    				    <span class="text-lg">📷</span>
    				    <div>
    				        <p class="font-bold text-amber-800">Photo Required</p>
    				        <p class="text-amber-600">Upload a photo to complete this mission!</p>
    				    </div>
    				</div>
				{/if}

				{#if errorMessage}
					<div class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4 font-medium">
						{errorMessage}
					</div>
				{/if}

				{#if successMessage}
					<div class="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm mb-4 font-medium">
						✅ {successMessage}
					</div>
				{/if}

				<div class="flex gap-3">
					<button
						onclick={closeModal}
						class="btn-secondary flex-1"
					>
						Close
					</button>
					
					{#if missionAction.action === 'accept'}
						<button
							onclick={acceptMission}
							disabled={isAccepting || !!successMessage || missionAction.disabled}
							class="btn-primary flex-1"
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
							onclick={() => goto(`/missions/${selectedMission.id}/submit`)}
							class="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all duration-150 min-h-[48px]"
						>
							{missionAction.label}
						</button>
					{:else}
						<button
							disabled={true}
							class="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-400 font-bold py-3 px-6 rounded-2xl cursor-not-allowed min-h-[48px]"
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