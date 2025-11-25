<script>
  import { onMount } from "svelte";

  let visible = false;

  onMount(() => {
    function handleScroll() {
      visible = window.scrollY > 200;
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
</script>

<style>
  .fade {
    transition: opacity 0.9s ease, transform 0.9s ease;
  }
  .hidden-state {
    opacity: 0;
    pointer-events: none;
    transform: translateY(20px);
  }
  .visible-state {
    opacity: 1;
    transform: translateY(0);
  }
</style>

<button
  class="fixed bottom-20 right-6 w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-green-400 cursor-pointer fade"
  class:hidden-state={!visible}
  class:visible-state={visible}
  on:click={scrollToTop}>👆🏻</button>
