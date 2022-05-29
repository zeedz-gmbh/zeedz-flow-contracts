import NonFungibleToken from 0xNON_FUNGIBLE_TOKEN
import ZeedzINO from 0xZEEDZ_INO

transaction(zeedleID: UInt64, amount: UInt64) {

    // local variable for storing the Admin reference
    let adminRef: &ZeedzINO.Administrator
    // local variable for storing the Zeedle reference
    let zeedleRef: &ZeedzINO.NFT

    prepare(owner: AuthAccount, admin: AuthAccount) {
        // borrow a reference to the Owner's collection
        let collectionBorrow = owner.getCapability(ZeedzINO.CollectionPublicPath)!
            .borrow<&{ZeedzINO.ZeedzCollectionPublic}>()
            ?? panic("Could not borrow ZeedzCollectionPublic")

        // borrow a reference to the Zeedle
        self.zeedleRef = collectionBorrow.borrowZeedle(id: zeedleID)
            ?? panic("No such zeedleID in that collection")

        // borrow a reference to the Administrator resource in storage
        self.adminRef= admin.getCapability(ZeedzINO.AdminPrivatePath)
            .borrow<&ZeedzINO.Administrator>()!
    }

    execute {
        self.adminRef.increaseOffset(zeedleRef: self.zeedleRef, amount: amount)
    }
}