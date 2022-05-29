import NonFungibleToken from 0xNON_FUNGIBLE_TOKEN
import ZeedzINO from 0xZEEDZ_INO

/*
    This transaction configures an account to hold Zeedz
*/

transaction {
    prepare(signer: AuthAccount) {
    // if the account doesn't already have a collection
     if signer.borrow<&ZeedzINO.Collection>(from: ZeedzINO.CollectionStoragePath) == nil {
            signer.save(<-ZeedzINO.createEmptyCollection(), to: ZeedzINO.CollectionStoragePath)
            signer.unlink(ZeedzINO.CollectionPublicPath)
            signer.link<&ZeedzINO.Collection{NonFungibleToken.CollectionPublic, ZeedzINO.ZeedzCollectionPublic}>(ZeedzINO.CollectionPublicPath, target: ZeedzINO.CollectionStoragePath)
        }
    }
}   