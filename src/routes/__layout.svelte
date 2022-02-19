<script>
  import "../app.css";
  import Transaction from '$lib/Transaction.svelte';
</script>

<main class="container">
  <slot />
  <Transaction />
</main>

<footer>
  <p>
    visit <a href="https://docs.hyperverse.dev">docs.hyperverse.dev</a> to learn more.
  </p>
</footer>

<style>
  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
  }

  footer a {
    font-weight: bold;
  }

  @media (min-width: 480px) {
    footer {
      padding: 40px 0;
    }
  }
</style>
