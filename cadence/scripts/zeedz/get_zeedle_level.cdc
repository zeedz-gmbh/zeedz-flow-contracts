import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import ZeedzINO from "../../contracts/ZeedzINO.cdc"

/*
    This script returns the metadata for a Zeedle NFT in an account's collection.
*/

pub fun main(address: Address, zeedleID: UInt64): UInt64 {

    let owner = getAccount(address)

    let collectionBorrow = owner.getCapability(ZeedzINO.CollectionPublicPath)!
        .borrow<&{ZeedzINO.ZeedzCollectionPublic}>()
        ?? panic("Could not borrow ZeedzCollectionPublic")

    let Zeedle = collectionBorrow.borrowZeedle(id: zeedleID)
        ?? panic("No such zeedleID in that collection")

    return Zeedle.getLevel()
}