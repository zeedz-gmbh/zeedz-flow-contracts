import ZeedzDrops from "../contracts/ZeedzDrops.cdc"
import FlowToken from "../contracts/FlowToken.cdc"
import FungibleToken from "../contracts/FungibleToken.cdc"

transaction(productID: UInt64, userID: String) {

    let productRef: &ZeedzDrops.Product{ZeedzDrops.ProductPublic}
    let paymentVault: @FungibleToken.Vault
    let vaultType: Type
    let adminRef: &ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}

    prepare(acct: AuthAccount, admin: AuthAccount) {
        self.productRef =  ZeedzDrops.getProduct(id: productID) 
            ?? panic("Product with specified id not found")

        self.vaultType = Type<@FlowToken.Vault>()

        let price = self.productRef.getDetails().getPrices()[self.vaultType.identifier]
            ?? panic("Cannot get Flow Token price for product")

        let mainFlowVault = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Cannot borrow FlowToken vault from acct storage")

        self.paymentVault <- mainFlowVault.withdraw(amount: price)

        self.adminRef = admin.borrow<&ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}>(from: ZeedzDrops.ZeedzDropsStoragePath)
            ?? panic("Missing or mis-typed admin resource")
    }

    execute {
        self.adminRef.purchase(productID: productID, payment: <- self.paymentVault, vaultType: self.vaultType, userID: userID)
    }
}