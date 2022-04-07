import ZeedzMarketplace from "../../contracts/ZeedzMarketplace.cdc"
import FiatToken from "../../contracts/FiatToken.cdc"
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
            let marketFiatTokenReceiver = getAccount(marketCut).getCapability<&FiatToken.Vault{FungibleToken.Receiver}>(FiatToken.VaultReceiverPubPath)
            assert(marketFiatTokenReceiver.borrow() != nil, message: "Missing or mis-typed market FiatToken receiver")
            requirements.append(ZeedzMarketplace.SaleCutRequirement(receiver: marketFiatTokenReceiver, ratio: marketRatio))
        }

        // offset SaleCut
        if offsetRatio > 0.0 {
            let nftFiatTokenReceiver = getAccount(offsetCut).getCapability<&FiatToken.Vault{FungibleToken.Receiver}>(FiatToken.VaultReceiverPubPath)
            assert(nftFiatTokenReceiver.borrow() != nil, message: "Missing or mis-typed NFT FiatToken receiver")
            requirements.append(ZeedzMarketplace.SaleCutRequirement(receiver: nftFiatTokenReceiver, ratio: offsetRatio))
        }

         admin.updateSaleCutRequirement(requirements: requirements, vaultType: Type<@FiatToken.Vault>())
    }
}