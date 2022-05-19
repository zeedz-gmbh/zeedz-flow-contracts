import ZeedzDrops from "../../contracts/ZeedzDrops.cdc"
import FlowToken from "../../contracts/FlowToken.cdc"
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
            let marketFlowTokenReceiver = getAccount(marketCut).getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            assert(marketFlowTokenReceiver.borrow() != nil, message: "Missing or mis-typed market FlowToken receiver")
            requirements.append(ZeedzDrops.SaleCutRequirement(receiver: marketFlowTokenReceiver, ratio: marketRatio))
        }

        adminRef.updateSaleCutRequirement(requirements: requirements, vaultType: Type<@FlowToken.Vault>())
    }
}