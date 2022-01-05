import ZeedzItems from "../../contracts/ZeedzItems.cdc"

// This scripts returns the number of ZeedzItems currently in existence.

pub fun main(): UInt64 {    
    return ZeedzItems.totalSupply
}