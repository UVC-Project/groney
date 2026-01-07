<script lang="ts">
  import type { Sector } from '$lib/types/teacher';

  interface MapSector extends Sector {
    gridX: number;
    gridY: number;
    gridWidth: number;
    gridHeight: number;
    color?: string;
  }

  interface MapDecoration {
    id: string;
    type: string;
    gridX: number;
    gridY: number;
    gridWidth: number;
    gridHeight: number;
    label?: string;
  }

  interface Props {
    sectors: MapSector[];
    decorations?: MapDecoration[];
    mapWidth: number;
    mapHeight: number;
    editable?: boolean;
    onSectorMove?: (sectorId: string, x: number, y: number) => void;
    onSectorResize?: (sectorId: string, width: number, height: number) => void;
    onMapResize?: (width: number, height: number) => void;
    onSectorClick?: (sector: MapSector) => void;
    onAddSector?: (type: string, x: number, y: number) => void;
    onPlaceSector?: (sectorId: string, x: number, y: number) => void;
    onSectorRename?: (sectorId: string, newName: string) => void;
    onSectorDelete?: (sectorId: string) => void;
    onSectorRemoveFromMap?: (sectorId: string) => void;
    onSectorEdit?: (sector: MapSector) => void;
    // Decoration handlers
    onAddDecoration?: (type: string, x: number, y: number) => void;
    onDecorationMove?: (decorationId: string, x: number, y: number) => void;
    onDecorationResize?: (decorationId: string, width: number, height: number) => void;
    onDecorationDelete?: (decorationId: string) => void;
  }

  let {
    sectors = [],
    decorations = [],
    mapWidth = 20,
    mapHeight = 16,
    editable = false,
    onSectorMove,
    onSectorResize,
    onMapResize,
    onSectorClick,
    onAddSector,
    onPlaceSector,
    onSectorRename,
    onSectorDelete,
    onSectorRemoveFromMap,
    onSectorEdit,
    onAddDecoration,
    onDecorationMove,
    onDecorationResize,
    onDecorationDelete,
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
    sectorId?: string;
    decorationId?: string;
    type: 'move' | 'resize';
    startX: number;
    startY: number;
    originalX: number;
    originalY: number;
    originalWidth: number;
    originalHeight: number;
    // Track current values during drag (for visual feedback)
    currentX: number;
    currentY: number;
    currentWidth: number;
    currentHeight: number;
  } | null>(null);

  let selectedSectorId = $state<string | null>(null);
  let selectedDecorationId = $state<string | null>(null);
  
  // Drag state for placing sectors/decorations
  let placingDrag = $state<{
    sectorId?: string;
    type?: string;
    decorationType?: string;
    isNew: boolean;
  } | null>(null);
  let dropPreview = $state<{ x: number; y: number } | null>(null);

  // Grid container reference for focus management
  let gridRef = $state<HTMLDivElement | null>(null);

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

  // Decoration type configurations (visual-only elements)
  const decorationConfig: Record<string, { color: string; bgColor: string; icon: string; label: string }> = {
    BUILDING: { color: '#64748b', bgColor: '#e2e8f0', icon: '🏫', label: 'Building' },
    PAVEMENT: { color: '#78716c', bgColor: '#d6d3d1', icon: '👣', label: 'Path' },
    PARKING: { color: '#525252', bgColor: '#d4d4d4', icon: '🅿️', label: 'Parking' },
    FENCE: { color: '#92400e', bgColor: '#fef3c7', icon: '🚧', label: 'Fence' },
    ENTRANCE: { color: '#0891b2', bgColor: '#cffafe', icon: '🚪', label: 'Entrance' },
    BENCH: { color: '#a16207', bgColor: '#fef9c3', icon: '🪑', label: 'Bench' },
    TRASH_BIN: { color: '#166534', bgColor: '#dcfce7', icon: '🗑️', label: 'Trash Bin' },
    BIKE_RACK: { color: '#1d4ed8', bgColor: '#dbeafe', icon: '🚲', label: 'Bike Rack' },
  };

  function getConfig(type: string) {
    return sectorConfig[type?.toUpperCase()] || sectorConfig.OTHER;
  }

  function getDecorationConfig(type: string) {
    return decorationConfig[type?.toUpperCase()] || decorationConfig.BUILDING;
  }

  // Check if two rectangles touch on any edge and return the overlap range
  function getEdgeOverlaps(
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number }
  ): { 
    top: { start: number; end: number } | null;
    right: { start: number; end: number } | null;
    bottom: { start: number; end: number } | null;
    left: { start: number; end: number } | null;
  } {
    const result = { top: null as any, right: null as any, bottom: null as any, left: null as any };
    
    // Top: b is directly above a
    if (b.y + b.h === a.y) {
      const overlapStart = Math.max(a.x, b.x);
      const overlapEnd = Math.min(a.x + a.w, b.x + b.w);
      if (overlapStart < overlapEnd) {
        result.top = { start: overlapStart - a.x, end: overlapEnd - a.x };
      }
    }
    // Bottom: b is directly below a
    if (a.y + a.h === b.y) {
      const overlapStart = Math.max(a.x, b.x);
      const overlapEnd = Math.min(a.x + a.w, b.x + b.w);
      if (overlapStart < overlapEnd) {
        result.bottom = { start: overlapStart - a.x, end: overlapEnd - a.x };
      }
    }
    // Left: b is directly to the left of a
    if (b.x + b.w === a.x) {
      const overlapStart = Math.max(a.y, b.y);
      const overlapEnd = Math.min(a.y + a.h, b.y + b.h);
      if (overlapStart < overlapEnd) {
        result.left = { start: overlapStart - a.y, end: overlapEnd - a.y };
      }
    }
    // Right: b is directly to the right of a
    if (a.x + a.w === b.x) {
      const overlapStart = Math.max(a.y, b.y);
      const overlapEnd = Math.min(a.y + a.h, b.y + b.h);
      if (overlapStart < overlapEnd) {
        result.right = { start: overlapStart - a.y, end: overlapEnd - a.y };
      }
    }
    
    return result;
  }

  // Get all border overlaps for a decoration, including corner overlaps
  function getDecorationOverlaps(decoration: MapDecoration, allDecorations: MapDecoration[]): {
    top: Array<{ start: number; end: number }>;
    right: Array<{ start: number; end: number }>;
    bottom: Array<{ start: number; end: number }>;
    left: Array<{ start: number; end: number }>;
    corners: { topLeft: boolean; topRight: boolean; bottomLeft: boolean; bottomRight: boolean };
  } {
    const overlaps = { 
      top: [] as Array<{ start: number; end: number }>,
      right: [] as Array<{ start: number; end: number }>,
      bottom: [] as Array<{ start: number; end: number }>,
      left: [] as Array<{ start: number; end: number }>,
      corners: { topLeft: false, topRight: false, bottomLeft: false, bottomRight: false }
    };
    
    const currentRect = {
      x: decoration.gridX,
      y: decoration.gridY,
      w: decoration.gridWidth,
      h: decoration.gridHeight
    };
    
    // Track which edges have overlaps at their endpoints
    let topStartCovered = false, topEndCovered = false;
    let bottomStartCovered = false, bottomEndCovered = false;
    let leftStartCovered = false, leftEndCovered = false;
    let rightStartCovered = false, rightEndCovered = false;
    
    for (const other of allDecorations) {
      if (other.id === decoration.id) continue;
      if (other.type !== decoration.type) continue;
      
      const otherRect = {
        x: other.gridX,
        y: other.gridY,
        w: other.gridWidth,
        h: other.gridHeight
      };
      
      const edges = getEdgeOverlaps(currentRect, otherRect);
      if (edges.top) {
        overlaps.top.push(edges.top);
        if (edges.top.start === 0) topStartCovered = true;
        if (edges.top.end === currentRect.w) topEndCovered = true;
      }
      if (edges.right) {
        overlaps.right.push(edges.right);
        if (edges.right.start === 0) rightStartCovered = true;
        if (edges.right.end === currentRect.h) rightEndCovered = true;
      }
      if (edges.bottom) {
        overlaps.bottom.push(edges.bottom);
        if (edges.bottom.start === 0) bottomStartCovered = true;
        if (edges.bottom.end === currentRect.w) bottomEndCovered = true;
      }
      if (edges.left) {
        overlaps.left.push(edges.left);
        if (edges.left.start === 0) leftStartCovered = true;
        if (edges.left.end === currentRect.h) leftEndCovered = true;
      }
    }
    
    // Determine corner overlaps - corners need filling when two perpendicular edges are covered at that corner
    // Top-left corner: top edge starts at 0 AND left edge starts at 0
    overlaps.corners.topLeft = topStartCovered && leftStartCovered;
    // Top-right corner: top edge ends at width AND right edge starts at 0
    overlaps.corners.topRight = topEndCovered && rightStartCovered;
    // Bottom-left corner: bottom edge starts at 0 AND left edge ends at height
    overlaps.corners.bottomLeft = bottomStartCovered && leftEndCovered;
    // Bottom-right corner: bottom edge ends at width AND right edge ends at height
    overlaps.corners.bottomRight = bottomEndCovered && rightEndCovered;
    
    return overlaps;
  }

  // Check if entire edge is covered (for border-radius decisions)
  function isEdgeFullyCovered(overlaps: Array<{ start: number; end: number }>, edgeLength: number): boolean {
    if (overlaps.length === 0) return false;
    // Merge overlapping ranges and check if they cover 0 to edgeLength
    const sorted = [...overlaps].sort((a, b) => a.start - b.start);
    let covered = 0;
    for (const range of sorted) {
      if (range.start <= covered) {
        covered = Math.max(covered, range.end);
      }
    }
    return covered >= edgeLength;
  }

  // Calculate visible segments for an edge by subtracting overlaps from the full length
  function getUncoveredSegments(totalLength: number, overlaps: Array<{ start: number; end: number }>): Array<{ start: number; end: number }> {
    // 1. Sort overlaps by start
    const sorted = [...overlaps].sort((a, b) => a.start - b.start);
    
    // 2. Merge overlapping intervals
    const merged: Array<{ start: number; end: number }> = [];
    if (sorted.length > 0) {
      let current = sorted[0];
      for (let i = 1; i < sorted.length; i++) {
        const next = sorted[i];
        if (next.start <= current.end) {
          current.end = Math.max(current.end, next.end);
        } else {
          merged.push(current);
          current = next;
        }
      }
      merged.push(current);
    }
    
    // 3. Compute gaps (uncovered segments)
    const result: Array<{ start: number; end: number }> = [];
    let currentPos = 0;
    
    for (const overlap of merged) {
      if (overlap.start > currentPos) {
        result.push({ start: currentPos, end: overlap.start });
      }
      currentPos = Math.max(currentPos, overlap.end);
    }
    
    if (currentPos < totalLength) {
      result.push({ start: currentPos, end: totalLength });
    }
    
    return result;
  }

  // Palette tab state
  let paletteTab = $state<'sectors' | 'decorations'>('sectors');

  // Drag handlers for moving/resizing placed sectors
  function handleMouseDown(e: MouseEvent, sector: MapSector, type: 'move' | 'resize') {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();

    selectedSectorId = sector.id;
    selectedDecorationId = null;
    dragState = {
      sectorId: sector.id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      originalX: sector.gridX,
      originalY: sector.gridY,
      originalWidth: sector.gridWidth,
      originalHeight: sector.gridHeight,
      currentX: sector.gridX,
      currentY: sector.gridY,
      currentWidth: sector.gridWidth,
      currentHeight: sector.gridHeight,
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  // Drag handlers for decorations
  function handleDecorationMouseDown(e: MouseEvent, decoration: MapDecoration, type: 'move' | 'resize') {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();

    selectedDecorationId = decoration.id;
    selectedSectorId = null;
    dragState = {
      decorationId: decoration.id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      originalX: decoration.gridX,
      originalY: decoration.gridY,
      originalWidth: decoration.gridWidth,
      originalHeight: decoration.gridHeight,
      currentX: decoration.gridX,
      currentY: decoration.gridY,
      currentWidth: decoration.gridWidth,
      currentHeight: decoration.gridHeight,
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragState) return;

    const deltaX = Math.round((e.clientX - dragState.startX) / CELL_SIZE);
    const deltaY = Math.round((e.clientY - dragState.startY) / CELL_SIZE);

    if (dragState.type === 'move') {
      const newX = Math.max(0, Math.min(mapWidth - dragState.originalWidth, dragState.originalX + deltaX));
      const newY = Math.max(0, Math.min(mapHeight - dragState.originalHeight, dragState.originalY + deltaY));
      // Update local drag state for visual feedback only - no API call
      dragState.currentX = newX;
      dragState.currentY = newY;
    } else if (dragState.type === 'resize') {
      // No arbitrary size limits - only constrained by map boundaries
      const newWidth = Math.max(1, Math.min(mapWidth - dragState.originalX, dragState.originalWidth + deltaX));
      const newHeight = Math.max(1, Math.min(mapHeight - dragState.originalY, dragState.originalHeight + deltaY));
      // Update local drag state for visual feedback only - no API call
      dragState.currentWidth = newWidth;
      dragState.currentHeight = newHeight;
    }
  }

  function handleMouseUp() {
    if (dragState) {
      // Only call API when drag is complete
      if (dragState.type === 'move') {
        if (dragState.currentX !== dragState.originalX || dragState.currentY !== dragState.originalY) {
          if (dragState.sectorId) {
            onSectorMove?.(dragState.sectorId, dragState.currentX, dragState.currentY);
          } else if (dragState.decorationId) {
            onDecorationMove?.(dragState.decorationId, dragState.currentX, dragState.currentY);
          }
        }
      } else if (dragState.type === 'resize') {
        if (dragState.currentWidth !== dragState.originalWidth || dragState.currentHeight !== dragState.originalHeight) {
          if (dragState.sectorId) {
            onSectorResize?.(dragState.sectorId, dragState.currentWidth, dragState.currentHeight);
          } else if (dragState.decorationId) {
            onDecorationResize?.(dragState.decorationId, dragState.currentWidth, dragState.currentHeight);
          }
        }
      }
    }
    dragState = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  function handleSectorClick(e: MouseEvent, sector: MapSector) {
    e.stopPropagation();
    selectedSectorId = sector.id;
    selectedDecorationId = null;
    onSectorClick?.(sector);
    
    // Focus the grid container to enable keyboard events
    if (editable) {
      gridRef?.focus();
    }
  }

  function handleDecorationClick(e: MouseEvent, decoration: MapDecoration) {
    e.stopPropagation();
    selectedDecorationId = decoration.id;
    selectedSectorId = null;
    
    // Focus the grid container to enable keyboard events
    if (editable) {
      gridRef?.focus();
    }
  }

  function handleSectorDoubleClick(e: MouseEvent, sector: MapSector) {
    if (!editable) return;
    e.stopPropagation();
    e.preventDefault();
    
    // Emit edit event to parent component
    onSectorEdit?.(sector);
  }

  function handleGridClick() {
    if (editable) {
      selectedSectorId = null;
      selectedDecorationId = null;
    }
  }

  // Keyboard event handler for the entire map
  function handleMapKeydown(e: KeyboardEvent) {
    if (!editable) return;
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (selectedSectorId) {
        const sector = placedSectors.find(s => s.id === selectedSectorId);
        if (sector) {
          handleRemoveSectorFromMap(sector);
        }
      } else if (selectedDecorationId) {
        handleDeleteDecoration(selectedDecorationId);
      }
    }
  }

  function handleDeleteDecoration(decorationId: string) {
    const decoration = decorations.find(d => d.id === decorationId);
    const confirmed = confirm(`Delete this ${getDecorationConfig(decoration?.type || '').label}?`);
    if (confirmed) {
      onDecorationDelete?.(decorationId);
      selectedDecorationId = null;
    }
  }

  function handleRemoveSectorFromMap(sector: MapSector) {
    const confirmed = confirm(`Remove "${sector.name}" from the map?\n\nThe sector will be moved back to the palette and can be placed again later.`);
    if (confirmed) {
      onSectorRemoveFromMap?.(sector.id);
      selectedSectorId = null;
    }
  }

  // Drag handlers for placing sectors from palette
  function handlePaletteDragStart(e: DragEvent, sectorId?: string, type?: string, decorationType?: string) {
    if (!e.dataTransfer) return;
    e.dataTransfer.setData('application/json', JSON.stringify({ sectorId, type, decorationType }));
    e.dataTransfer.effectAllowed = 'move';
    placingDrag = { sectorId, type, decorationType, isNew: !sectorId };
  }

  function handleGridDragOver(e: DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer) return;
    e.dataTransfer.dropEffect = 'move';
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    const clampedX = Math.max(0, Math.min(mapWidth - 2, x));
    const clampedY = Math.max(0, Math.min(mapHeight - 2, y));
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
      } else if (data.decorationType) {
        // Creating a new decoration
        onAddDecoration?.(data.decorationType, dropPreview.x, dropPreview.y);
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
  <!-- Unplaced Sectors Palette (only show when there are unplaced sectors) -->
  {#if editable && unplacedSectors.length > 0}
    <div class="mb-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-slate-700">
          Unplaced Sectors ({unplacedSectors.length})
        </h4>
        <p class="text-xs text-slate-400">Drag to place on map</p>
      </div>
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
  {/if}

  <!-- Add Elements Palette (edit mode only) -->
  {#if editable}
    <div class="mb-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <!-- Tab Headers -->
      <div class="flex border-b border-slate-200">
        <button
          class="flex-1 px-4 py-3 text-sm font-semibold transition-colors relative"
          class:bg-emerald-50={paletteTab === 'sectors'}
          class:text-emerald-700={paletteTab === 'sectors'}
          class:text-slate-500={paletteTab !== 'sectors'}
          class:hover:bg-slate-50={paletteTab !== 'sectors'}
          onclick={() => paletteTab = 'sectors'}
        >
          <span class="flex items-center justify-center gap-2">
            🌳 Add Sectors
          </span>
          {#if paletteTab === 'sectors'}
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
          {/if}
        </button>
        <button
          class="flex-1 px-4 py-3 text-sm font-semibold transition-colors relative"
          class:bg-slate-100={paletteTab === 'decorations'}
          class:text-slate-700={paletteTab === 'decorations'}
          class:text-slate-500={paletteTab !== 'decorations'}
          class:hover:bg-slate-50={paletteTab !== 'decorations'}
          onclick={() => paletteTab = 'decorations'}
        >
          <span class="flex items-center justify-center gap-2">
            🏫 Add Decorations
          </span>
          {#if paletteTab === 'decorations'}
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-500"></div>
          {/if}
        </button>
      </div>
      
      <!-- Tab Content -->
      <div class="p-4">
        <p class="text-xs text-slate-400 mb-3">Drag items to place on map</p>
        
        {#if paletteTab === 'sectors'}
          <div class="flex flex-wrap gap-2">
            {#each Object.entries(sectorConfig) as [type, config]}
              <div
                draggable="true"
                ondragstart={(e) => handlePaletteDragStart(e, undefined, type)}
                class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-2 hover:scale-105"
                style="background-color: {config.bgColor}; border-color: {config.color};"
                role="button"
                tabindex="0"
              >
              <span class="text-xl">{config.icon}</span>
              <span class="text-sm font-semibold" style="color: {config.color};">{config.label}</span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="flex flex-wrap gap-2">
          {#each Object.entries(decorationConfig) as [type, config]}
            <div
              draggable="true"
              ondragstart={(e) => handlePaletteDragStart(e, undefined, undefined, type)}
              class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-2 hover:scale-105"
              style="background-color: {config.bgColor}; border-color: {config.color};"
              role="button"
              tabindex="0"
            >
              <span class="text-xl">{config.icon}</span>
              <span class="text-sm font-semibold" style="color: {config.color};">{config.label}</span>
            </div>
          {/each}
        </div>
      {/if}
      </div>
    </div>
  {/if}
  
  <!-- Edit Controls & Hints -->
  {#if editable}
    <div class="mb-2 flex items-center justify-between gap-4 text-xs text-slate-500">
      <!-- Editing hints -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-1">
          <span class="text-[10px]">✋</span>
          <span>Drag to move</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
            <svg class="w-1.5 h-1.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 20h16M20 4v16" />
            </svg>
          </span>
          <span>Resize</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-[10px]">🖱️</span>
          <span>Double-click to edit</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-[10px]">⌫</span>
          <span>Delete to remove</span>
        </div>
      </div>
      
      <!-- Grid size controls -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <span>Map size:</span>
        <input
          type="number"
          min="5"
          max="30"
          value={mapWidth}
          onchange={(e) => onMapResize?.(Math.max(5, parseInt(e.currentTarget.value) || 5), mapHeight)}
          class="w-12 px-1.5 py-0.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-center"
        />
        <span>×</span>
        <input
          type="number"
          min="5"
          max="30"
          value={mapHeight}
          onchange={(e) => onMapResize?.(mapWidth, Math.max(5, parseInt(e.currentTarget.value) || 5))}
          class="w-12 px-1.5 py-0.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-center"
        />
      </div>
    </div>
  {/if}

  <!-- Grid Container with Scale -->
  <div class="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-inner overflow-hidden flex justify-center">
    <div class="relative inline-block" style="padding: 24px 16px 16px 28px;">
      <!-- Top Scale (X-axis) -->
      <div class="absolute top-1 left-7 right-4 flex" style="height: 20px;">
        {#each Array(Math.floor(mapWidth / 2) + 1) as _, i}
          <div 
            class="absolute flex flex-col items-center"
            style="left: {i * 2 * CELL_SIZE}px; transform: translateX(-50%);"
          >
            <span class="text-[10px] text-slate-400 font-medium">{i}m</span>
            <div class="w-px h-1.5 bg-slate-300"></div>
          </div>
        {/each}
      </div>

      <!-- Left Scale (Y-axis) -->
      <div class="absolute top-6 left-0 bottom-4 flex flex-col" style="width: 24px;">
        {#each Array(Math.floor(mapHeight / 2) + 1) as _, i}
          <div 
            class="absolute flex items-center gap-0.5"
            style="top: {i * 2 * CELL_SIZE}px; transform: translateY(-50%); right: 0;"
          >
            <span class="text-[10px] text-slate-400 font-medium">{i}m</span>
            <div class="h-px w-1.5 bg-slate-300"></div>
          </div>
        {/each}
      </div>

      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions a11y_no_noninteractive_tabindex -->
      <div
        bind:this={gridRef}
        class="relative"
        style="width: {mapWidth * CELL_SIZE}px; height: {mapHeight * CELL_SIZE}px;"
        onclick={handleGridClick}
        onkeydown={editable ? handleMapKeydown : undefined}
        ondragover={editable ? handleGridDragOver : undefined}
        ondragleave={editable ? handleGridDragLeave : undefined}
        ondrop={editable ? handleGridDrop : undefined}
        role="application"
        aria-label="Schoolyard map"
        tabindex={editable ? 0 : -1}
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
        
        <!-- Major grid lines (every 2 cells = 1 meter) -->
        <div 
          class="absolute inset-0 rounded-xl pointer-events-none"
          style="
            background-image: 
              linear-gradient(to right, rgba(0,0,0,0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.12) 1px, transparent 1px);
            background-size: {CELL_SIZE * 2}px {CELL_SIZE * 2}px;
          "
        ></div>

      <!-- Drop Preview -->
      {#if dropPreview && placingDrag}
        {@const currentDrag = placingDrag}
        {@const config = currentDrag.decorationType 
          ? getDecorationConfig(currentDrag.decorationType)
          : currentDrag.sectorId 
            ? getConfig(unplacedSectors.find(s => s.id === currentDrag.sectorId)?.type || 'OTHER')
            : getConfig(currentDrag.type || 'OTHER')}
        <div
          class="absolute rounded-xl border-2 border-dashed pointer-events-none animate-pulse z-30"
          style="
            left: {dropPreview.x * CELL_SIZE}px;
            top: {dropPreview.y * CELL_SIZE}px;
            width: {2 * CELL_SIZE}px;
            height: {2 * CELL_SIZE}px;
            background-color: {config.bgColor}80;
            border-color: {config.color};
          "
        >
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-2xl opacity-60">{config.icon}</span>
          </div>
        </div>
      {/if}

      <!-- Decorations (rendered below sectors) -->
      {#each decorations as decoration (decoration.id)}
        {@const config = getDecorationConfig(decoration.type)}
        {@const isSelected = selectedDecorationId === decoration.id}
        {@const isDragging = dragState?.decorationId === decoration.id}
        {@const displayX = isDragging ? dragState!.currentX : decoration.gridX}
        {@const displayY = isDragging ? dragState!.currentY : decoration.gridY}
        {@const displayWidth = isDragging ? dragState!.currentWidth : decoration.gridWidth}
        {@const displayHeight = isDragging ? dragState!.currentHeight : decoration.gridHeight}
        
        {@const overlaps = getDecorationOverlaps(decoration, decorations)}
        
        <!-- Calculate visible border segments -->
        {@const visibleTop = getUncoveredSegments(displayWidth, overlaps.top)}
        {@const visibleBottom = getUncoveredSegments(displayWidth, overlaps.bottom)}
        {@const visibleLeft = getUncoveredSegments(displayHeight, overlaps.left)}
        {@const visibleRight = getUncoveredSegments(displayHeight, overlaps.right)}
        
        <!-- Determine rounded corners -->
        <!-- A corner is rounded ONLY if it's a visible endpoint of both adjacent edges -->
        <!-- Top-Left: Top starts at 0 AND Left starts at 0 -->
        {@const roundTL = visibleTop.some(s => s.start === 0) && visibleLeft.some(s => s.start === 0)}
        <!-- Top-Right: Top ends at width AND Right starts at 0 -->
        {@const roundTR = visibleTop.some(s => s.end === displayWidth) && visibleRight.some(s => s.start === 0)}
        <!-- Bottom-Left: Bottom starts at 0 AND Left ends at height -->
        {@const roundBL = visibleBottom.some(s => s.start === 0) && visibleLeft.some(s => s.end === displayHeight)}
        <!-- Bottom-Right: Bottom ends at width AND Right ends at height -->
        {@const roundBR = visibleBottom.some(s => s.end === displayWidth) && visibleRight.some(s => s.end === displayHeight)}

        <div
          class="absolute transition-all group"
          class:duration-100={!isDragging}
          class:duration-0={isDragging}
          class:cursor-grab={editable && !isDragging}
          class:cursor-grabbing={isDragging}
          class:ring-2={isSelected}
          class:ring-slate-400={isSelected}
          class:shadow-lg={isSelected || isDragging}
          class:z-15={isSelected || isDragging}
          class:z-5={!isSelected && !isDragging}
          style="
            box-sizing: border-box;
            left: {displayX * CELL_SIZE}px;
            top: {displayY * CELL_SIZE}px;
            width: {displayWidth * CELL_SIZE}px;
            height: {displayHeight * CELL_SIZE}px;
            background: {config.bgColor};
            border-top-left-radius: {roundTL ? '8px' : '0'};
            border-top-right-radius: {roundTR ? '8px' : '0'};
            border-bottom-left-radius: {roundBL ? '8px' : '0'};
            border-bottom-right-radius: {roundBR ? '8px' : '0'};
          "
          onclick={(e) => handleDecorationClick(e, decoration)}
          onmousedown={(e) => editable && handleDecorationMouseDown(e, decoration, 'move')}
          role="button"
          tabindex="0"
          aria-label="{config.label} decoration"
        >
          <!-- Custom Borders -->
          
          <!-- Top Border Segments -->
          {#each visibleTop as segment}
            <div 
              class="absolute pointer-events-none"
              style="
                top: 0;
                left: {segment.start * CELL_SIZE}px;
                width: {(segment.end - segment.start) * CELL_SIZE}px;
                height: 2px;
                background: {config.color};
                border-top-left-radius: {segment.start === 0 && roundTL ? '8px' : '0'};
                border-top-right-radius: {segment.end === displayWidth && roundTR ? '8px' : '0'};
              "
            ></div>
          {/each}

          <!-- Bottom Border Segments -->
          {#each visibleBottom as segment}
            <div 
              class="absolute pointer-events-none"
              style="
                bottom: 0;
                left: {segment.start * CELL_SIZE}px;
                width: {(segment.end - segment.start) * CELL_SIZE}px;
                height: 2px;
                background: {config.color};
                border-bottom-left-radius: {segment.start === 0 && roundBL ? '8px' : '0'};
                border-bottom-right-radius: {segment.end === displayWidth && roundBR ? '8px' : '0'};
              "
            ></div>
          {/each}

          <!-- Left Border Segments -->
          {#each visibleLeft as segment}
            <div 
              class="absolute pointer-events-none"
              style="
                left: 0;
                top: {segment.start * CELL_SIZE}px;
                height: {(segment.end - segment.start) * CELL_SIZE}px;
                width: 2px;
                background: {config.color};
                border-top-left-radius: {segment.start === 0 && roundTL ? '8px' : '0'};
                border-bottom-left-radius: {segment.end === displayHeight && roundBL ? '8px' : '0'};
              "
            ></div>
          {/each}

          <!-- Right Border Segments -->
          {#each visibleRight as segment}
            <div 
              class="absolute pointer-events-none"
              style="
                right: 0;
                top: {segment.start * CELL_SIZE}px;
                height: {(segment.end - segment.start) * CELL_SIZE}px;
                width: 2px;
                background: {config.color};
                border-top-right-radius: {segment.start === 0 && roundTR ? '8px' : '0'};
                border-bottom-right-radius: {segment.end === displayHeight && roundBR ? '8px' : '0'};
              "
            ></div>
          {/each}

          <div class="absolute inset-0 flex flex-col items-center justify-center p-1 overflow-hidden">
            <div style="font-size: {Math.max(16, Math.min(28, displayHeight * CELL_SIZE / 3))}px;">
              {config.icon}
            </div>
            {#if decoration.label || displayWidth >= 3}
              <div class="text-center leading-tight px-1 truncate w-full font-medium"
                style="color: {config.color}; font-size: {Math.max(8, Math.min(11, displayWidth * CELL_SIZE / 10))}px;">
                {decoration.label || config.label}
              </div>
            {/if}
          </div>

          {#if editable && isSelected}
            <div
              class="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-slate-500 rounded-full cursor-se-resize flex items-center justify-center shadow-lg border-2 border-white hover:bg-slate-600 z-30"
              onmousedown={(e) => { e.stopPropagation(); handleDecorationMouseDown(e, decoration, 'resize'); }}
              role="button"
              aria-label="Resize"
              tabindex="0"
            >
              <svg class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 20h16M20 4v16" />
              </svg>
            </div>
          {/if}
        </div>
      {/each}

      <!-- Placed Sectors -->
      {#each placedSectors as sector (sector.id)}
        {@const config = getConfig(sector.type)}
        {@const isSelected = selectedSectorId === sector.id}
        {@const isDragging = dragState?.sectorId === sector.id}
        {@const displayX = isDragging ? dragState!.currentX : sector.gridX}
        {@const displayY = isDragging ? dragState!.currentY : sector.gridY}
        {@const displayWidth = isDragging ? dragState!.currentWidth : sector.gridWidth}
        {@const displayHeight = isDragging ? dragState!.currentHeight : sector.gridHeight}
        <div
          class="absolute rounded-xl transition-all group"
          class:duration-100={!isDragging}
          class:duration-0={isDragging}
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
            left: {displayX * CELL_SIZE}px;
            top: {displayY * CELL_SIZE}px;
            width: {displayWidth * CELL_SIZE}px;
            height: {displayHeight * CELL_SIZE}px;
            background: linear-gradient(145deg, {config.bgColor} 0%, white 100%);
            border: 3px solid {config.color};
          "
          onclick={(e) => handleSectorClick(e, sector)}
          ondblclick={(e) => handleSectorDoubleClick(e, sector)}
          onmousedown={(e) => editable && handleMouseDown(e, sector, 'move')}
          onkeydown={(e) => e.key === 'Enter' && handleSectorClick(e as any, sector)}
          role="button"
          tabindex="0"
          aria-label="{sector.name} sector"
        >
          <div class="absolute inset-0 flex flex-col items-center justify-center p-1 overflow-hidden">
            <div class="transition-transform" class:scale-110={isSelected}
              style="font-size: {Math.max(24, Math.min(40, displayHeight * CELL_SIZE / 3))}px;">
              {config.icon}
            </div>
            <div class="font-bold text-center leading-tight px-1 truncate w-full"
              style="color: {config.color}; font-size: {Math.max(10, Math.min(14, displayWidth * CELL_SIZE / 8))}px;">
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
      {#if placedSectors.length === 0 && decorations.length === 0}
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="text-center p-6 bg-white/70 rounded-2xl backdrop-blur-sm">
            <div class="text-4xl mb-2">🗺️</div>
            <p class="text-slate-600 font-medium text-sm">
              {editable ? 'Drag sectors or decorations to build your map' : 'No elements placed on map yet'}
            </p>
          </div>
        </div>
      {/if}
      </div>
    </div>
  </div>

  <!-- Scale Legend -->
  <div class="mt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
    <div class="flex items-center gap-1">
      <div class="w-4 h-px bg-slate-300"></div>
      <div class="w-4 h-px bg-slate-300"></div>
    </div>
    <span>2 cells = 1 meter</span>
  </div>




</div>

<style>
  .map-builder {
    user-select: none;
  }
</style>