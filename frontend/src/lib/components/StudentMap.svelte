<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	interface Mission {
		id: string;
		title: string;
		description: string;
		xpReward: number;
		coinReward: number;
		thirstBoost?: number;
		hungerBoost?: number;
		happinessBoost?: number;
		cleanlinessBoost?: number;
	}

	interface Sector {
		id: string;
		name: string;
		type: string;
		gridX: number;
		gridY: number;
		gridWidth: number;
		gridHeight: number;
		missions: Mission[];
	}

	interface Props {
		sectors: Sector[];
		mapWidth?: number;
		mapHeight?: number;
		onSectorClick?: (sector: Sector) => void;
		onMissionClick?: (mission: Mission, sector: Sector) => void;
	}

	let { sectors = [], mapWidth = 20, mapHeight = 16, onSectorClick, onMissionClick }: Props = $props();

	const dispatch = createEventDispatcher<{
		sectorClick: { sector: Sector };
		missionClick: { mission: Mission; sector: Sector };
	}>();

	// Only show placed sectors
	let placedSectors = $derived(sectors.filter((s) => s.gridX >= 0 && s.gridY >= 0));

	// Responsive cell size
	let containerRef = $state<HTMLDivElement | null>(null);
	let containerWidth = $state(800);
	let CELL_SIZE = $derived(Math.max(28, Math.min(50, Math.floor((containerWidth - 40) / mapWidth))));

	$effect(() => {
		if (!containerRef) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerWidth = entry.contentRect.width;
			}
		});
		observer.observe(containerRef);
		return () => observer.disconnect();
	});

	let selectedSector = $state<Sector | null>(null);

	// Sector type configurations
	const sectorConfig: Record<string, { color: string; bgColor: string; icon: string; label: string }> = {
		TREES: { color: '#16a34a', bgColor: '#dcfce7', icon: '🌳', label: 'Trees' },
		FLOWERS: { color: '#db2777', bgColor: '#fce7f3', icon: '🌸', label: 'Flowers' },
		POND: { color: '#2563eb', bgColor: '#dbeafe', icon: '🦆', label: 'Pond' },
		ANIMALS: { color: '#d97706', bgColor: '#fef3c7', icon: '🐾', label: 'Animals' },
		GARDEN: { color: '#ea580c', bgColor: '#ffedd5', icon: '🥕', label: 'Garden' },
		PLAYGROUND: { color: '#9333ea', bgColor: '#f3e8ff', icon: '🎪', label: 'Playground' },
		COMPOST: { color: '#65a30d', bgColor: '#ecfccb', icon: '♻️', label: 'Compost' },
		OTHER: { color: '#475569', bgColor: '#f1f5f9', icon: '📍', label: 'Other' },
		CHICKENS: { color: '#d97706', bgColor: '#fef3c7', icon: '🐔', label: 'Chickens' },
	};

	function getConfig(type: string) {
		return sectorConfig[type?.toUpperCase()] || sectorConfig.OTHER;
	}

	function handleSectorClick(sector: Sector) {
		selectedSector = sector;
		onSectorClick?.(sector);
		dispatch('sectorClick', { sector });
	}

	function handleMissionClick(mission: Mission, sector: Sector) {
		onMissionClick?.(mission, sector);
		dispatch('missionClick', { mission, sector });
	}

	function closeSectorPanel() {
		selectedSector = null;
	}
</script>

