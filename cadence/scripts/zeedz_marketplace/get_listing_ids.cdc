import NFTStorefront from "../../contracts/NFTStorefront.cdc"
import ZeedzMarketplace from "../../contracts/ZeedzMarketplace.cdc"

pub fun main(): [UInt64] {
    return ZeedzMarketplace.getListingIDs()
}