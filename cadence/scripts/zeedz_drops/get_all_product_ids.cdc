import ZeedzDrops from "../../contracts/ZeedzDrops.cdc"

pub fun main(): [UInt64] {    
    return ZeedzDrops.getAllProductIDs()
}