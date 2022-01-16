import FungibleToken from "../../../contracts/FungibleToken.cdc"
import NFTStorefront from "../../../contracts/NFTStorefront.cdc"
import ZeedzMarketplace from "../../../contracts/ZeedzMarketplace.cdc"
// emulator FlowToken address
import FlowToken from 0x0ae53cb6e3f42a79
// emulator FungibleToken address
import FungibleToken from 0xee82856bf20e2aa6

import ZeedzINO from "../../../contracts/NFTs/ZeedzINO.cdc"

transaction(listingResourceID: UInt64, storefrontAddress: Address, buyPrice: UFix64) {
    let paymentVault: @FungibleToken.Vault
    let nftCollection: &ZeedzINO.Collection{NonFungibleToken.Receiver}
    let storefront: &NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}
    let listing: &NFTStorefront.Listing{NFTStorefront.ListingPublic}

    prepare(signer: AuthAccount) {
        // Create a collection to store the purchase if none present
	    if signer.borrow<&ZeedzINO.Collection>(from: /storage/ZeedzINOCollection) == nil {
		    signer.save(<-ZeedzINO.createEmptyCollection(), to: /storage/ZeedzINOCollection)
		    signer.link<&ZeedzINO.Collection{NonFungibleToken.CollectionPublic,ZeedzINO.ZeedzINOCollectionPublic}>(
			    /public/ZeedzINOCollection,
			    target: /storage/ZeedzINOCollection
		    )
	    }

        self.storefront = getAccount(storefrontAddress)
            .getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(NFTStorefront.StorefrontPublicPath)
            .borrow()
            ?? panic("Could not borrow Storefront from provided address")

        self.listing = self.storefront.borrowListing(listingResourceID: listingResourceID)
            ?? panic("No Offer with that ID in Storefront")
        let price = self.listing.getDetails().salePrice

        assert(buyPrice == price, message: "buyPrice is NOT same with salePrice")

        let flowTokenVault = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Cannot borrow FlowToken vault from signer storage")
        self.paymentVault <- flowTokenVault.withdraw(amount: price)

        self.nftCollection = signer.borrow<&ZeedzINO.Collection{NonFungibleToken.Receiver}>(from: /storage/ZeedzINOCollection)
            ?? panic("Cannot borrow NFT collection receiver from account")
    }

    execute {
        let item <- self.listing.purchase(payment: <-self.paymentVault)

        self.nftCollection.deposit(token: <-item)

        // Be kind and recycle
        self.storefront.cleanup(listingResourceID: listingResourceID)
        ZeedzMarketplace.removeListing(id: listingResourceID)
    }

}