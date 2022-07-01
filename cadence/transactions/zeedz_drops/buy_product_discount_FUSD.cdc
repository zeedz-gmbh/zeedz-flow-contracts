import ZeedzDrops from 0xZEEDZ_DROPS
import FUSD from 0xFUSD_TOKEN
import FungibleToken from 0xFUNGIBLE_TOKEN

transaction(productID: UInt64, userID: String, discount: UFix64) {

    let productRef: &ZeedzDrops.Product{ZeedzDrops.ProductPublic}
    let adminRef: &ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}
    let paymentVault: @FungibleToken.Vault
    let vaultType: Type

    prepare(acct: AuthAccount, admin: AuthAccount) {
        self.productRef =  ZeedzDrops.borrowProduct(id: productID) 
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