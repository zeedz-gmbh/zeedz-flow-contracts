import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import ZeedzItems from "../../contracts/ZeedzItems.cdc"

// This script returns the size of an account's ZeedzItems collection.

pub fun main(address: Address): Int {
    let account = getAccount(address)

    let collectionRef = account.getCapability(ZeedzItems.CollectionPublicPath)!
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    return collectionRef.getIDs().length
}