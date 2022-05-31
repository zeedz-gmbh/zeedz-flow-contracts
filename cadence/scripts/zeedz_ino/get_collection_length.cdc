import NonFungibleToken from 0xNON_FUNGIBLE_TOKEN
import ZeedzINO from 0xZEEDZ_INO

/*
    This script returns the size of an account's ZeedzINO collection.
*/

pub fun main(address: Address): Int {
    let account = getAccount(address)

    let collectionRef = account.getCapability(ZeedzINO.CollectionPublicPath)!
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    return collectionRef.getIDs().length
}