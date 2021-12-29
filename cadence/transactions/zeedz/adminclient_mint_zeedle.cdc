import ZeedzINO from "../../contracts/ZeedzINO.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"

transaction(recipient: Address, typeID: UInt32, metadata: {String : String}) {

    // local variable for storing the adminClientRef reference
    let adminClientRef: &ZeedzINO.ZeedzINOAdminClient

    prepare(admin: AuthAccount) {
        // borrow a reference to the Administrator resource in storage
        self.adminClientRef = admin.borrow<&ZeedzINO.ZeedzINOAdminClient>(from: ZeedzINO.AdminClientStoragePath)
            ?? panic("Signer is not an admin")
    }

    execute {
        
        // get the public account object for the recipient
        let recipient = getAccount(recipient)

        // borrow the recipient's public NFT collection reference
        let receiver = recipient
            .getCapability(ZeedzINO.CollectionPublicPath)!
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")
        
        self.adminClientRef.mintNFT(recipient: receiver, typeID: typeID, metadata: metadata)
    }
}