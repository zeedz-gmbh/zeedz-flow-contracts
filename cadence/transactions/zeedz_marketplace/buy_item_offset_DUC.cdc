import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import NFTStorefront from "../../contracts/NFTStorefront.cdc"
import ZeedzMarketplace from "../../contracts/ZeedzMarketplace.cdc"
import ZeedzINO from "../../contracts/ZeedzINO.cdc"
import DapperUtilityCoin from "../../contracts/DapperUtilityCoin.cdc"
import FungibleToken from "../../contracts/FungibleToken.cdc"

transaction(storefrontAddress: Address, listingResourceID: UInt64, expectedPrice: UFix64, buyerAddress: Address) {
    let paymentVault: @FungibleToken.Vault
    let buyerNFTCollection: &ZeedzINO.Collection{NonFungibleToken.Receiver}
    let storefront: &NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}
    let listing: &NFTStorefront.Listing{NFTStorefront.ListingPublic}
    let balanceBeforeTransfer: UFix64
    let mainDucVault: &DapperUtilityCoin.Vault
    let adminRef: &ZeedzINO.Administrator
    let buyerZeedzPublic: &ZeedzINO.Collection{ZeedzINO.ZeedzCollectionPublic}

    // The Dapper Wallet admin Flow account will provide the authorizing signature,
    // which allows Dapper to purhase the NFT with DUC on behalf of the buyer
    prepare(dapper: AuthAccount, signer: AuthAccount, admin: AuthAccount) {
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

            // borrow a reference to the Administrator resource in storage
        self.adminRef= admin.getCapability(ZeedzINO.AdminPrivatePath)
            .borrow<&ZeedzINO.Administrator>()!

        self.buyerZeedzPublic = signer.getCapability<&ZeedzINO.Collection{ZeedzINO.ZeedzCollectionPublic}>(ZeedzINO.CollectionPublicPath)
            .borrow()
            ?? panic("Could not borrow ZeedzCollectionPublic")
    }

    execute {
        let item <- self.listing.purchase(
            payment: <-self.paymentVault
        )

        let zeedleID = item.id

        let zeedleRef = self.buyerZeedzPublic.borrowZeedle(id: zeedleID)
            ?? panic("No such zeedleID in that collection")

        self.buyerNFTCollection.deposit(token: <-item)

        self.adminRef.increaseOffset(zeedleRef: zeedleRef, amount: UInt64(Int(buyPrice) * 420))

        ZeedzMarketplace.removeListing(id: listingResourceID)

        // Assert that no DUC has leaked from the Dapper system
        if self.mainDucVault.balance != self.balanceBeforeTransfer {
            panic("DUC leakage")
        }
    }
}
```