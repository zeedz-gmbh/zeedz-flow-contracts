import ZeedzDrops from "../contracts/ZeedzDrops.cdc"
import FUSD from "../contracts/FUSD.cdc"
import FungibleToken from "../contracts/FungibleToken.cdc"

transaction(productID: UInt64, userID: String, discount: UFix64) {

    let productRef: &ZeedzDrops.Product{ZeedzDrops.ProductPublic}
    let adminRef: &ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}
    let paymentVault: @FungibleToken.Vault
    let vaultType: Type

    prepare(acct: AuthAccount, admin: AuthAccount) {
        self.productRef =  ZeedzDrops.getProduct(id: productID) 
            ?? panic("Product with specified id not found")

        self.vaultType = Type<@FUSD.Vault>()

        let price = self.productRef.getDetails().getPrices()[self.vaultType.identifier]
            ?? panic("Cannot get FUSD Token price for product")

        let mainFUSDVault = acct.borrow<&FUSD.Vault>(from: /storage/fusdVault)
            ?? panic("Cannot borrow FUSD vault from acct storage")

        let discountedPrice = price*(1.0-discount)

        self.paymentVault <- mainFUSDVault.withdraw(amount: discountedPrice)

        self.adminRef = admin.borrow<&ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}>(from: ZeedzDrops.ZeedzDropsStoragePath)
            ?? panic("Missing or mis-typed admin resource")
    }

    execute {
       self.adminRef.purchaseWithDiscount(productID: productID, payment: <- self.paymentVault, discount: discount, vaultType: self.vaultType, userID: userID)
    }
}