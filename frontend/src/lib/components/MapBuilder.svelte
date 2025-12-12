<script lang="ts">
  import type { Sector } from '$lib/types/teacher';

  interface MapSector extends Sector {
    gridX: number;
    gridY: number;
    gridWidth: number;
    gridHeight: number;
    color?: string;
  }

  interface Props {
    sectors: MapSector[];
    mapWidth: number;
    mapHeight: number;
    editable?: boolean;
    onSectorMove?: (sectorId: string, x: number, y: number) => void;
    onSectorResize?: (sectorId: string, width: number, height: number) => void;
    onMapResize?: (width: number, height: number) => void;
    onSectorClick?: (sector: MapSector) => void;
    onAddSector?: (type: string, x: number, y: number) => void;
    onPlaceSector?: (sectorId: string, x: number, y: number) => void;
  }

  let {
    sectors = [],
    mapWidth = 20,
    mapHeight = 16,
    editable = false,
    onSectorMove,
    onSectorResize,
    onMapResize,
    onSectorClick,
    onAddSector,
    onPlaceSector,
  }: Props = $props();

  // Split sectors into placed and unplaced
  let placedSectors = $derived(sectors.filter(s => s.gridX >= 0 && s.gridY >= 0));
  let unplacedSectors = $derived(sectors.filter(s => s.gridX < 0 || s.gridY < 0));

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

  let dragState = $state<{
    sectorId: string;
    type: 'move' | 'resize';
    startX: number;
    startY: number;
    originalX: number;
    originalY: number;
    originalWidth: number;
    originalHeight: number;
  } | null>(null);

  let selectedSectorId = $state<string | null>(null);
  
  // Drag state for placing sectors
  let placingDrag = $state<{
    sectorId?: string;
    type?: string;
    isNew: boolean;
  } | null>(null);
  let dropPreview = $state<{ x: number; y: number } | null>(null);

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

  // Drag handlers for moving/resizing placed sectors
  function handleMouseDown(e: MouseEvent, sector: MapSector, type: 'move' | 'resize') {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();

    selectedSectorId = sector.id;
    dragState = {
      sectorId: sector.id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      originalX: sector.gridX,
      originalY: sector.gridY,
      originalWidth: sector.gridWidth,
      originalHeight: sector.gridHeight,
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragState) return;

    const deltaX = Math.round((e.clientX - dragState.startX) / CELL_SIZE);
    const deltaY = Math.round((e.clientY - dragState.startY) / CELL_SIZE);

    const sector = sectors.find((s) => s.id === dragState!.sectorId);
    if (!sector) return;

    if (dragState.type === 'move') {
      const newX = Math.max(0, Math.min(mapWidth - sector.gridWidth, dragState.originalX + deltaX));
      const newY = Math.max(0, Math.min(mapHeight - sector.gridHeight, dragState.originalY + deltaY));
      if (newX !== sector.gridX || newY !== sector.gridY) {
        onSectorMove?.(sector.id, newX, newY);
      }
    } else if (dragState.type === 'resize') {
      const newWidth = Math.max(2, Math.min(12, mapWidth - sector.gridX, dragState.originalWidth + deltaX));
      const newHeight = Math.max(2, Math.min(10, mapHeight - sector.gridY, dragState.originalHeight + deltaY));
      if (newWidth !== sector.gridWidth || newHeight !== sector.gridHeight) {
        onSectorResize?.(sector.id, newWidth, newHeight);
      }
    }
  }

  function handleMouseUp() {
    dragState = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  function handleSectorClick(e: MouseEvent, sector: MapSector) {
    e.stopPropagation();
    selectedSectorId = sector.id;
    onSectorClick?.(sector);
  }

  function handleGridClick() {
    if (editable) selectedSectorId = null;
  }

  // Drag handlers for placing sectors from palette
  function handlePaletteDragStart(e: DragEvent, sectorId?: string, type?: string) {
    if (!e.dataTransfer) return;
    e.dataTransfer.setData('application/json', JSON.stringify({ sectorId, type }));
    e.dataTransfer.effectAllowed = 'move';
    placingDrag = { sectorId, type, isNew: !sectorId };
  }

  function handleGridDragOver(e: DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer) return;
    e.dataTransfer.dropEffect = 'move';
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    const clampedX = Math.max(0, Math.min(mapWidth - 3, x));
    const clampedY = Math.max(0, Math.min(mapHeight - 3, y));
    dropPreview = { x: clampedX, y: clampedY };
  }

  function handleGridDragLeave() {
    dropPreview = null;
  }

  function handleGridDrop(e: DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer || !dropPreview) return;
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (data.sectorId) {
        // Placing an existing unplaced sector
        onPlaceSector?.(data.sectorId, dropPreview.x, dropPreview.y);
      } else if (data.type) {
        // Creating a new sector
        onAddSector?.(data.type, dropPreview.x, dropPreview.y);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
    
    dropPreview = null;
    placingDrag = null;
  }
