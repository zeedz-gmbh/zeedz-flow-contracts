import NonFungibleToken from 0xNON_FUNGIBLE_TOKEN
import NFTStorefront from 0xNFT_STOREFRONT
import ZeedzMarketplace from 0xZEEDZ_MARKETPLACE
import ZeedzINO from 0xZEEDZ_INO
import DapperUtilityCoin from 0xDUC_TOKEN
import FungibleToken from 0xFUNGIBLE_TOKEN

transaction(storefrontAddress: Address, listingResourceID: UInt64, expectedPrice: UFix64, buyerAddress: Address) {
    let paymentVault: @FungibleToken.Vault
    let buyerNFTCollection: &ZeedzINO.Collection{NonFungibleToken.Receiver}
    let storefront: &NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}
    let listing: &NFTStorefront.Listing{NFTStorefront.ListingPublic}
    let balanceBeforeTransfer: UFix64
    let mainDucVault: &DapperUtilityCoin.Vault

    // The Dapper Wallet admin Flow account will provide the authorizing signature,
    // which allows Dapper to purhase the NFT with DUC on behalf of the buyer
    prepare(dapper: AuthAccount) {
        self.storefront = getAccount(storefrontAddress)
            .getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(
                NFTStorefront.StorefrontPublicPath
            )!
            .borrow()
            ?? panic("Could not borrow Storefront from provided address")

        self.listing = self.storefront.borrowListing(listingResourceID: listingResourceID)
                    ?? panic("No Offer with that ID in Storefront")
        let salePrice = self.listing.getDetails().salePrice
        
        // Make sure the price on the listing matches the sale price argument. This is important
        // because Dapper uses the sale price argument to determine the amount to charge the user.
        if expectedPrice != salePrice {
            panic("Sale price not expected value")
        }

        // Because Dapper signed as the authorizer, we can borrow a reference 
        // to Dapper admin's account DUC vault to withdraw the amount required 
        // to purchase the NFT
        self.mainDUCVault = dapper.borrow<&DapperUtilityCoin.Vault>(from: /storage/dapperUtilityCoinVault)
					?? panic("Could not borrow reference to Dapper Utility Coin vault")
        self.balanceBeforeTransfer = self.mainDucVault.balance
        self.paymentVault <- self.mainDUCVault.withdraw(amount: salePrice)

        self.buyerNFTCollection = getAccount(buyerAddress)
            .getCapability<&ZeedzINO.Collection{NonFungibleToken.Receiver}>(
                ZeedzINO.CollectionPublicPath
            )
            .borrow()
            ?? panic("Cannot borrow ZeedzINO collection receiver from buyerAddress")
    }

    execute {
        let item <- self.listing.purchase(
            payment: <-self.paymentVault
        )

        self.buyerNFTCollection.deposit(token: <-item)

        ZeedzMarketplace.removeListing(id: listingResourceID)

        // Assert that no DUC has leaked from the Dapper system
        if self.mainDucVault.balance != self.balanceBeforeTransfer {
            panic("DUC leakage")
        }
    }
}
```