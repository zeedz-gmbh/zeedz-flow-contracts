import ZeedzMarketplace from "../../contracts/ZeedzMarketplace.cdc"
import FlowToken from "../../contracts/FlowToken.cdc"
import FungibleToken from "../../contracts/FungibleToken.cdc"

// Used by admin to forcefully remove a listing withouth cheking if it has been removed or purchased.
transaction(listingID: UInt64) {

    prepare(signer: AuthAccount) {
        let admin = signer.borrow<&ZeedzMarketplace.Administrator>(from: ZeedzMarketplace.ZeedzMarketplaceAdminStoragePath)
            ?? panic("Cannot borrow marketplace admin")
        admin.forceRemoveListing(id: listingID)
    }
}