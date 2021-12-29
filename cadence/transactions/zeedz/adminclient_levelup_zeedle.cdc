import ZeedzINO from "../../contracts/ZeedzINO.cdc"

transaction(zeedleID: UInt64) {

    // local variable for storing the adminClientRef reference
    let adminClientRef: &ZeedzINO.ZeedzINOAdminClient
    // local variable for storing the Zeedle reference
    let zeedleRef: &ZeedzINO.NFT

    prepare(owner: AuthAccount, admin: AuthAccount) {
        // borrow a reference to the Administrator resource in storage
        self.adminClientRef = admin.borrow<&ZeedzINO.ZeedzINOAdminClient>(from: ZeedzINO.AdminClientStoragePath)
            ?? panic("Signer is not an admin")

        // borrow a reference to the Owner's collection
        let collectionBorrow = owner.getCapability(ZeedzINO.CollectionPublicPath)!
            .borrow<&{ZeedzINO.ZeedzCollectionPublic}>()
            ?? panic("Could not borrow ZeedzCollectionPublic")

        // borrow a reference to the Zeedle
        self.zeedleRef = collectionBorrow.borrowZeedle(id: zeedleID)
            ?? panic("No such zeedleID in that collection")
    }

    execute {
        self.adminClientRef.levelUpZeedle(zeedleRef: self.zeedleRef)
    }
}