import ZeedzINO from "../../contracts/ZeedzINO.cdc"

/*
    This scripts returns the number of Zeedz currently in existence.
*/

pub fun main(): UInt64 {    
    return ZeedzINO.totalSupply
}