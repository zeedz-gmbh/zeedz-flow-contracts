import NonFungibleToken from 0xNON_FUNGIBLE_TOKEN
import ZeedzINO from 0xZEEDZ_INO

// This transction uses the Administrator resource to mint a new NFT.
//
// It must be run with the account that has the minter resource
// stored at path /storage/ZeedzINOMinter.

transaction(recipient: Address, zeedles: [{String : String}]) {
    
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

          // mint the NFTs and deposit it to the recipient's collection
          for zeedle in zeedles {
            self.minter.mintNFT(recipient: receiver, name: zeedle["name"]!, description: zeedle["description"]!, typeID: stringToUInt32(zeedle["typeID"]!), serialNumber: zeedle["serialNumber"]!, edition: stringToUInt32(zeedle["edition"]!), editionCap: stringToUInt32(zeedle["editionCap"]!), evolutionStage: stringToUInt32(zeedle["evolutionStage"]!), rarity: zeedle["rarity"]!, imageURI: zeedle["imageURI"]!)
          }
      }
  }

pub fun stringToUInt32(_ string: String): UInt32{
    var number = 0
    var i = 0
    while i < string.length {
        number = number + getDigit(string.slice(from: i, upTo: i+1))*powerOf(10,string.length - i - 1 )
        i = i + 1;
    }
    return UInt32(number)
}

pub fun getDigit(_ string: String): Int {
    let digits: {String: Int} = {"0" : 0, "1" : 1, "2" :2, "3" :3, "4" :4, "5": 5, "6" :6, "7" :7, "8": 8, "9" :9}
    return digits[string]!
}

pub fun powerOf(_ base: Int,_ exponent: Int): Int {
    var i = 0
    var number = 1
    while i < exponent {
        if (exponent > 0 ) {
            number = number * base
            i = i + 1;
        } 
        if (exponent == 0) {
            break
        }
         if (exponent < 0) {
            number = number / base
            i = i - 1;
        }
    }
    return number
}