import ZeedzMarketplace from "../../contracts/ZeedzMarketplace.cdc"
import FlowToken from "../../contracts/FlowToken.cdc"
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
            let marketFlowTokenReceiver = getAccount(marketCut).getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            assert(marketFlowTokenReceiver.borrow() != nil, message: "Missing or mis-typed market FlowToken receiver")
            requirements.append(ZeedzMarketplace.SaleCutRequirement(receiver: marketFlowTokenReceiver, ratio: marketRatio))
        }

        // offset SaleCut
        if offsetRatio > 0.0 {
            let nftFlowTokenReceiver = getAccount(offsetCut).getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            assert(nftFlowTokenReceiver.borrow() != nil, message: "Missing or mis-typed NFT FlowToken receiver")
            requirements.append(ZeedzMarketplace.SaleCutRequirement(receiver: nftFlowTokenReceiver, ratio: offsetRatio))
        }

        admin.updateSaleCutRequirement(requirements)
    }
}