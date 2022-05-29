import ZeedzDrops from 0xZEEDZ_DROPS

pub fun main(): {String : [ZeedzDrops.SaleCutRequirement]} {
    return ZeedzDrops.getAllSaleCutRequirements()
}