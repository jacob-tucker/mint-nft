
<script>
  import { mintNFT } from "$lib/flow/actions";
  import LibLoader from "$lib/LibLoader.svelte";
  import { onMount } from "svelte";
  import { user } from '$lib/flow/stores';
  import ConnectWallet from '$lib/ConnectWallet.svelte';
  import UserAddress from '$lib/UserAddress.svelte';

  let ipfsIsReady = false;
  let title = "";
  let ipfsHash = "";
  let imagePreviewSrc = "";
  let timezone = new Date()
    .toLocaleTimeString("en-us", { timeZoneName: "short" })
    .split(" ")[2];
  let date = "";

  onMount(() => {
    ipfsIsReady = window?.IpfsHttpClient ?? false;
  });

  function ipfsReady() {
    console.log("ipfs is ready");
    ipfsIsReady = true;
  }

  let uploadToIPFS = async (e) => {
    // imagePreviewSrc = e.target.files[0]
    let file = e.target.files[0];

    const client = window.IpfsHttpClient.create({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
    });
    const added = await client.add(file);
    ipfsHash = added.path;
    imagePreviewSrc = `https://ipfs.infura.io/ipfs/${ipfsHash}`;
  };
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<LibLoader
  url="https://cdn.jsdelivr.net/npm/ipfs-http-client@56.0.0/index.min.js"
  on:loaded={ipfsReady}
  uniqueId={+new Date()}
/>

<div>
  <article>
    <header>
      <h1>Mint your own NFT</h1>
      {#if $user?.loggedIn}
        <a href="/{$user.addr}" role="button" class="outline">
          <UserAddress address={$user?.addr || '0x0'} abbreviated={false}/>
        </a>
      {:else}
        <ConnectWallet/>
      {/if}
    </header>
    <label for="claimCode">
      Enter the title of your NFT below.
      <input
        type="text"
        name="claimCode"
        bind:value={title}
        placeholder="ex. Clint is amazing"
      />
    </label>

    {#if ipfsIsReady}
      <label for="image">
        Image
        <input
          on:change={(e) => uploadToIPFS(e)}
          type="file"
          id="image"
          name="image"
          accept="image/png, image/gif, image/jpeg"
        />
      </label>
    {/if}

    <!-- Date -->
    <label for="date">
      Date Created ({timezone})
      <input
        type="datetime-local"
        id="date"
        name="date"
        bind:value={date}
      />
    </label>

    {#if title && ipfsHash && date}
      <article class="card-preview">
        <img src={imagePreviewSrc} alt="nft" />
        <h1>{title}</h1>
        <small>Created on {new Date((+new Date(date) / 1000) * 1000).toLocaleString()}</small>
      </article>
    {/if}
    <footer>
      <button
        disabled={!(ipfsHash && title && date)}
        on:click={() =>
          mintNFT(title, ipfsHash, date)}
        >Mint NFT
      </button>
    </footer>
  </article>
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  img {
    width: 100px;
    height: auto;
  }
</style>

