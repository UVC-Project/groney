<script lang="ts">
  import PageWrapper from '$lib/components/PageWrapper.svelte';
  import mapImage from '$lib/assets/school_map.png';
</script>

<PageWrapper title="Schoolyard Map">
  <img
			src="{mapImage}"
			alt="Hand-drawn map of the schoolyard with school, playground, and garden."
			class="map-image"
		/>
</PageWrapper>
