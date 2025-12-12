<script lang="ts">
  import type { Mission } from '$lib/types';
  import MissionModal from './MissionModal.svelte';
  import { createEventDispatcher } from 'svelte';
  import schoolMap from '$lib/assets/school_map.png';
  import PageWrapper from './PageWrapper.svelte';
  import { API_BASE_URL } from '$lib/config';

  export let missions: Mission[] = [];

  const dispatch = createEventDispatcher<{
    accepted: { missionId: string };
  }>();

  let selectedMission: Mission | null = null;
  let isAccepting = false;
  let errorMessage = '';

  let showSuccessPopup = false;
  let startedMissionTitle = '';

  function openMission(mission: Mission) {
    selectedMission = mission;
    errorMessage = '';
  }

  function closeModal() {
    selectedMission = null;
    errorMessage = '';
  }

  function closeSuccessPopup() {
    showSuccessPopup = false;
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
          // Include any necessary data here, e.g., user ID
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to accept mission (${res.status})`);
      }

      dispatch('accepted', { missionId: mission.id });
      startedMissionTitle = mission.title;
      selectedMission = null;
      showSuccessPopup = true;
    } catch (err) {
      console.error(err);
      errorMessage = 'Could not accept mission. Please try again later.';
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

{#if showSuccessPopup}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="backdrop" on:click={closeSuccessPopup}>
    <div class="modal success-modal" on:click|stopPropagation>
      <div class="icon">🚀</div>
      <h2>Mission Started!</h2>
      <p>You have started: <strong>{startedMissionTitle}</strong></p>
      
      <div class="actions">
        <button class="primary-btn" on:click={closeSuccessPopup}>Okay, let's go!</button>
      </div>
    </div>
  </div>
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

  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .modal {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    animation: popIn 0.2s ease-out;
  }

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  p {
    color: #4b5563;
    margin-bottom: 1.5rem;
  }

  .primary-btn {
    background: #16a34a;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: background 0.2s;
  }

  .primary-btn:hover {
    background: #15803d;
  }

  @keyframes popIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
</style>
