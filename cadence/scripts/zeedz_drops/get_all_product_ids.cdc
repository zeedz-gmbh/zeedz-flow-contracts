import ZeedzDrops from "../../contracts/ZeedzDrops.cdc"

// This script returns an array of all the nft uuids for sale through a Storefront
pub fun main(): [UInt64] {    
    return ZeedzDrops.getAllProductIDs()
}