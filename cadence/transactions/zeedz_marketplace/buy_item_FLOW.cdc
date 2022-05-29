import NonFungibleToken from 0xNON_FUNGIBLE_TOKEN
import NFTStorefront from 0xNFT_STOREFRONT
import ZeedzMarketplace from 0xZEEDZ_MARKETPLACE
import ZeedzINO from 0xZEEDZ_INO
import FlowToken from 0xFLOW_TOKEN
import FungibleToken from 0xFUNGIBLE_TOKEN

transaction(listingResourceID: UInt64, storefrontAddress: Address, buyPrice: UFix64) {
    let paymentVault: @FungibleToken.Vault
    let nftReceiver: &ZeedzINO.Collection{NonFungibleToken.Receiver}
    let storefront: &NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}
    let listing: &NFTStorefront.Listing{NFTStorefront.ListingPublic}

    prepare(signer: AuthAccount) {
        // Create a collection to store the purchase if none present
	    if signer.borrow<&ZeedzINO.Collection>(from: ZeedzINO.CollectionStoragePath) == nil {
		    signer.save(<-ZeedzINO.createEmptyCollection(), to: ZeedzINO.CollectionStoragePath)
		    signer.link<&ZeedzINO.Collection{NonFungibleToken.CollectionPublic,ZeedzINO.ZeedzCollectionPublic}>(
			    ZeedzINO.CollectionPublicPath,
			    target: ZeedzINO.CollectionStoragePath
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

        self.nftReceiver = signer.borrow<&ZeedzINO.Collection{NonFungibleToken.Receiver}>(from: ZeedzINO.CollectionStoragePath)
            ?? panic("Cannot borrow NFT collection receiver from account")
    }

    execute {
        let item <- self.listing.purchase(payment: <-self.paymentVault)

        self.nftReceiver.deposit(token: <-item)

        // Be kind and recycle
        self.storefront.cleanup(listingResourceID: listingResourceID)
        ZeedzMarketplace.removeListing(id: listingResourceID)
    }

}