import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import ZeedzINO from "../../contracts/ZeedzINO.cdc"

transaction(zeedleID: UInt64) {
    
    let zeedleProvider: &AnyResource{ZeedzINO.ZeedzCollectionPrivate}

    prepare(signer: AuthAccount) {

        // borrow a reference to the signer's NFT collection
        self.zeedleProvider = signer.borrow<&ZeedzINO.Collection>(from: ZeedzINO.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the owner's collection")
            
    }

    execute {
        self.zeedleProvider.burn(burnID: zeedleID)
    }
}