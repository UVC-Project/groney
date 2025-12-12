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
  }: Props = $props();

  const CELL_SIZE = 32; // pixels per cell
  const MIN_SECTOR_SIZE = 1;
  const MAX_SECTOR_SIZE = 10;

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
  let hoveredCell = $state<{ x: number; y: number } | null>(null);

  // Sector type colors
  const sectorColors: Record<string, string> = {
    TREES: '#22c55e',
    FLOWERS: '#ec4899',
    POND: '#3b82f6',
    ANIMALS: '#f59e0b',
    GARDEN: '#f97316',
    PLAYGROUND: '#a855f7',
    COMPOST: '#84cc16',
    OTHER: '#64748b',
    CHICKENS: '#f59e0b',
  };

  const sectorIcons: Record<string, string> = {
    TREES: '🌳',
    FLOWERS: '🌸',
    POND: '🦆',
    ANIMALS: '🐾',
    GARDEN: '🥕',
    PLAYGROUND: '🎪',
    COMPOST: '♻️',
    OTHER: '📍',
    CHICKENS: '🐔',
  };

  function getSectorColor(sector: MapSector): string {
    return sector.color || sectorColors[sector.type] || '#64748b';
  }

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
      const newWidth = Math.max(
        MIN_SECTOR_SIZE,
        Math.min(MAX_SECTOR_SIZE, mapWidth - sector.gridX, dragState.originalWidth + deltaX)
      );
      const newHeight = Math.max(
        MIN_SECTOR_SIZE,
        Math.min(MAX_SECTOR_SIZE, mapHeight - sector.gridY, dragState.originalHeight + deltaY)
      );

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

  function handleGridClick(e: MouseEvent) {
    if (!editable) return;
    selectedSectorId = null;
  }

  function handleSectorClick(e: MouseEvent, sector: MapSector) {
    e.stopPropagation();
    selectedSectorId = sector.id;
    onSectorClick?.(sector);
  }

  function handleCellHover(x: number, y: number) {
    hoveredCell = { x, y };
  }

  function handleCellLeave() {
    hoveredCell = null;
  }

  // Generate grid cells
  let gridCells = $derived(
    Array.from({ length: mapHeight }, (_, y) =>
      Array.from({ length: mapWidth }, (_, x) => ({ x, y }))
    ).flat()
  );
</script>

