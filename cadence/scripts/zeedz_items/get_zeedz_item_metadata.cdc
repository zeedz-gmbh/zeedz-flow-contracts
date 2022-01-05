import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import ZeedzItems from "../../contracts/ZeedzItems.cdc"

// This script returns the metadata for an NFT in an account's collection.

pub fun main(address: Address, itemID: UInt64): {String: String} {

    // get the public account object for the token owner
    let owner = getAccount(address)

    let collectionBorrow = owner.getCapability(ZeedzItems.CollectionPublicPath)!
        .borrow<&{ZeedzItems.ZeedzItemsCollectionPublic}>()
        ?? panic("Could not borrow ZeedzItemsCollectionPublic")

    // borrow a reference to a specific NFT in the collection
    let ZeedzItem = collectionBorrow.borrowZeedzItem(id: itemID)
        ?? panic("No such itemID in that collection")

    return ZeedzItem.getMetadata()
}