import ZeedzDrops from 0xZEEDZ_DROPS
import FUSD from 0xFUSD_TOKEN
import FungibleToken from 0xFUNGIBLE_TOKEN

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
            let marketFUSDReceiver = getAccount(marketCut).getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)
            assert(marketFUSDReceiver.borrow() != nil, message: "Missing or mis-typed market FUSD receiver")
            requirements.append(ZeedzDrops.SaleCutRequirement(receiver: marketFUSDReceiver, ratio: marketRatio))
        }

        adminRef.updateSaleCutRequirement(requirements: requirements, vaultType: Type<@FUSD.Vault>())
    }
}