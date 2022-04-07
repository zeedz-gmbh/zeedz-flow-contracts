import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import ZeedzINO from "../../contracts/ZeedzINO.cdc"
import ZeedzItems from "../../contracts/ZeedzItems.cdc"

/*
    This transaction configures an account to hold ZeedzINO & ZeedzItems
*/
transaction {
    prepare(signer: AuthAccount) {
    
    // Initialize ZeedzINO
    if signer.borrow<&ZeedzINO.Collection>(from: ZeedzINO.CollectionStoragePath) == nil {
        signer.save(<-ZeedzINO.createEmptyCollection(), to: ZeedzINO.CollectionStoragePath)
        signer.unlink(ZeedzINO.CollectionPublicPath)
        signer.link<&ZeedzINO.Collection{NonFungibleToken.CollectionPublic, ZeedzINO.ZeedzCollectionPublic}>(ZeedzINO.CollectionPublicPath, target: ZeedzINO.CollectionStoragePath)
        }

    // Initialize ZeedzItems
    if signer.borrow<&ZeedzItems.Collection>(from: ZeedzItems.CollectionStoragePath) == nil {
        signer.save(<-ZeedzItems.createEmptyCollection(), to: ZeedzItems.CollectionStoragePath)
        signer.unlink(ZeedzItems.CollectionPublicPath)
        signer.link<&ZeedzItems.Collection{NonFungibleToken.CollectionPublic, ZeedzItems.ZeedzItemsCollectionPublic}>(ZeedzItems.CollectionPublicPath, target: ZeedzItems.CollectionStoragePath)
        }
    }
}