import ZeedzDrops from 0xZEEDZ_DROPS
import FiatToken from 0xFIAT_TOKEN
import FungibleToken from 0xFUNGIBLE_TOKEN

transaction(productID: UInt64, userID: String, discount: UFix64) {

    let productRef: &ZeedzDrops.Product{ZeedzDrops.ProductPublic}
    let adminRef: &ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}
    let paymentVault: @FungibleToken.Vault
    let vaultType: Type

    prepare(acct: AuthAccount, admin: AuthAccount) {
        self.productRef =  ZeedzDrops.borrowProduct(id: productID) 
            ?? panic("Product with specified id not found")

        self.vaultType = Type<@FiatToken.Vault>()

        let price = self.productRef.getDetails().getPrices()[self.vaultType.identifier]
            ?? panic("Cannot get Fiat Token price for product")

        let mainFiatVault = acct.borrow<&FiatToken.Vault>(from: FiatToken.VaultStoragePath)
            ?? panic("Cannot borrow FiatToken vault from acct storage")

        let discountedPrice = price*(1.0-discount)

        self.paymentVault <- mainFiatVault.withdraw(amount: discountedPrice)

        self.adminRef = admin.borrow<&ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}>(from: ZeedzDrops.ZeedzDropsStoragePath)
            ?? panic("Missing or mis-typed admin resource")
    }

    execute {
       self.adminRef.purchaseWithDiscount(productID: productID, payment: <- self.paymentVault, discount: discount, vaultType: self.vaultType, userID: userID)
    }
}