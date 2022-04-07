import ZeedzMarketplace from "../../contracts/ZeedzMarketplace.cdc"
import FlowToken from "../../contracts/FlowToken.cdc"
import FungibleToken from "../../contracts/FungibleToken.cdc"

// Can be used by anyone to remove a listing if the listed item has been removed or purchased.
pub fun main(listingID: UInt64) {
         ZeedzMarketplace.removeListing(id: listingResourceID)
}