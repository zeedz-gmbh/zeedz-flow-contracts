import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
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
    let collectionBorrow: &ZeedzINO.Collection{ZeedzINO.ZeedzCollectionPublic}
    let storefront: &NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}
    let listing: &NFTStorefront.Listing{NFTStorefront.ListingPublic}
    // local variable for storing the Admin reference
    let adminRef: &ZeedzINO.Administrator
    // local variable for storing the Zeedle reference

    prepare(signer: AuthAccount, admin: AuthAccount) {
        // Create a collection to store the purchase if none present
	    if signer.borrow<&ZeedzINO.Collection>(from: /storage/ZeedzINOCollection) == nil {
		    signer.save(<-ZeedzINO.createEmptyCollection(), to: /storage/ZeedzINOCollection)
		    signer.link<&ZeedzINO.Collection{NonFungibleToken.CollectionPublic,ZeedzINO.ZeedzCollectionPublic}>(
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

        // borrow a reference to the Administrator resource in storage
        self.adminRef= admin.getCapability(ZeedzINO.AdminPrivatePath)
            .borrow<&ZeedzINO.Administrator>()!

        self.collectionBorrow = signer.getCapability<&ZeedzINO.Collection{ZeedzINO.ZeedzCollectionPublic}>(ZeedzINO.CollectionPublicPath)
            .borrow()
            ?? panic("Could not borrow ZeedzCollectionPublic")
    }

    execute {
        let item <- self.listing.purchase(payment: <-self.paymentVault)

        let zeedleID = item.id
        
        // borrow a reference to the Zeedle

        self.nftCollection.deposit(token: <-item)

        let zeedleRef = self.collectionBorrow.borrowZeedle(id: zeedleID)
            ?? panic("No such zeedleID in that collection")

        self.adminRef.increaseOffset(zeedleRef: zeedleRef, amount: UInt64(Int(buyPrice) * 420))

        // Be kind and recycle
        self.storefront.cleanup(listingResourceID: listingResourceID)
        ZeedzMarketplace.removeListing(id: listingResourceID)
    }

}