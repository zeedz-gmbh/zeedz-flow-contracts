import ZeedzMarketplace from "../../contracts/ZeedzMarketplace.cdc"

pub fun main(): [ZeedzMarketplace.SaleCutRequirement] {
    return ZeedzMarketplace.getAllSaleCutRequirements()
}