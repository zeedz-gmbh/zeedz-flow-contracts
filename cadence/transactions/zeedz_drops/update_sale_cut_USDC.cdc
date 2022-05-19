import ZeedzDrops from "../../contracts/ZeedzDrops.cdc"
import FiatToken from "../../contracts/FiatToken.cdc"
import FungibleToken from "../../contracts/FungibleToken.cdc"

transaction(marketCut: Address) {

    prepare(signer: AuthAccount) {
        let marketRecipient = marketCut
        let marketRatio = 1.0 // 2.5%

        assert(marketRatio <= 1.0, message: "total of ratio must be less than or equal to 1.0")

        let adminRef = signer.borrow<&ZeedzDrops.DropsAdmin>(from: ZeedzDrops.ZeedzDropsStoragePath)
            ?? panic("Cannot borrow drops admin")

        let requirements: [ZeedzDrops.SaleCutRequirement] = []

        // market SaleCut
        if marketRatio > 0.0 {
            let marketFiatTokenReceiver = getAccount(marketCut).getCapability<&FiatToken.Vault{FungibleToken.Receiver}>(FiatToken.VaultReceiverPubPath)
            assert(marketFiatTokenReceiver.borrow() != nil, message: "Missing or mis-typed market FiatToken receiver")
            requirements.append(ZeedzDrops.SaleCutRequirement(receiver: marketFiatTokenReceiver, ratio: marketRatio))
        }

        adminRef.updateSaleCutRequirement(requirements: requirements, vaultType: Type<@FiatToken.Vault>())
    }
}