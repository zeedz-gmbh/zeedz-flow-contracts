import ZeedzMarketplace from 0xZEEDZ_MARKETPLACE
import FlowToken from 0xFLOW_TOKEN
import FungibleToken from 0xFUNGIBLE_TOKEN

// Used by admin to forcefully remove a listing withouth cheking if it has been removed or purchased.
transaction(listingID: UInt64) {

    prepare(signer: AuthAccount) {
        let admin = signer.borrow<&ZeedzMarketplace.Administrator>(from: ZeedzMarketplace.ZeedzMarketplaceAdminStoragePath)
            ?? panic("Cannot borrow marketplace admin")
        admin.forceRemoveListing(id: listingID)
    }
}