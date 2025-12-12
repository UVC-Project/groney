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
  }
</script>

<MissionMap
  {missions}
  on:accepted={handleAccepted}
/>
