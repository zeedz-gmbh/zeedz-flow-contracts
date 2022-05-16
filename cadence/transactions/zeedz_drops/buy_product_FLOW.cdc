import ZeedzDrops from "../contracts/ZeedzDrops.cdc"
import FlowToken from "../contracts/FlowToken.cdc"
import FungibleToken from "../contracts/FungibleToken.cdc"

transaction(productID: UInt64, userID: String) {

    let productRef: &ZeedzDrops.Product{ZeedzDrops.ProductPublic}
    let paymentVault: @FungibleToken.Vault
    let vaultType: Type

    prepare(acct: AuthAccount) {
        self.productRef =  ZeedzDrops.getProduct(id: productID) 
            ?? panic("Product with specified id not found")

        self.vaultType = Type<@FlowToken.Vault>()

        let price = self.productRef.getDetails().getPrices()[self.vaultType.identifier]
            ?? panic("Cannot get Flow Token price for product")

        let mainFlowVault = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Cannot borrow FlowToken vault from acct storage")

        self.paymentVault <- mainFlowVault.withdraw(amount: price)
    }

    execute {
       self.productRef.purchase(payment: <- self.paymentVault, vaultType: self.vaultType, userID: userID)
    }
}