<script lang="ts">
  interface Props {
    label: string;
    value: number;
    icon: string;
    accentColor: string;
    unit?: string;
    class?: string;
  }

  let {
    label,
    value,
    icon,
    accentColor,
    unit = '%',
    class: className = '',
  }: Props = $props();

  // Color based on value
  let valueColor = $derived(
    value >= 51 ? 'text-emerald-600' :
    value >= 25 ? 'text-amber-500' :
    'text-red-500'
  );
</script>

<div
  class="card text-center"
  style="border-bottom: 4px solid {accentColor}; border-radius: var(--radius-2xl);"
>
  <div class="text-3xl mb-2">{icon}</div>
  <p class="text-label mb-1">{label}</p>
  <p class="text-2xl font-extrabold transition-all duration-500 {valueColor}">
    {value}{unit}
  </p>
</div>

