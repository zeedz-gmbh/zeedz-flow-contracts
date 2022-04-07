import ZeedzMarketplace from "../../contracts/ZeedzMarketplace.cdc"

pub fun main(listingID: UInt64): ZeedzMarketplace.Item? {
    return ZeedzMarketplace.getListingIDItem(listingID: listingID)
}