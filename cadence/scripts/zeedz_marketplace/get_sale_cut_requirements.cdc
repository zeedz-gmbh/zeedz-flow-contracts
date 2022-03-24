import ZeedzMarketplace from "../../contracts/ZeedzMarketplace.cdc"

pub fun main(): {String : [ZeedzMarketplace.SaleCutRequirement]} {
    return ZeedzMarketplace.getAllSaleCutRequirements()
}