<div class="map-builder">
  <!-- Map Size Controls -->
  {#if editable}
    <div class="flex items-center gap-4 mb-4 p-3 bg-slate-100 rounded-lg">
      <span class="text-sm font-medium text-slate-700">Map Size:</span>
      <div class="flex items-center gap-2">
        <label for="map-width" class="text-xs text-slate-600">Width</label>
        <input
          type="number"
          id="map-width"
          min="10"
          max="40"
          value={mapWidth}
          onchange={(e) => onMapResize?.(parseInt(e.currentTarget.value), mapHeight)}
          class="w-16 px-2 py-1 text-sm border border-slate-300 rounded"
        />
      </div>
      <div class="flex items-center gap-2">
        <label for="map-height" class="text-xs text-slate-600">Height</label>
        <input
          type="number"
          id="map-height"
          min="10"
          max="30"
          value={mapHeight}
          onchange={(e) => onMapResize?.(mapWidth, parseInt(e.currentTarget.value))}
          class="w-16 px-2 py-1 text-sm border border-slate-300 rounded"
        />
      </div>
      <span class="text-xs text-slate-500">({mapWidth * 0.5}m × {mapHeight * 0.5}m)</span>
    </div>
  {/if}

  <!-- Grid Container -->
  <div class="overflow-auto border border-slate-300 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
    <div
      class="relative"
      style="width: {mapWidth * CELL_SIZE}px; height: {mapHeight * CELL_SIZE}px;"
      onclick={handleGridClick}
      onkeydown={(e) => e.key === 'Escape' && (selectedSectorId = null)}
      role="application"
      aria-label="Schoolyard map grid"
      tabindex="0"
    >
      <!-- Grid Lines -->
      <svg class="absolute inset-0 pointer-events-none" width="100%" height="100%">
        {#each Array.from({ length: mapWidth + 1 }) as _, i}
          <line
            x1={i * CELL_SIZE}
            y1="0"
            x2={i * CELL_SIZE}
            y2={mapHeight * CELL_SIZE}
            stroke="#d1d5db"
            stroke-width="1"
          />
        {/each}
        {#each Array.from({ length: mapHeight + 1 }) as _, i}
          <line
            x1="0"
            y1={i * CELL_SIZE}
            x2={mapWidth * CELL_SIZE}
            y2={i * CELL_SIZE}
            stroke="#d1d5db"
            stroke-width="1"
          />
        {/each}
      </svg>

      <!-- Hover indicator for empty cells -->
      {#if editable && hoveredCell}
        <div
          class="absolute bg-slate-200/50 pointer-events-none transition-all"
          style="
            left: {hoveredCell.x * CELL_SIZE}px;
            top: {hoveredCell.y * CELL_SIZE}px;
            width: {CELL_SIZE}px;
            height: {CELL_SIZE}px;
          "
        ></div>
      {/if}

      <!-- Invisible cell hover detectors -->
      {#if editable}
        {#each gridCells as cell}
          <div
            class="absolute"
            style="
              left: {cell.x * CELL_SIZE}px;
              top: {cell.y * CELL_SIZE}px;
              width: {CELL_SIZE}px;
              height: {CELL_SIZE}px;
            "
            onmouseenter={() => handleCellHover(cell.x, cell.y)}
            onmouseleave={handleCellLeave}
            role="presentation"
          ></div>
        {/each}
      {/if}

      <!-- Sectors -->
      {#each sectors as sector (sector.id)}
        {@const isSelected = selectedSectorId === sector.id}
        {@const color = getSectorColor(sector)}
        <div
          class="absolute rounded-lg shadow-md transition-shadow cursor-pointer group"
          class:ring-2={isSelected}
          class:ring-blue-500={isSelected}
          class:shadow-lg={isSelected}
          style="
            left: {sector.gridX * CELL_SIZE}px;
            top: {sector.gridY * CELL_SIZE}px;
            width: {sector.gridWidth * CELL_SIZE}px;
            height: {sector.gridHeight * CELL_SIZE}px;
            background-color: {color}20;
            border: 2px solid {color};
          "
          onclick={(e) => handleSectorClick(e, sector)}
          onmousedown={(e) => editable && handleMouseDown(e, sector, 'move')}
          onkeydown={(e) => e.key === 'Enter' && handleSectorClick(e as any, sector)}
          role="button"
          tabindex="0"
          aria-label="{sector.name} sector"
        >
          <!-- Sector Content -->
          <div class="absolute inset-0 flex flex-col items-center justify-center p-1 overflow-hidden">
            <span class="text-2xl">{sectorIcons[sector.type] || '📍'}</span>
            <span
              class="text-xs font-semibold text-center truncate w-full px-1"
              style="color: {color};"
            >
              {sector.name}
            </span>
            {#if sector.missions && sector.missions.length > 0}
              <span class="text-[10px] text-slate-600">
                {sector.missions.length} mission{sector.missions.length !== 1 ? 's' : ''}
              </span>
            {/if}
          </div>

          <!-- Resize Handle (bottom-right corner) -->
          {#if editable && isSelected}
            <div
              class="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-tl cursor-se-resize flex items-center justify-center"
              onmousedown={(e) => handleMouseDown(e, sector, 'resize')}
              role="button"
              aria-label="Resize {sector.name}"
              tabindex="0"
            >
              <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" />
                <path d="M10 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1z" />
              </svg>
            </div>
          {/if}

          <!-- Move indicator on hover -->
          {#if editable}
            <div
              class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- Legend -->
  <div class="mt-4 flex flex-wrap gap-3">
    {#each Object.entries(sectorColors) as [type, color]}
      {#if type !== 'CHICKENS'}
        <div class="flex items-center gap-1.5">
          <div
            class="w-4 h-4 rounded"
            style="background-color: {color}20; border: 2px solid {color};"
          ></div>
          <span class="text-xs text-slate-600">{sectorIcons[type]} {type.charAt(0) + type.slice(1).toLowerCase()}</span>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .map-builder {
    user-select: none;
  }
</style>
