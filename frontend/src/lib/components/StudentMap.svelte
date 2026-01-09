<script lang="ts">
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
    cooldownStatus?: {
      available: boolean;
      reason: string | null;
      hoursRemaining: number | null;
    };
    missionStatus?: 'available' | 'my_active' | 'taken' | 'cooldown' | 'max_reached';
    myPendingSubmissionId?: string | null;
    takenBy?: { firstName: string; lastName: string } | null;

    isUrgent?: boolean;
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
    color?: string;
  }

  interface MapDecoration {
    id: string;
    classId: string;
    type: string;
    gridX: number;
    gridY: number;
    gridWidth: number;
    gridHeight: number;
  }

  interface Props {
    sectors: Sector[];
    decorations?: MapDecoration[];
    mapWidth?: number;
    mapHeight?: number;
    onSectorClick?: (sector: Sector) => void;
    onMissionClick?: (mission: Mission, sector: Sector) => void;
  }

  let {
    sectors = [],
    decorations = [],
    mapWidth = 20,
    mapHeight = 16,
    onSectorClick,
    onMissionClick,
  }: Props = $props();

  // Only show placed sectors
  let placedSectors = $derived(sectors.filter((s) => s.gridX >= 0 && s.gridY >= 0));
  let totalMissions = $derived(
    placedSectors.reduce((sum, s) => sum + (s.missions?.length || 0), 0)
  );

  // Count active missions (my_active status)
  let myActiveMissions = $derived(
    placedSectors.reduce(
      (sum, s) => sum + (s.missions?.filter((m) => m.missionStatus === 'my_active').length || 0),
      0
    )
  );

  // Count urgent available missions
  let urgentMissionsCount = $derived(
    placedSectors.reduce(
      (sum, s) =>
        sum +
        (s.missions?.filter((m) => m.isUrgent && m.missionStatus === 'available').length || 0),
      0
    )
  );

  // Count cooldown missions
  let myCooldownMissions = $derived(
    placedSectors.reduce(
      (sum, s) => sum + (s.missions?.filter((m) => m.missionStatus === 'cooldown').length || 0),
      0
    )
  );

  // Count taken missions
  let myTakenMissions = $derived(
    placedSectors.reduce(
      (sum, s) => sum + (s.missions?.filter((m) => m.missionStatus === 'taken').length || 0),
      0
    )
  );

  // Responsive cell size
  let containerRef = $state<HTMLDivElement | null>(null);
  let containerWidth = $state(800);
  let CELL_SIZE = $derived(
    Math.max(32, Math.min(45, Math.floor((containerWidth - 32) / mapWidth)))
  );

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
  const sectorConfig: Record<
    string,
    { color: string; gradientFrom: string; gradientTo: string; icon: string; shadowColor: string }
  > = {
    TREES: {
      color: '#15803d',
      gradientFrom: '#dcfce7',
      gradientTo: '#86efac',
      icon: '🌳',
      shadowColor: 'rgba(22, 163, 74, 0.4)',
    },
    FLOWERS: {
      color: '#be185d',
      gradientFrom: '#fce7f3',
      gradientTo: '#f9a8d4',
      icon: '🌸',
      shadowColor: 'rgba(219, 39, 119, 0.4)',
    },
    POND: {
      color: '#1d4ed8',
      gradientFrom: '#dbeafe',
      gradientTo: '#93c5fd',
      icon: '🦆',
      shadowColor: 'rgba(37, 99, 235, 0.4)',
    },
    ANIMALS: {
      color: '#b45309',
      gradientFrom: '#fef3c7',
      gradientTo: '#fcd34d',
      icon: '🐾',
      shadowColor: 'rgba(217, 119, 6, 0.4)',
    },
    GARDEN: {
      color: '#c2410c',
      gradientFrom: '#ffedd5',
      gradientTo: '#fdba74',
      icon: '🥕',
      shadowColor: 'rgba(234, 88, 12, 0.4)',
    },
    PLAYGROUND: {
      color: '#7c3aed',
      gradientFrom: '#f3e8ff',
      gradientTo: '#c4b5fd',
      icon: '🎪',
      shadowColor: 'rgba(147, 51, 234, 0.4)',
    },
    COMPOST: {
      color: '#4d7c0f',
      gradientFrom: '#ecfccb',
      gradientTo: '#bef264',
      icon: '♻️',
      shadowColor: 'rgba(101, 163, 13, 0.4)',
    },
    OTHER: {
      color: '#475569',
      gradientFrom: '#f1f5f9',
      gradientTo: '#cbd5e1',
      icon: '📍',
      shadowColor: 'rgba(71, 85, 105, 0.4)',
    },
    CHICKENS: {
      color: '#b45309',
      gradientFrom: '#fef3c7',
      gradientTo: '#fcd34d',
      icon: '🐔',
      shadowColor: 'rgba(217, 119, 6, 0.4)',
    },
  };

  function getConfig(type: string) {
    return sectorConfig[type?.toUpperCase()] || sectorConfig.OTHER;
  }

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
    
    // Determine corner overlaps
    overlaps.corners.topLeft = topStartCovered && leftStartCovered;
    overlaps.corners.topRight = topEndCovered && rightStartCovered;
    overlaps.corners.bottomLeft = bottomStartCovered && leftEndCovered;
    overlaps.corners.bottomRight = bottomEndCovered && rightEndCovered;
    
    return overlaps;
  }

  // Calculate visible segments for an edge by subtracting overlaps from the full length
  function getUncoveredSegments(totalLength: number, overlaps: Array<{ start: number; end: number }>): Array<{ start: number; end: number }> {
    const sorted = [...overlaps].sort((a, b) => a.start - b.start);
    
    const merged: Array<{ start: number; end: number }> = [];
    if (sorted.length > 0) {
      let current = { ...sorted[0] };
      for (let i = 1; i < sorted.length; i++) {
        const next = sorted[i];
        if (next.start <= current.end) {
          current.end = Math.max(current.end, next.end);
        } else {
          merged.push(current);
          current = { ...next };
        }
      }
      merged.push(current);
    }
    
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

  function handleSectorClick(sector: Sector) {
    selectedSector = sector;
    onSectorClick?.(sector);
  }

  function handleMissionClick(mission: Mission, sector: Sector) {
    onMissionClick?.(mission, sector);
  }

  function closeSectorPanel() {
    selectedSector = null;
  }

  // Sort missions: my_active first, then available, then taken, then cooldown/max_reached
  function sortMissions(missions: Mission[]): Mission[] {
    const statusOrder: Record<string, number> = {
      my_active: 0,
      available: 1,
      taken: 2,
      cooldown: 3,
      max_reached: 4,
    };
    return [...missions].sort((a, b) => {
      const orderA = statusOrder[a.missionStatus || 'available'] ?? 5;
      const orderB = statusOrder[b.missionStatus || 'available'] ?? 5;

      // Secondary sort: Urgent first (inside the list view)
      if (orderA === orderB) {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
      }

      return orderA - orderB;
    });
  }

  // Get status badge for mission
  function getMissionStatusBadge(
    mission: Mission
  ): { text: string; bgColor: string; textColor: string } | null {
    switch (mission.missionStatus) {
      case 'my_active':
        return {
          text: '📋 Your active mission',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
        };
      case 'taken':
        return {
          text: `🔒 Taken by ${mission.takenBy?.firstName || 'someone'}`,
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
        };
      case 'cooldown':
        return {
          text: `⏱️ Cooldown: ${mission.cooldownStatus?.hoursRemaining}h left`,
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-600',
        };
      case 'max_reached':
        return {
          text: '✅ Completed (max reached)',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
        };
      default:
        if (mission.isUrgent) {
          return { text: '🚨 Urgent Request', bgColor: 'bg-red-100', textColor: 'text-red-700' };
        }
        return null;
    }
  }
</script>

<div class="student-map" bind:this={containerRef}>
  <div class="mb-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span class="text-3xl">🗺️</span> Schoolyard Map
        </h2>
        <p class="text-slate-500 text-sm mt-0.5">Tap on an area to discover missions!</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        {#if urgentMissionsCount > 0}
          <div
            class="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold animate-pulse shadow-sm border border-red-200"
          >
            🚨 {urgentMissionsCount} Urgent
          </div>
        {/if}
        {#if myActiveMissions > 0}
          <div class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            📋 {myActiveMissions} active
          </div>
        {/if}
        <div class="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
          📍 {placedSectors.length} area{placedSectors.length !== 1 ? 's' : ''}
        </div>
        <div class="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
          🎯 {totalMissions - (myActiveMissions + myCooldownMissions + myTakenMissions)} mission{totalMissions !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  </div>

  <div class="map-container rounded-2xl shadow-xl border-4 border-white/50 overflow-hidden">
    <div class="relative bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-200">
      <div class="relative p-4 sm:p-5 flex justify-center">
        <div class="map-grid-wrapper" style="padding: 8px;">
          <div
            class="relative rounded-xl"
            style="width: {mapWidth * CELL_SIZE}px; height: {mapHeight * CELL_SIZE}px;"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-green-300 via-emerald-300 to-green-400 rounded-xl"
            ></div>
            <div
              class="absolute inset-0 opacity-20 rounded-xl"
              style="background-image: radial-gradient(circle at 2px 2px, rgba(0,100,0,0.3) 1px, transparent 1px); background-size: 12px 12px;"
            ></div>

            <!-- Decorations (rendered below sectors) -->
            {#each decorations as decoration (decoration.id)}
              {@const config = getDecorationConfig(decoration.type)}
              {@const overlaps = getDecorationOverlaps(decoration, decorations)}
              {@const visibleTop = getUncoveredSegments(decoration.gridWidth, overlaps.top)}
              {@const visibleBottom = getUncoveredSegments(decoration.gridWidth, overlaps.bottom)}
              {@const visibleLeft = getUncoveredSegments(decoration.gridHeight, overlaps.left)}
              {@const visibleRight = getUncoveredSegments(decoration.gridHeight, overlaps.right)}
              {@const roundTL = visibleTop.some(s => s.start === 0) && visibleLeft.some(s => s.start === 0)}
              {@const roundTR = visibleTop.some(s => s.end === decoration.gridWidth) && visibleRight.some(s => s.start === 0)}
              {@const roundBL = visibleBottom.some(s => s.start === 0) && visibleLeft.some(s => s.end === decoration.gridHeight)}
              {@const roundBR = visibleBottom.some(s => s.end === decoration.gridWidth) && visibleRight.some(s => s.end === decoration.gridHeight)}
              <div
                class="absolute"
                style="
                  left: {decoration.gridX * CELL_SIZE}px;
                  top: {decoration.gridY * CELL_SIZE}px;
                  width: {decoration.gridWidth * CELL_SIZE}px;
                  height: {decoration.gridHeight * CELL_SIZE}px;
                  background: {config.bgColor};
                  border-top-left-radius: {roundTL ? '8px' : '0'};
                  border-top-right-radius: {roundTR ? '8px' : '0'};
                  border-bottom-left-radius: {roundBL ? '8px' : '0'};
                  border-bottom-right-radius: {roundBR ? '8px' : '0'};
                  z-index: 5;
                "
                aria-label="{config.label}"
              >
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
                      border-top-right-radius: {segment.end === decoration.gridWidth && roundTR ? '8px' : '0'};
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
                      border-bottom-right-radius: {segment.end === decoration.gridWidth && roundBR ? '8px' : '0'};
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
                      border-bottom-left-radius: {segment.end === decoration.gridHeight && roundBL ? '8px' : '0'};
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
                      border-bottom-right-radius: {segment.end === decoration.gridHeight && roundBR ? '8px' : '0'};
                    "
                  ></div>
                {/each}

                <!-- Icon and Label -->
                <div class="absolute inset-0 flex flex-col items-center justify-center p-1 overflow-hidden pointer-events-none">
                  <div class="opacity-60" style="font-size: {Math.max(16, Math.min(28, decoration.gridHeight * CELL_SIZE / 3))}px;">
                    {config.icon}
                  </div>
                  {#if decoration.gridWidth >= 3}
                    <div class="text-center leading-tight px-1 truncate w-full font-medium opacity-60"
                      style="color: {config.color}; font-size: {Math.max(8, Math.min(11, decoration.gridWidth * CELL_SIZE / 10))}px;">
                      {config.label}
                    </div>
                  {/if}
                </div>
              </div>
            {/each}

            {#each placedSectors as sector (sector.id)}
              {@const config = getConfig(sector.type)}
              {@const isSelected = selectedSector?.id === sector.id}
              {@const availableMissions = sector.missions?.filter(m => m.missionStatus === 'available') || []}
              {@const missionCount = availableMissions.length}
              {@const sectorWidth = sector.gridWidth * CELL_SIZE}
              {@const sectorHeight = sector.gridHeight * CELL_SIZE}
              {@const isSmall = sectorWidth < 100 || sectorHeight < 100}

              {@const sectorUrgentCount =
                sector.missions?.filter((m) => m.isUrgent && m.missionStatus === 'available')
                  .length || 0}
              {@const displayColor = sector.color || config.color}

              <button
                class="sector-btn absolute rounded-2xl transition-all duration-200 group"
                class:selected={isSelected}
                style="
                  left: {sector.gridX * CELL_SIZE}px;
                  top: {sector.gridY * CELL_SIZE}px;
                  width: {sectorWidth}px;
                  height: {sectorHeight}px;
                  --sector-color: {displayColor};
                  --sector-shadow: {config.shadowColor};
                  background: linear-gradient(145deg, {config.gradientFrom} 0%, {config.gradientTo} 100%);
                  border: 3px solid {displayColor};
                  box-shadow: 0 4px 12px {config.shadowColor}, inset 0 2px 8px rgba(255,255,255,0.5);
                "
                onclick={() => handleSectorClick(sector)}
              >
                {#if sectorUrgentCount > 0}
                  <div
                    class="absolute -top-3 -right-3 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-lg ring-2 ring-white animate-bounce"
                  >
                    <span class="text-xs font-bold">{sectorUrgentCount}</span>
                  </div>
                {/if}

                <div class="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div
                    class="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/30 to-transparent rotate-12"
                  ></div>
                </div>

                <div
                  class="absolute inset-0 flex flex-col items-center justify-center p-1.5 overflow-hidden"
                >
                  <div
                    class="sector-icon drop-shadow-md flex-shrink-0"
                    style="font-size: {isSmall
                      ? Math.max(20, sectorHeight / 3)
                      : Math.max(28, Math.min(48, sectorHeight / 2.5))}px;"
                  >
                    {config.icon}
                  </div>

                  {#if sectorHeight > 70}
                    <div
                      class="sector-name font-bold text-center leading-tight px-1 w-full flex-shrink-0"
                      style="color: {displayColor}; font-size: {Math.max(
                        10,
                        Math.min(14, sectorWidth / 8)
                      )}px; text-shadow: 0 1px 1px rgba(255,255,255,0.9);"
                    >
                      {sector.name}
                    </div>
                  {/if}

                  {#if missionCount > 0}
                    <div
                      class="mission-badge mt-1 px-2 py-0.5 rounded-full text-white font-bold shadow-md flex items-center gap-0.5 flex-shrink-0"
                      style="background: {displayColor}; font-size: {isSmall ? '10px' : '11px'};"
                    >
                      🎯 {missionCount}
                    </div>
                  {/if}
                </div>
              </button>
            {/each}

            {#if placedSectors.length === 0}
              <div class="absolute inset-0 flex items-center justify-center">
                <div
                  class="text-center p-8 bg-white/90 rounded-3xl backdrop-blur-sm shadow-2xl border-2 border-slate-200"
                >
                  <div class="text-6xl mb-4 animate-bounce-slow">🏫</div>
                  <p class="text-slate-700 font-bold text-lg">No map areas yet!</p>
                  <p class="text-slate-500 mt-2">Your teacher is still building the map.</p>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>

  {#if selectedSector}
    {@const config = getConfig(selectedSector.type)}
    {@const currentSector = selectedSector}
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onclick={closeSectorPanel}
      role="presentation"
    >
      <div
        class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-slide-up"
        onclick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
      >
        <div
          class="px-6 py-5 flex items-center justify-between relative overflow-hidden"
          style="background: linear-gradient(135deg, {config.gradientFrom} 0%, {config.gradientTo} 100%);"
        >
          <div
            class="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
            style="background: {config.color};"
          ></div>
          <div class="flex items-center gap-4 relative z-10">
            <div class="text-5xl drop-shadow-lg">{config.icon}</div>
            <div>
              <h3 class="text-2xl font-bold" style="color: {config.color};">
                {selectedSector.name}
              </h3>
              <p class="text-slate-600 flex items-center gap-1 mt-0.5">
                🎯 <span class="font-medium"
                  >{selectedSector.missions?.length || 0} mission{(selectedSector.missions
                    ?.length || 0) !== 1
                    ? 's'
                    : ''}</span
                >
              </p>
            </div>
          </div>
          <button
            onclick={closeSectorPanel}
            class="relative z-10 p-2.5 bg-white/80 hover:bg-white rounded-full transition-all shadow-md"
            aria-label="Close"
          >
            <svg
              class="w-5 h-5 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[60vh] bg-slate-50">
          {#if selectedSector.missions && selectedSector.missions.length > 0}
            <div class="space-y-3">
              {#each sortMissions(selectedSector.missions) as mission}
                {@const statusBadge = getMissionStatusBadge(mission)}
                {@const isUnavailable =
                  mission.missionStatus === 'taken' ||
                  mission.missionStatus === 'cooldown' ||
                  mission.missionStatus === 'max_reached'}
                {@const isUrgentAvailable =
                  mission.isUrgent && mission.missionStatus === 'available'}

                <button
                  class="mission-card w-full text-left p-4 rounded-2xl transition-all duration-200 border-2 group"
                  class:bg-white={!isUrgentAvailable && mission.missionStatus !== 'my_active'}
                  class:border-slate-100={!isUrgentAvailable &&
                    mission.missionStatus !== 'my_active'}
                  class:hover:border-slate-200={!isUnavailable &&
                    !isUrgentAvailable &&
                    mission.missionStatus !== 'my_active'}
                  class:hover:bg-slate-50={!isUnavailable &&
                    !isUrgentAvailable &&
                    mission.missionStatus !== 'my_active'}
                  class:hover:shadow-lg={!isUnavailable}
                  class:bg-blue-50={mission.missionStatus === 'my_active'}
                  class:border-blue-300={mission.missionStatus === 'my_active'}
                  class:bg-red-50={isUrgentAvailable}
                  class:border-red-200={isUrgentAvailable}
                  class:hover:bg-red-100={isUrgentAvailable}
                  class:hover:border-red-300={isUrgentAvailable}
                  class:opacity-60={isUnavailable}
                  class:cursor-not-allowed={isUnavailable}
                  onclick={() => !isUnavailable && handleMissionClick(mission, currentSector)}
                  disabled={isUnavailable}
                >
                  {#if statusBadge}
                    <div class="mb-2">
                      <span
                        class="px-2.5 py-1 {statusBadge.bgColor} {statusBadge.textColor} rounded-lg text-xs font-semibold shadow-sm"
                      >
                        {statusBadge.text}
                      </span>
                    </div>
                  {/if}

                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <h4
                        class="font-bold text-lg transition-colors"
                        class:text-slate-800={!isUrgentAvailable}
                        class:text-red-800={isUrgentAvailable}
                        class:group-hover:text-emerald-700={!isUnavailable && !isUrgentAvailable}
                      >
                        {mission.title}
                      </h4>
                      <p
                        class="text-sm mt-1 line-clamp-2"
                        class:text-slate-500={!isUrgentAvailable}
                        class:text-red-600={isUrgentAvailable}
                      >
                        {mission.description}
                      </p>
                    </div>
                    <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span
                        class="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-sm"
                        >⭐ {mission.xpReward} XP</span
                      >
                      <span
                        class="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full text-sm font-bold shadow-sm"
                        >🪙 {mission.coinReward}</span
                      >
                    </div>
                  </div>

                  {#if mission.thirstBoost || mission.hungerBoost || mission.happinessBoost || mission.cleanlinessBoost}
                    <div
                      class="flex flex-wrap gap-2 mt-3 pt-3 border-t"
                      class:border-slate-100={!isUrgentAvailable}
                      class:border-red-200={isUrgentAvailable}
                    >
                      {#if mission.thirstBoost}<span
                          class="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold"
                          >💧 +{mission.thirstBoost}</span
                        >{/if}
                      {#if mission.hungerBoost}<span
                          class="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold"
                          >🍎 +{mission.hungerBoost}</span
                        >{/if}
                      {#if mission.happinessBoost}<span
                          class="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold"
                          >😊 +{mission.happinessBoost}</span
                        >{/if}
                      {#if mission.cleanlinessBoost}<span
                          class="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold"
                          >✨ +{mission.cleanlinessBoost}</span
                        >{/if}
                    </div>
                  {/if}

                  {#if mission.missionStatus === 'my_active'}
                    <div
                      class="mt-3 flex items-center justify-end text-xs text-blue-500 font-medium"
                    >
                      <span>Tap to submit</span>
                      <svg
                        class="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        ><path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5l7 7-7 7"
                        /></svg
                      >
                    </div>
                  {:else if !isUnavailable}
                    <div
                      class="mt-3 flex items-center justify-end text-xs transition-colors"
                      class:text-slate-400={!isUrgentAvailable}
                      class:group-hover:text-emerald-500={!isUrgentAvailable}
                      class:text-red-400={isUrgentAvailable}
                      class:group-hover:text-red-600={isUrgentAvailable}
                    >
                      <span>Tap to start</span>
                      <svg
                        class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        ><path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5l7 7-7 7"
                        /></svg
                      >
                    </div>
                  {/if}
                </button>
              {/each}
            </div>
          {:else}
            <div class="text-center py-12">
              <div class="text-6xl mb-4">📭</div>
              <p class="text-slate-600 font-semibold text-lg">No missions here yet</p>
              <p class="text-slate-400 mt-2">Your teacher will add some soon!</p>
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

  .map-grid-wrapper {
    /* Allow hover effects to show without clipping */
    overflow: visible;
  }

  .sector-btn {
    cursor: pointer;
    transform-origin: center;
    z-index: 10;
  }

  .sector-btn:hover {
    transform: scale(1.03);
    z-index: 20 !important;
    box-shadow:
      0 8px 24px var(--sector-shadow),
      inset 0 2px 8px rgba(255, 255, 255, 0.5) !important;
  }

  .sector-btn:active {
    transform: scale(0.98);
  }

  .sector-btn.selected {
    transform: scale(1.03);
    z-index: 20 !important;
  }

  .sector-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
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
    animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes float-slow {
    0%,
    100% {
      transform: translateY(0) translateX(0);
    }
    50% {
      transform: translateY(-6px) translateX(-3px);
    }
  }

  @keyframes float-slower {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  .animate-float-slow {
    animation: float-slow 6s ease-in-out infinite;
  }

  .animate-float-slower {
    animation: float-slower 8s ease-in-out infinite;
  }

  @keyframes bounce-slow {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .animate-bounce-slow {
    animation: bounce-slow 3s ease-in-out infinite;
  }

  @keyframes pulse-slow {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-slide-up,
    .animate-float-slow,
    .animate-float-slower,
    .animate-bounce-slow,
    .animate-pulse-slow,
    .sector-btn {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
