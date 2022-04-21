import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import NFTStorefront from "../../contracts/NFTStorefront.cdc"
import ZeedzMarketplace from "../../contracts/ZeedzMarketplace.cdc"
import ZeedzINO from "../../contracts/ZeedzINO.cdc"
import FUSD from "../../contracts/FUSD.cdc"
import FungibleToken from "../../contracts/FungibleToken.cdc"

transaction(saleItemID: UInt64, saleItemPrice: UFix64) {
    let fusdReceiver: Capability<&FUSD.Vault{FungibleToken.Receiver}>
    let nftProvider: Capability<&ZeedzINO.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>
    let storefront: &NFTStorefront.Storefront
    let storefrontPublic: Capability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>
    prepare(signer: AuthAccount) {
        // Create Storefront if it doesn't exist
        if signer.borrow<&NFTStorefront.Storefront>(from: NFTStorefront.StorefrontStoragePath) == nil {
            let storefront <- NFTStorefront.createStorefront() as! @NFTStorefront.Storefront
            signer.save(<-storefront, to: NFTStorefront.StorefrontStoragePath)
            signer.link<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(
                NFTStorefront.StorefrontPublicPath,
                target: NFTStorefront.StorefrontStoragePath)
        }
        // We need a provider capability, but one is not provided by default so we create one if needed.
        let nftCollectionProviderPrivatePath = /private/zeedzINONFTCollectionProviderForNFTStorefront
        if !signer.getCapability<&ZeedzINO.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftCollectionProviderPrivatePath)!.check() {
            signer.link<&ZeedzINO.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftCollectionProviderPrivatePath, target: ZeedzINO.CollectionStoragePath)
        }
        // Initialize vault capability if it isn't already initialized
        if signer.borrow<&FUSD.Vault>(from: /storage/fusdVault) == nil {
            signer.save(<-FUSD.createEmptyVault(), to: /storage/fusdVault)
            signer.link<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver, target: /storage/fusdVault)
            signer.link<&FUSD.Vault{FungibleToken.Balance}>(/public/fusdBalance, target: /storage/fusdVault)
        }
        self.fusdReceiver = signer.getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)!
        assert(self.fusdReceiver.borrow() != nil, message: "Missing or mis-typed FUSD receiver")
        self.nftProvider = signer.getCapability<&ZeedzINO.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftCollectionProviderPrivatePath)!
        assert(self.nftProvider.borrow() != nil, message: "Missing or mis-typed ZeedzINO.Collection provider")
        self.storefront = signer.borrow<&NFTStorefront.Storefront>(from: NFTStorefront.StorefrontStoragePath)
            ?? panic("Missing or mis-typed NFTStorefront Storefront")
        self.storefrontPublic = signer.getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(NFTStorefront.StorefrontPublicPath)
        assert(self.storefrontPublic.borrow() != nil, message: "Could not borrow public storefront from address")
    }
    execute {
        // Remove old listing
        if let listingID = ZeedzMarketplace.getListingID(nftType: Type<@ZeedzINO.NFT>(), nftID: saleItemID) {
            let listingIDs = self.storefront.getListingIDs()
            if listingIDs.contains(listingID) {
                self.storefront.removeListing(listingResourceID: listingID)
            }
            ZeedzMarketplace.removeListing(id: listingID)
        }
        // Create SaleCuts
        var saleCuts: [NFTStorefront.SaleCut] = []
        var remainingPrice = saleItemPrice
        if let requirements = ZeedzMarketplace.getVaultTypeSaleCutRequirements(vaultType: Type<@FUSD.Vault>()) {
            for requirement in requirements {
                let price = saleItemPrice * requirement.ratio
                saleCuts.append(NFTStorefront.SaleCut(
                    receiver: requirement.receiver,
                    amount: price
                ))
                remainingPrice = remainingPrice - price
            }
        }
        saleCuts.append(NFTStorefront.SaleCut(
            receiver: self.fusdReceiver,
            amount: remainingPrice
        ))
        // Add listing
        let id = self.storefront.createListing(
            nftProviderCapability: self.nftProvider,
            nftType: Type<@ZeedzINO.NFT>(),
            nftID: saleItemID,
            salePaymentVaultType: Type<@FUSD.Vault>(),
            saleCuts: saleCuts
        )
        ZeedzMarketplace.addListing(id: id, storefrontPublicCapability: self.storefrontPublic)
    }
}