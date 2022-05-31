import ZeedzINO from 0xZEEDZ_INO

/*
    This scripts returns the number of Zeedz currently in existence.
*/

pub fun main(): {UInt32: UInt64} {    
    return ZeedzINO.getMintedPerType()
}