<div class="student-map" bind:this={containerRef}>
	<!-- Map Title -->
	<div class="text-center mb-4">
		<h2 class="text-2xl font-bold text-slate-800">🗺️ Schoolyard Map</h2>
		<p class="text-sm text-slate-600">Tap on an area to see available missions</p>
	</div>

	<!-- Grid Container -->
	<div
		class="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-lg overflow-hidden"
	>
		<div class="relative p-4 flex justify-center">
			<div
				class="relative"
				style="width: {mapWidth * CELL_SIZE}px; height: {mapHeight * CELL_SIZE}px;"
			>
				<!-- Grid Pattern (subtle) -->
				<div
					class="absolute inset-0 rounded-xl opacity-30"
					style="
            background-image: 
              linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
            background-size: {CELL_SIZE}px {CELL_SIZE}px;
          "
				></div>

				<!-- Placed Sectors -->
				{#each placedSectors as sector (sector.id)}
					{@const config = getConfig(sector.type)}
					{@const isSelected = selectedSector?.id === sector.id}
					{@const hasMissions = sector.missions && sector.missions.length > 0}
					<button
						class="absolute rounded-xl transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]"
						class:ring-4={isSelected}
						class:ring-blue-400={isSelected}
						class:shadow-2xl={isSelected}
						class:shadow-lg={!isSelected}
						class:z-20={isSelected}
						class:z-10={!isSelected}
						style="
              left: {sector.gridX * CELL_SIZE}px;
              top: {sector.gridY * CELL_SIZE}px;
              width: {sector.gridWidth * CELL_SIZE}px;
              height: {sector.gridHeight * CELL_SIZE}px;
              background: linear-gradient(145deg, {config.bgColor} 0%, white 100%);
              border: 3px solid {config.color};
            "
						onclick={() => handleSectorClick(sector)}
					>
						<div class="absolute inset-0 flex flex-col items-center justify-center p-1 overflow-hidden">
							<div
								class="transition-transform group-hover:scale-110"
								style="font-size: {Math.max(24, Math.min(48, sector.gridHeight * CELL_SIZE / 2.5))}px;"
							>
								{config.icon}
							</div>
							<div
								class="font-bold text-center leading-tight px-1 truncate w-full"
								style="color: {config.color}; font-size: {Math.max(
									11,
									Math.min(16, sector.gridWidth * CELL_SIZE / 7)
								)}px;"
							>
								{sector.name}
							</div>
							{#if hasMissions}
								<div
									class="mt-1 px-2 py-0.5 rounded-full text-white shadow-sm animate-pulse"
									style="background-color: {config.color}; font-size: {Math.max(
										10,
										Math.min(12, CELL_SIZE / 3.5)
									)}px;"
								>
									{sector.missions.length} mission{sector.missions.length !== 1 ? 's' : ''}
								</div>
							{/if}
						</div>
					</button>
				{/each}

				<!-- Empty state -->
				{#if placedSectors.length === 0}
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="text-center p-6 bg-white/80 rounded-2xl backdrop-blur-sm">
							<div class="text-5xl mb-3">🏫</div>
							<p class="text-slate-600 font-medium">No map areas yet</p>
							<p class="text-sm text-slate-500 mt-1">Your teacher is still building the map!</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Selected Sector Panel -->
	{#if selectedSector}
		{@const config = getConfig(selectedSector.type)}
		<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
			<div
				class="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-slide-up"
				onclick={(e) => e.stopPropagation()}
			>
				<!-- Header -->
				<div
					class="px-6 py-4 flex items-center justify-between"
					style="background: linear-gradient(135deg, {config.bgColor} 0%, white 100%);"
				>
					<div class="flex items-center gap-3">
						<span class="text-4xl">{config.icon}</span>
						<div>
							<h3 class="text-xl font-bold" style="color: {config.color};">{selectedSector.name}</h3>
							<p class="text-sm text-slate-600">
								{selectedSector.missions?.length || 0} mission{(selectedSector.missions?.length || 0) !== 1
									? 's'
									: ''} available
							</p>
						</div>
					</div>
					<button
						onclick={closeSectorPanel}
						class="p-2 hover:bg-black/10 rounded-full transition-colors"
						aria-label="Close"
					>
						<svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Missions List -->
				<div class="p-4 overflow-y-auto max-h-[60vh]">
					{#if selectedSector.missions && selectedSector.missions.length > 0}
						<div class="space-y-3">
							{#each selectedSector.missions as mission}
								<button
									class="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all hover:shadow-md border border-slate-200"
									onclick={() => handleMissionClick(mission, selectedSector)}
								>
									<div class="flex items-start justify-between gap-3">
										<div class="flex-1 min-w-0">
											<h4 class="font-semibold text-slate-800 truncate">{mission.title}</h4>
											<p class="text-sm text-slate-600 mt-1 line-clamp-2">{mission.description}</p>
										</div>
										<div class="flex flex-col items-end gap-1 flex-shrink-0">
											<span class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
												+{mission.xpReward} XP
											</span>
											<span class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
												+{mission.coinReward} 🪙
											</span>
										</div>
									</div>

									<!-- Stat boosts -->
									{#if mission.thirstBoost || mission.hungerBoost || mission.happinessBoost || mission.cleanlinessBoost}
										<div class="flex flex-wrap gap-1.5 mt-2">
											{#if mission.thirstBoost}
												<span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
													💧 +{mission.thirstBoost}
												</span>
											{/if}
											{#if mission.hungerBoost}
												<span class="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">
													🍎 +{mission.hungerBoost}
												</span>
											{/if}
											{#if mission.happinessBoost}
												<span class="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs">
													😊 +{mission.happinessBoost}
												</span>
											{/if}
											{#if mission.cleanlinessBoost}
												<span class="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
													✨ +{mission.cleanlinessBoost}
												</span>
											{/if}
										</div>
									{/if}
								</button>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<div class="text-4xl mb-2">📭</div>
							<p class="text-slate-600">No missions in this area yet</p>
							<p class="text-sm text-slate-500 mt-1">Check back later!</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.student-map {
		user-select: none;
	}

	@keyframes slide-up {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.animate-slide-up {
			animation: none;
		}
	}
</style>