</script>

<div class="map-builder select-none" bind:this={containerRef}>
  <!-- Sector Palette -->
  {#if editable}
    <div class="mb-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-semibold text-slate-700">
          {unplacedSectors.length > 0 ? 'Your Sectors (drag to map)' : 'Add New Sectors'}
        </h4>
        <div class="flex items-center gap-3 text-xs text-slate-500">
          <span>Grid:</span>
          <input
            type="number"
            min="10"
            max="30"
            value={mapWidth}
            onchange={(e) => onMapResize?.(parseInt(e.currentTarget.value), mapHeight)}
            class="w-14 px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
          />
          <span>×</span>
          <input
            type="number"
            min="8"
            max="20"
            value={mapHeight}
            onchange={(e) => onMapResize?.(mapWidth, parseInt(e.currentTarget.value))}
            class="w-14 px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>
      
      <!-- Unplaced existing sectors -->
      {#if unplacedSectors.length > 0}
        <div class="mb-3">
          <p class="text-xs text-slate-500 mb-2">Drag these sectors to place them on the map:</p>
          <div class="flex flex-wrap gap-2">
            {#each unplacedSectors as sector}
              {@const config = getConfig(sector.type)}
              <div
                draggable="true"
                ondragstart={(e) => handlePaletteDragStart(e, sector.id)}
                class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-2 hover:scale-105"
                style="background-color: {config.bgColor}; border-color: {config.color};"
                role="button"
                tabindex="0"
              >
                <span class="text-xl">{config.icon}</span>
                <div>
                  <span class="text-sm font-semibold" style="color: {config.color};">{sector.name}</span>
                  {#if sector.missions && sector.missions.length > 0}
                    <span class="text-xs text-slate-500 ml-1">({sector.missions.length})</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
        <hr class="my-3 border-slate-200" />
      {/if}
      
      <!-- New sector types -->
      <p class="text-xs text-slate-500 mb-2">Or create new sectors:</p>
      <div class="flex flex-wrap gap-2">
        {#each Object.entries(sectorConfig) as [type, config]}
          {#if type !== 'CHICKENS'}
            <div
              draggable="true"
              ondragstart={(e) => handlePaletteDragStart(e, undefined, type)}
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-all border hover:scale-105 text-sm"
              style="background-color: {config.bgColor}; border-color: {config.color}40;"
              role="button"
              tabindex="0"
            >
              <span>{config.icon}</span>
              <span style="color: {config.color};">{config.label}</span>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

  <!-- Grid Container -->
  <div class="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-inner overflow-hidden">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
    <div
      class="relative mx-auto"
      style="width: {mapWidth * CELL_SIZE}px; height: {mapHeight * CELL_SIZE}px; margin: 16px auto;"
      onclick={handleGridClick}
      ondragover={editable ? handleGridDragOver : undefined}
      ondragleave={editable ? handleGridDragLeave : undefined}
      ondrop={editable ? handleGridDrop : undefined}
      role="application"
      aria-label="Schoolyard map"
    >
      <!-- Grid Pattern -->
      <div 
        class="absolute inset-0 rounded-xl"
        style="
          background-image: 
            linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px);
          background-size: {CELL_SIZE}px {CELL_SIZE}px;
        "
      ></div>

      <!-- Drop Preview -->
      {#if dropPreview && placingDrag}
        {@const currentDrag = placingDrag}
        {@const config = currentDrag.sectorId 
          ? getConfig(unplacedSectors.find(s => s.id === currentDrag.sectorId)?.type || 'OTHER')
          : getConfig(currentDrag.type || 'OTHER')}
        <div
          class="absolute rounded-xl border-2 border-dashed pointer-events-none animate-pulse z-30"
          style="
            left: {dropPreview.x * CELL_SIZE}px;
            top: {dropPreview.y * CELL_SIZE}px;
            width: {3 * CELL_SIZE}px;
            height: {3 * CELL_SIZE}px;
            background-color: {config.bgColor}80;
            border-color: {config.color};
          "
        >
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-3xl opacity-60">{config.icon}</span>
          </div>
        </div>
      {/if}

      <!-- Placed Sectors -->
      {#each placedSectors as sector (sector.id)}
        {@const config = getConfig(sector.type)}
        {@const isSelected = selectedSectorId === sector.id}
        {@const isDragging = dragState?.sectorId === sector.id}
        <div
          class="absolute rounded-xl transition-all duration-100 group"
          class:cursor-grab={editable && !isDragging}
          class:cursor-grabbing={isDragging}
          class:cursor-pointer={!editable}
          class:ring-4={isSelected}
          class:ring-blue-400={isSelected}
          class:shadow-2xl={isSelected || isDragging}
          class:shadow-lg={!isSelected && !isDragging}
          class:z-20={isSelected || isDragging}
          class:z-10={!isSelected && !isDragging}
          style="
            left: {sector.gridX * CELL_SIZE}px;
            top: {sector.gridY * CELL_SIZE}px;
            width: {sector.gridWidth * CELL_SIZE}px;
            height: {sector.gridHeight * CELL_SIZE}px;
            background: linear-gradient(145deg, {config.bgColor} 0%, white 100%);
            border: 3px solid {config.color};
          "
          onclick={(e) => handleSectorClick(e, sector)}
          onmousedown={(e) => editable && handleMouseDown(e, sector, 'move')}
          onkeydown={(e) => e.key === 'Enter' && handleSectorClick(e as any, sector)}
          role="button"
          tabindex="0"
          aria-label="{sector.name} sector"
        >
          <div class="absolute inset-0 flex flex-col items-center justify-center p-1 overflow-hidden">
            <div class="transition-transform" class:scale-110={isSelected}
              style="font-size: {Math.max(24, Math.min(40, sector.gridHeight * CELL_SIZE / 3))}px;">
              {config.icon}
            </div>
            <div class="font-bold text-center leading-tight px-1 truncate w-full"
              style="color: {config.color}; font-size: {Math.max(10, Math.min(14, sector.gridWidth * CELL_SIZE / 8))}px;">
              {sector.name}
            </div>
            {#if sector.missions && sector.missions.length > 0}
              <div class="mt-0.5 px-2 py-0.5 rounded-full text-white shadow-sm"
                style="background-color: {config.color}; font-size: {Math.max(9, Math.min(11, CELL_SIZE / 4))}px;">
                {sector.missions.length} mission{sector.missions.length !== 1 ? 's' : ''}
              </div>
            {/if}
          </div>

          {#if editable && isSelected}
            <div
              class="absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 rounded-full cursor-se-resize flex items-center justify-center shadow-lg border-2 border-white hover:bg-blue-600 z-30"
              onmousedown={(e) => { e.stopPropagation(); handleMouseDown(e, sector, 'resize'); }}
              role="button"
              aria-label="Resize"
              tabindex="0"
            >
              <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 20h16M20 4v16" />
              </svg>
            </div>
          {/if}
        </div>
      {/each}

      <!-- Empty state -->
      {#if placedSectors.length === 0}
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="text-center p-6 bg-white/70 rounded-2xl backdrop-blur-sm">
            <div class="text-4xl mb-2">🗺️</div>
            <p class="text-slate-600 font-medium text-sm">
              {editable ? 'Drag sectors from above to build your map' : 'No sectors placed on map yet'}
            </p>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Instructions -->
  {#if editable && placedSectors.length > 0}
    <div class="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
      <div class="flex items-center gap-1.5">
        <span class="w-4 h-4 bg-slate-100 rounded flex items-center justify-center text-[10px]">✋</span>
        <span>Drag to move</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <svg class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 20h16M20 4v16" />
          </svg>
        </span>
        <span>Drag corner to resize</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .map-builder {
    user-select: none;
  }
</style>
