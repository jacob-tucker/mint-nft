import { config } from "@samatech/onflow-fcl-esm";

config({
  "accessNode.api": import.meta.env.VITE_ACCESS_NODE_API,
  "discovery.wallet": import.meta.env.VITE_DISCOVERY_WALLET,
  "0xExampleNFT": "0x3f55c5f48f39b076",
  "0xMDV": "0x631e88ae7f1d7c20",
  "0xNFT": "0x631e88ae7f1d7c20"
})