import NFTStorefront from 0xNFT_STOREFRONT
import ZeedzMarketplace from 0xZEEDZ_MARKETPLACE

pub fun main(): [UInt64] {
    return ZeedzMarketplace.getListingIDs()
}