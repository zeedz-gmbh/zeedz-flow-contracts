import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import ZeedzItems from "../../contracts/ZeedzItems.cdc"

// This transaction configures an account to hold Zeedz Items.

transaction {
    prepare(signer: AuthAccount) {
    // if the account doesn't already have a collection
     if signer.borrow<&ZeedzItems.Collection>(from: ZeedzItems.CollectionStoragePath) == nil {
          signer.save(<-ZeedzItems.createEmptyCollection(), to: ZeedzItems.CollectionStoragePath)
        }
        signer.unlink(ZeedzItems.CollectionPublicPath)
        signer.link<&ZeedzItems.Collection{NonFungibleToken.CollectionPublic, ZeedzItems.ZeedzItemsCollectionPublic}>(ZeedzItems.CollectionPublicPath, target: ZeedzItems.CollectionStoragePath)
    }
}  