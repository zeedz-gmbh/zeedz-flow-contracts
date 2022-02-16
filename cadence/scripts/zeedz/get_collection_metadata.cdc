import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import ZeedzINO from "../../contracts/ZeedzINO.cdc"

/*
    This script returns an array of all the Zeedz NFT IDs in an account's collection.
*/

pub fun main(address: Address): [{String: AnyStruct}] {
    let account = getAccount(address)

    let collectionRef = account.getCapability(ZeedzINO.CollectionPublicPath)!.borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")

    let collectionBorrow = account.getCapability(ZeedzINO.CollectionPublicPath)!.borrow<&{ZeedzINO.ZeedzCollectionPublic}>() 
        ?? panic("Could not borrow ZeedzCollectionPublic")
    
    let ids = collectionRef.getIDs()

    let returnArray: [{String: AnyStruct}] = [ ]

    for id in ids {
        let zeedle = collectionBorrow.borrowZeedle(id: id)
            ?? panic("No such zeedleID in that collection")
        let zeedleMetadata = zeedle.getMetadata()
        returnArray.append(zeedleMetadata)
    }
   
    return returnArray
}