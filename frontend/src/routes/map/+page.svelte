<script lang="ts">
  import type { PageData } from './$types';
  import MissionMap from '$lib/components/MissionMap.svelte';

  export let data: PageData;

  const { missions } = data;

  // TODO: wire these to your real auth / class state
  const currentUserId = 'demo-user-id';
  const currentClassId = 'class-garden-101';

  function handleAccepted(event: CustomEvent<{ missionId: string }>) {
    console.log('Mission accepted:', event.detail.missionId);
    // optional: mark mission locally as IN_PROGRESS or refetch
  }
</script>

<MissionMap
  {missions}
  {currentUserId}
  {currentClassId}
  on:accepted={handleAccepted}
/>
