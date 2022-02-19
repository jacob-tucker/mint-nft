<script>
  import { page } from "$app/stores";

  import { getNFTs } from "$lib/flow/actions";

  let nfts = getNFTs($page.params.address)
</script>

<div>
  <h1>All your NFTs</h1>

  {#await nfts}
    <h1>Loading...</h1>
  {:then nfts}
    {#if nfts?.length > 0}
      {#each nfts as nft}
        <article class="card-preview">
          <img src={`https://ipfs.infura.io/ipfs/${nft.image}`} alt="nft" />
          <h1>{nft.title}</h1>
          <small>Created on {new Date(nft.date * 1000).toLocaleString()}</small>
        </article>
      {/each}
    {:else}
      <p>This account doesn't have any FLOATs yet.</p>
    {/if}
  {/await}
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>