import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import ZeedzItems from "../../contracts/ZeedzItems.cdc"
transaction(itemID: UInt64) {
    
    let itemProvider: &AnyResource{ZeedzItems.ZeedzItemsCollectionPrivate}

    prepare(signer: AuthAccount) {

        // borrow a reference to the signer's NFT collection
        self.itemProvider = signer.borrow<&ZeedzItems.Collection>(from: ZeedzItems.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the owner's collection")
            
    }

    execute {
        self.itemProvider.burn(burnID: itemID)
    }
}