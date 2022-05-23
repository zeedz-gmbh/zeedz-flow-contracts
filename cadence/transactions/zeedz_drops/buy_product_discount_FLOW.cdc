import ZeedzDrops from "../../contracts/ZeedzDrops.cdc"
import FlowToken from "../../contracts/FlowToken.cdc"
import FungibleToken from "../../contracts/FungibleToken.cdc"

transaction(productID: UInt64, userID: String, discount: UFix64) {

    let productRef: &ZeedzDrops.Product{ZeedzDrops.ProductPublic}
    let adminRef: &ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}
    let paymentVault: @FungibleToken.Vault
    let vaultType: Type

    prepare(acct: AuthAccount, admin: AuthAccount) {
        self.productRef =  ZeedzDrops.getProduct(id: productID) 
            ?? panic("Product with specified id not found")

        self.vaultType = Type<@FlowToken.Vault>()

        let price = self.productRef.getDetails().getPrices()[self.vaultType.identifier]
            ?? panic("Cannot get Flow Token price for product")

        let mainFlowVault = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Cannot borrow FlowToken vault from acct storage")

        let discountedPrice = price*(1.0-discount)

        self.paymentVault <- mainFlowVault.withdraw(amount: discountedPrice)

        self.adminRef = admin.borrow<&ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}>(from: ZeedzDrops.ZeedzDropsStoragePath)
            ?? panic("Missing or mis-typed admin resource")
    }

    execute {
       self.adminRef.purchaseWithDiscount(productID: productID, payment: <- self.paymentVault, discount: discount, vaultType: self.vaultType, userID: userID)
    }
}