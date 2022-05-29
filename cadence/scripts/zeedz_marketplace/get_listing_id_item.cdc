import ZeedzMarketplace from 0xZEEDZ_MARKETPLACE

pub fun main(listingID: UInt64): ZeedzMarketplace.Item? {
    return ZeedzMarketplace.getListingIDItem(listingID: listingID)
}