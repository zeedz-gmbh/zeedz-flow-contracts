import ZeedzDrops from 0xZEEDZ_DROPS
import FUSD from 0xFUSD_TOKEN
import FungibleToken from 0xFUNGIBLE_TOKEN

transaction(productID: UInt64, userID: String) {

    let productRef: &ZeedzDrops.Product{ZeedzDrops.ProductPublic}
    let paymentVault: @FungibleToken.Vault
    let vaultType: Type

    prepare(acct: AuthAccount) {
        self.productRef =  ZeedzDrops.getProduct(id: productID) 
            ?? panic("Product with specified id not found")

        self.vaultType = Type<@FUSD.Vault>()

        let price = self.productRef.getDetails().getPrices()[self.vaultType.identifier]
            ?? panic("Cannot get FUSD Token price for product")

        let mainFUSDVault = acct.borrow<&FUSD.Vault>(from: /storage/fusdVault)
            ?? panic("Cannot borrow FUSD vault from acct storage")

        self.paymentVault <- mainFUSDVault.withdraw(amount: price)
    }

    execute {
       self.productRef.purchase(payment: <- self.paymentVault, vaultType: self.vaultType, userID: userID)
    }
}