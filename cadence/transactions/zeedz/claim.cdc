import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import ZeedzINO from "../../contracts/ZeedzINO.cdc"
import FungibleToken from "../../contracts/FungibleToken.cdc"

transaction(claimIDs: [UInt64]) {
    prepare(recipient: AuthAccount, admin: AuthAccount) {
        // Initialize the colleciton
        if recipient.borrow<&ZeedzINO.Collection>(from: ZeedzINO.CollectionStoragePath) == nil {
                recipient.save(<-ZeedzINO.createEmptyCollection(), to: ZeedzINO.CollectionStoragePath)
                recipient.unlink(ZeedzINO.CollectionPublicPath)
                recipient.link<&ZeedzINO.Collection{NonFungibleToken.CollectionPublic, ZeedzINO.ZeedzCollectionPublic}>(ZeedzINO.CollectionPublicPath, target: ZeedzINO.CollectionStoragePath)
            }

        // Get admin collection reference
        let adminRef = admin.borrow<&ZeedzINO.Collection>(from: ZeedzINO.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the admin's collection")

        // Get recipient capability reference
        let depositRef = recipient.getCapability(ZeedzINO.CollectionPublicPath)!.borrow<&{NonFungibleToken.CollectionPublic}>()!

        // Claim all NFTs
        for claimID in claimIDs {
            //  Transfer amount
            let amount: UFix64 = 0.00002

            //  Withdraw "amount" from admin and store in a temporary "transfer" vault
            let transfer <- admin.borrow<&{FungibleToken.Provider}>(from: /storage/flowTokenVault)!.withdraw(amount: amount)

            //  Deposit "amount" from temporary "transfer" vault into "to" accounts public receiver
            recipient.getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver).borrow()!.deposit(from: <- transfer)

            //  Deposit NFT
            let nft <- adminRef.withdraw(withdrawID: claimID)
            depositRef.deposit(token: <-nft)
        }
    }
}