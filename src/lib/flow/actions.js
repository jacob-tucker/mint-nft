import { browser } from '$app/env';
import { get } from 'svelte/store';

import * as fcl from "@samatech/onflow-fcl-esm";
import "./config";
import { user, txId, transactionStatus, transactionInProgress } from './stores';

if(browser) {
  // set Svelte $user store to currentUser, 
  // so other components can access it
  fcl.currentUser.subscribe(user.set, [])
}

// Lifecycle FCL Auth functions
export const unauthenticate = () => fcl.unauthenticate();
export const authenticate = () => fcl.authenticate();

export const mintNFT = async (title, image, date) => {
  initTransactionState();

  let newDate = +new Date(date) / 1000;

  try {
    let transactionId = await fcl.mutate({
      cadence: `
        import ExampleNFT from 0xExampleNFT
        import MetadataViews from 0xMDV
        import NonFungibleToken from 0xNFT

        transaction(title: String, image: String, date: UFix64) {
          prepare(signer: AuthAccount) {
            if signer.borrow<&ExampleNFT.Collection>(from: ExampleNFT.CollectionStoragePath) == nil {
              signer.save(<- ExampleNFT.createEmptyCollection(), to: ExampleNFT.CollectionStoragePath)
              signer.link<&ExampleNFT.Collection{MetadataViews.ResolverCollection, NonFungibleToken.CollectionPublic}>(ExampleNFT.CollectionPublicPath, target: ExampleNFT.CollectionStoragePath)
            }
            
            let collection = signer.borrow<&ExampleNFT.Collection>(from: ExampleNFT.CollectionStoragePath)!
            collection.deposit(token: <- ExampleNFT.mintNFT(title: title, image: image, date: date))
          }
        }
      `,
      args: (arg, t) => [
        arg(title, t.String),
        arg(image, t.String),
        arg(newDate.toFixed(1), t.UFix64)
      ],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999
    })
    
    txId.set(transactionId);

    fcl.tx(transactionId).subscribe(res => {
      transactionStatus.set(res.status)
      if(res.status === 4) {
        setTimeout(() => transactionInProgress.set(false),2000)
      }
    })

  } catch (e) {
    transactionStatus.set(99)
    console.log(e)
  }
}

// send a transaction to get a user's profile
export const getNFTs = async (addr) => {

  try {
    let nftData = await fcl.query({
      cadence: `
      import ExampleNFT from 0xExampleNFT
      import MetadataViews from 0xMDV
      
      pub fun main(address: Address): [ExampleNFT.NFTView] {
          let account = getAccount(address)
      
          let collection = account
              .getCapability(ExampleNFT.CollectionPublicPath)
              .borrow<&{MetadataViews.ResolverCollection}>()
              ?? panic("Could not borrow a reference to the collection")
      
          let nfts = collection.getIDs()
          var returnVal: [ExampleNFT.NFTView] = []
          for id in nfts {
            let view = collection.borrowViewResolver(id: id)
            if var metadata = view.resolveView(Type<ExampleNFT.NFTView>()) {
              var nft = metadata as! ExampleNFT.NFTView
              returnVal.append(nft)
            }
          }
        
          return returnVal
      }
      `,
      args: (arg, t) => [
        arg(addr, t.Address)
      ]
    });
    console.log(nftData);
    return nftData;
  } catch(e) {
    console.log(e);
  }
}

function initTransactionState() {
  transactionInProgress.set(true);
  transactionStatus.set(-1);
}