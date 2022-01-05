import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import ZeedzINO from "../../contracts/ZeedzINO.cdc"

// This transction uses the Administrator resource to mint a new NFT.
//
// It must be run with the account that has the minter resource
// stored at path /storage/ZeedzINOMinter.

transaction(recipient: Address, name: String, description: String, typeID: UInt32, serialNumber: String, edition: UInt32, editionCap: UInt32, evolutionStage: UInt32, rarity: String, imageURI: String) {
    
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
        self.minter.mintNFT(recipient: receiver, name: name, description: description, typeID: typeID, serialNumber: serialNumber, edition: edition, editionCap: editionCap, evolutionStage: evolutionStage, rarity: rarity, imageURI: imageURI)
    }
}