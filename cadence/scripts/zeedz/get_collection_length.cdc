import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import ZeedzINO from "../../contracts/ZeedzINO.cdc"

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