import ZeedzMarketplace from 0xZEEDZ_MARKETPLACE

// Can be used by anyone to remove a listing if the listed item has been removed or purchased.
pub fun main(listingID: UInt64) {
    ZeedzMarketplace.removeListing(id: listingID)
}