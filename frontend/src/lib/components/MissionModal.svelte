<script lang="ts">
  import type { Mission } from '$lib/types/index.js';
  import { createEventDispatcher } from 'svelte';

  export let mission: Mission;

  const dispatch = createEventDispatcher<{
    close: void;
    accept: void;
  }>();

  const close = () => dispatch('close');
  const accept = () => dispatch('accept');
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="backdrop" on:click={close}>
  <div class="modal" on:click|stopPropagation>
    <h2>{mission.title}</h2>
    <p>{mission.description}</p>

    <p>XP: {mission.xpReward} · Coins: {mission.coinReward}</p>
    <p>Category: {mission.category}</p>

    <div class="actions">
      <button type="button" on:click={close}>Cancel</button>
      <button type="button" on:click={accept}>Accept mission</button>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  .modal {
    background: white;
    border-radius: 0.75rem;
    padding: 1.5rem;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  .actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  button {
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    border: none;
    cursor: pointer;
  }

  button:last-child {
    background: #16a34a;
    color: white;
  }
</style>
