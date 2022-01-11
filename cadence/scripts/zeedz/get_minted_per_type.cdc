import ZeedzINO from "../../contracts/ZeedzINO.cdc"

/*
    This scripts returns the number of Zeedz currently in existence.
*/

pub fun main(): {UInt32: UInt64} {    
    return ZeedzINO.getMintedPerType()
}