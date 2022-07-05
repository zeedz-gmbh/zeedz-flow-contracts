import NonFungibleToken from 0xNON_FUNGIBLE_TOKEN
import ZeedzINO from 0xZEEDZ_INO

/*
    This transaction destroys the ZeedzINO collection on the signer account
*/

transaction {
    prepare(account: AuthAccount) {
        let collectionRef = account.getCapability<&ZeedzINO.Collection{ZeedzINO.ZeedzCollectionPublic}>(ZeedzINO.CollectionPublicPath)
        if !collectionRef.check() {
            account.unlink(ZeedzINO.CollectionPublicPath)
            destroy <- account.load<@AnyResource>(from:ZeedzINO.CollectionStoragePath)
        }
    }
}