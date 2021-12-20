
   
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import ZeedzINO from "../../contracts/ZeedzINO.cdc"

// This transction uses the Administrator resource to mint a new NFT.
//
// It must be run with the account that has the minter resource
// stored at path /storage/ZeedzINOMinter.

transaction(recipient: Address, typeID: UInt64, metadata: {String : String}) {
    
    // local variable for storing the minter reference
   let minter: &ZeedzINO.Administrator

    prepare(signer: AuthAccount) {
        // borrow a reference to the Administrator resource in storage
       self.minter = signer.getCapability(ZeedzINO.AdminPrivatePath)
            .borrow<&ZeedzINO.Administrator>()!
    }


    execute {
        // get the public account object for the recipient
        let recipient = getAccount(recipient)

        // borrow the recipient's public NFT collection reference
        let receiver = recipient
            .getCapability(ZeedzINO.CollectionPublicPath)!
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")

        // mint the NFT and deposit it to the recipient's collection
        self.minter.mintNFT(recipient: receiver, typeID: typeID, metadata: metadata)
    }
}