import ZeedzDrops from "../contracts/ZeedzDrops.cdc"
import FiatToken from "../contracts/FiatToken.cdc"
import FungibleToken from "../contracts/FungibleToken.cdc"

transaction(productID: UInt64, userID: String) {

    let productRef: &ZeedzDrops.Product{ZeedzDrops.ProductPublic}
    let paymentVault: @FungibleToken.Vault
    let vaultType: Type

    prepare(acct: AuthAccount) {
        self.productRef =  ZeedzDrops.getProduct(id: productID) 
            ?? panic("Product with specified id not found")

        self.vaultType = Type<@FiatToken.Vault>()

        let price = self.productRef.getDetails().getPrices()[self.vaultType.identifier]
            ?? panic("Cannot get Fiat Token price for product")

        let mainFiatVault = acct.borrow<&FiatToken.Vault>(from: FiatToken.VaultStoragePath)
            ?? panic("Cannot borrow FiatToken vault from acct storage")

        self.paymentVault <- mainFiatVault.withdraw(amount: price)
    }

    execute {
       self.productRef.purchase(payment: <- self.paymentVault, vaultType: self.vaultType, userID: userID)
    }
}