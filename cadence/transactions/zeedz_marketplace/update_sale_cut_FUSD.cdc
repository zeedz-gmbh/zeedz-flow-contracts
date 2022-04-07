import ZeedzMarketplace from "../../contracts/ZeedzMarketplace.cdc"
import FUSD from "../../contracts/FUSD.cdc"
import FungibleToken from "../../contracts/FungibleToken.cdc"

// This transaction creates SaleCutRequirements of ZeedzMarketplace for NFT & Zeedz
transaction(marketCut: Address, offsetCut: Address) {

    prepare(signer: AuthAccount) {
        let marketRecipient = marketCut
        let marketRatio = 0.025 // 2.5%
        let offsetRecipient = offsetCut
        let offsetRatio = 0.025 // 2.5%

        assert(offsetRatio + marketRatio <= 1.0, message: "total of ratio must be less than or equal to 1.0")

        let admin = signer.borrow<&ZeedzMarketplace.Administrator>(from: ZeedzMarketplace.ZeedzMarketplaceAdminStoragePath)
            ?? panic("Cannot borrow marketplace admin")

        let requirements: [ZeedzMarketplace.SaleCutRequirement] = []

        // market SaleCut
        if marketRatio > 0.0 {
            let marketFusdReceiver = getAccount(marketCut).getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)
            assert(marketFusdReceiver.borrow() != nil, message: "Missing or mis-typed market FUSD receiver")
            requirements.append(ZeedzMarketplace.SaleCutRequirement(receiver: marketFusdReceiver, ratio: marketRatio))
        }

        // offset SaleCut
        if offsetRatio > 0.0 {
            let nftFusdReceiver = getAccount(offsetCut).getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)
            assert(nftFusdReceiver.borrow() != nil, message: "Missing or mis-typed NFT FUSD receiver")
            requirements.append(ZeedzMarketplace.SaleCutRequirement(receiver: nftFusdReceiver, ratio: offsetRatio))
        }

         admin.updateSaleCutRequirement(requirements: requirements, vaultType: Type<@FUSD.Vault>())
    }
}