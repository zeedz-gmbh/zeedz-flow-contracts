import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import ZeedzItems from "../../contracts/ZeedzItems.cdc"

// This transction uses the NFTMinter resource to mint a new NFT.
//
// It must be run with the account that has the minter resource
// stored at path /storage/ZeedzItemsMinter.

transaction(recipient: Address, typeID: UInt64, metadata: {String : String}) {
    
    // local variable for storing the minter reference
   let minter: &ZeedzItems.Administrator

    prepare(signer: AuthAccount) {
        // borrow a reference to the Administrator resource in storage
       self.minter = signer.getCapability(ZeedzItems.AdminPrivatePath)
            .borrow<&ZeedzItems.Administrator>()!
    }


    execute {
        // get the public account object for the recipient
        let recipient = getAccount(recipient)

        // borrow the recipient's public NFT collection reference
        let receiver = recipient
            .getCapability(ZeedzItems.CollectionPublicPath)!
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")

        // mint the NFT and deposit it to the recipient's collection
        self.minter.mintNFT(recipient: receiver, typeID: typeID, metadata: metadata)
    }
}