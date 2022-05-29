import ZeedzMarketplace from 0xZEEDZ_MARKETPLACE

pub fun main(): {String : [ZeedzMarketplace.SaleCutRequirement]} {
    return ZeedzMarketplace.getAllSaleCutRequirements()
}