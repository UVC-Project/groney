<script lang="ts">
  import type { Mission } from '$lib/types';
  import MissionModal from './MissionModal.svelte';
  import { createEventDispatcher } from 'svelte';
  import schoolMap from '$lib/assets/school_map.png';
  import PageWrapper from './PageWrapper.svelte';
  import { API_BASE_URL } from '$lib/config';

  export let missions: Mission[] = [];
  export let currentUserId: string;
  export let currentClassId: string;

  const dispatch = createEventDispatcher<{
    accepted: { missionId: string };
  }>();

  let selectedMission: Mission | null = null;
  let isAccepting = false;
  let errorMessage = '';

  function openMission(mission: Mission) {
    selectedMission = mission;
    errorMessage = '';
  }

  function closeModal() {
    selectedMission = null;
    errorMessage = '';
  }

  // "Accept Mission" function
  async function acceptMission(mission: Mission) {
    try {
      isAccepting = true;
      errorMessage = '';

      const res = await fetch(`${API_BASE_URL}/map/missions/${mission.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          classId: currentClassId
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to accept mission (${res.status})`);
      }

      dispatch('accepted', { missionId: mission.id });
      selectedMission = null;
    } catch (err) {
      console.error(err);
      errorMessage = 'Kon missie niet accepteren. Probeer het later opnieuw.';
    } finally {
      isAccepting = false;
    }
  }
</script>

<PageWrapper title="Schoolyard Map">
  <img src={schoolMap} alt="Schoolyard map" class="map-image" />

  {#each missions as mission (mission.id)}
    <button
      class="pin"
      style={`left: ${mission.coordinates_x}%; top: ${mission.coordinates_y}%;`}
      on:click={() => openMission(mission)}
      aria-label={mission.title}
    >
      ●
    </button>
  {/each}
</PageWrapper>

{#if selectedMission}
  <MissionModal
    mission={selectedMission}
    on:close={closeModal}
    on:accept={() => acceptMission(selectedMission!)}
  />
{/if}

{#if isAccepting}
  <p class="info">Missie wordt geaccepteerd…</p>
{/if}

{#if errorMessage}
  <p class="error">{errorMessage}</p>
{/if}

<style>
  .pin {
    position: absolute;
    transform: translate(-50%, -100%);
    background: #22c55e;
    color: white;
    border-radius: 999px;
    border: none;
    width: 20px;
    height: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  .pin:hover {
    transform: translate(-50%, -110%) scale(1.05);
  }

  .info {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #4b5563;
  }

  .error {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #b91c1c;
  }
</style>
