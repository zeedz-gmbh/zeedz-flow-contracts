import NonFungibleToken from 0xNON_FUNGIBLE_TOKEN
import NFTStorefront from 0xNFT_STOREFRONT
import ZeedzMarketplace from 0xZEEDZ_MARKETPLACE
import FlowToken from 0xFLOW_TOKEN
import FungibleToken from 0xFUNGIBLE_TOKEN
import ZeedzINO from 0xZEEDZ_INO

transaction(listingResourceID: UInt64, storefrontAddress: Address, buyPrice: UFix64, offsetAmount: UInt64) {
    let paymentVault: @FungibleToken.Vault
    let nftReceiver: &ZeedzINO.Collection{NonFungibleToken.Receiver}
    let nftCollection: &AnyResource{ZeedzINO.ZeedzCollectionPublic}
    let storefront: &NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}
    let listing: &NFTStorefront.Listing{NFTStorefront.ListingPublic}
    let adminRef: &ZeedzINO.Administrator

    prepare(signer: AuthAccount, admin: AuthAccount) {
	    if signer.borrow<&ZeedzINO.Collection>(from: /storage/ZeedzINOCollection) == nil {
		    signer.save(<-ZeedzINO.createEmptyCollection(), to: /storage/ZeedzINOCollection)
            signer.unlink(ZeedzINO.CollectionPublicPath)
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

        self.nftReceiver = signer.borrow<&ZeedzINO.Collection{NonFungibleToken.Receiver}>(from: /storage/ZeedzINOCollection)
            ?? panic("Cannot borrow NFT collection receiver from account")

        self.adminRef= admin.getCapability(ZeedzINO.AdminPrivatePath)
            .borrow<&ZeedzINO.Administrator>()!

        self.nftCollection = signer.getCapability(ZeedzINO.CollectionPublicPath).borrow<&{ZeedzINO.ZeedzCollectionPublic}>() 
            ?? panic("Could not borrow ZeedzCollectionPublic")
    }

    execute {
        let item <- self.listing.purchase(payment: <-self.paymentVault)

        let zeedleID = item.id

        self.nftReceiver.deposit(token: <-item)

        let zeedleRef = self.nftCollection.borrowZeedle(id: zeedleID)
            ?? panic("No such zeedleID in that collection")

        self.adminRef.increaseOffset(zeedleRef: zeedleRef, amount: offsetAmount)

        // Be kind and recycle
        self.storefront.cleanup(listingResourceID: listingResourceID)
        ZeedzMarketplace.removeListing(id: listingResourceID)
    }

}