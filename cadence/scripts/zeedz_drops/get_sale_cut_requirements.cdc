import ZeedzDrops from "../../contracts/ZeedzDrops.cdc"

pub fun main(): {String : [ZeedzDrops.SaleCutRequirement]} {
    return ZeedzDrops.getAllSaleCutRequirements()
}