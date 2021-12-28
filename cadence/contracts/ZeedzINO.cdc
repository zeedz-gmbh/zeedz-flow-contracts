import NonFungibleToken from "./NonFungibleToken.cdc"

/*
    The official ZeedzINO contract
*/
pub contract ZeedzINO: NonFungibleToken {

    // Events
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event Minted(id: UInt64, metadata: {String : String})
    pub event Burned(id: UInt64, from: Address?)
    pub event ZeedleLeveledUp(id: UInt64)

    // Named Paths
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let AdminStoragePath: StoragePath
    pub let AdminPrivatePath: PrivatePath

    pub var totalSupply: UInt64

    pub var numberMintedPerType: {UInt32: UInt64}

    pub resource NFT: NonFungibleToken.INFT {
        pub let id: UInt64
        pub let typeID: UInt32 // Zeedle type -> e.g "1 = Ginger, 2 = Aloe etc"
        pub var level: UInt32 // Zeedle level
        access(self) let metadata: {String: String} // Additional metadata

        init(initID: UInt64, initTypeID: UInt32, initMetadata: {String: String}) {
            self.id = initID
            self.typeID = initTypeID
            self.level = 0
            self.metadata = initMetadata
        }

        pub fun getMetadata(): {String: String} {
            return self.metadata
        }

        access(contract) fun levelUp() {
            self.level = self.level + (1 as UInt32)
        }
    }

    /* 
        This is the interface that users can cast their Zeedz Collection as
        to allow others to deposit Zeedles into their Collection. It also allows for reading
        the details of Zeedles in the Collection.
    */ 
    pub resource interface ZeedzCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun burn(burnID: UInt64)
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowZeedle(id: UInt64): &ZeedzINO.NFT? {
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow Zeedle reference: The ID of the returned reference is incorrect"
            }
        }
    }

    /* 
        A collection of Zeedz NFTs owned by an account
    */
    pub resource Collection: ZeedzCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {

        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        pub fun burn(burnID: UInt64){
            let token <- self.ownedNFTs.remove(key: burnID) ?? panic("missing NFT")
            let zeedle <- token as! @ZeedzINO.NFT

            // reduce numberOfMinterPerType and totalSupply
            ZeedzINO.numberMintedPerType[zeedle.typeID] = ZeedzINO.numberMintedPerType[zeedle.typeID]! - (1 as UInt64)
            ZeedzINO.totalSupply = ZeedzINO.totalSupply - (1 as UInt64)

            destroy zeedle
            emit Burned(id: burnID, from: self.owner?.address)
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @ZeedzINO.NFT
            let id: UInt64 = token.id
            // add the new token to the dictionary which removes the old one
            let oldToken <- self.ownedNFTs[id] <- token
            emit Deposit(id: id, to: self.owner?.address)
            destroy oldToken
        }

        /*
            Returns an array of the IDs that are in the collection
         */
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        /*
            Gets a reference to an NFT in the collection
            so that the caller can read its metadata and call its methods
        */
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return &self.ownedNFTs[id] as &NonFungibleToken.NFT
        }

        /*
            borrowZeedle
            Gets a reference to an NFT in the collection as a Zeed,
            exposing all of its fields
            this is safe as there are no functions that can be called on the Zeed.
        */
        pub fun borrowZeedle(id: UInt64): &ZeedzINO.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
                return ref as! &ZeedzINO.NFT
            } else {
                return nil
            }
        }

        destroy() {
            destroy self.ownedNFTs
        }

        init () {
            self.ownedNFTs <- {}
        }
    }

    /*
        Public function that anyone can call to create a new empty collection
    */ 
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    /*
        AdminClient interface used to add the Admin capability to a user
    */
    pub resource interface AdminClient {
        pub fun addCapability(_ cap: Capability<&Administrator>)
        pub fun isAdmin(): Bool
    }

    /*
       AdminClientReciever resrouce used to store the Administrator capabilities
    */
    pub resource AdminClientReciever: AdminClient {

        access(self) var server: Capability<&Administrator>?

        init() {
            self.server = nil
        }

        pub fun addCapability(_ cap: Capability<&Administrator>) {
            pre {
                cap.check() : "Invalid server capablity"
                self.server == nil : "Server already set"
            }
            self.server = cap
        }

        /*
            Delegate minting to Administrator if the admin capability is set
        */
        pub fun mintNFT(recipient: &{NonFungibleToken.CollectionPublic}, typeID: UInt32, metadata: {String : String}) {
            pre {
                self.server != nil: 
                    "Cannot mint without admin capability"
            }
            self.server!.borrow()!.mintNFT(recipient: recipient, typeID: typeID, metadata: metadata)
        }

        /*
            Delegate level-up to Administrator if the admin capability is set
        */
        pub fun levelUpZeedle(zeedleRef: &ZeedzINO.NFT) {
            pre {
                self.server != nil: 
                    "Cannot level-up without admin capability"
            }
            self.server!.borrow()!.levelUpZeedle(zeedleRef: zeedleRef)
        }

        /*
            Check if the admin capability is set
        */
        pub fun isAdmin(): Bool {
            if (self.server != nil){ 
                    return true
            }
            return false
        }
    }

    /*
        The Admin/Minter resource than an Administrator or something similar would own to be able to mint & level-up NFT's
    */
    pub resource Administrator {

        /*
            Mints a new NFT with a new ID
            and deposit it in the recipients collection using their collection reference
        */
        pub fun mintNFT(recipient: &{NonFungibleToken.CollectionPublic}, typeID: UInt32, metadata: {String : String}) {
            emit Minted(id: ZeedzINO.totalSupply, metadata: metadata)
            recipient.deposit(token: <-create ZeedzINO.NFT(initID: ZeedzINO.totalSupply, initTypeID: typeID, metadata: metadata))

            // increase numberOfMinterPerType and totalSupply
            ZeedzINO.totalSupply = ZeedzINO.totalSupply + (1 as UInt64)
            if ZeedzINO.numberMintedPerType[typeID] == nil {
                ZeedzINO.numberMintedPerType[typeID] = 1 
            } else {
                ZeedzINO.numberMintedPerType[typeID] = ZeedzINO.numberMintedPerType[typeID]! + (1 as UInt64)
            }
        }

        /*
            Increse the Zeedle's level by 1
        */
        pub fun levelUpZeedle(zeedleRef: &ZeedzINO.NFT) {
            zeedleRef.levelUp()
            emit ZeedleLeveledUp(id: zeedleRef.id)
        }

        /*
            Create an AdminClientReciever
        */ 
        pub fun createAdminClientReciever(): @AdminClientReciever {
            return <- create AdminClientReciever()
        }
    }

    /*
        Get a reference to a Zeedle from an account's Collection, if available.
        If an account does not have a Zeedz.Collection, panic.
        If it has a collection but does not contain the zeedleId, return nil.
        If it has a collection and that collection contains the zeedleId, return a reference to that.
    */
    pub fun fetch(_ from: Address, zeedleID: UInt64): &ZeedzINO.NFT? {
        let collection = getAccount(from)
            .getCapability(ZeedzINO.CollectionPublicPath)!
            .borrow<&ZeedzINO.Collection{ZeedzINO.ZeedzCollectionPublic}>()
            ?? panic("Couldn't get collection")
        return collection.borrowZeedle(id: zeedleID)
    }


    init() {
        self.CollectionStoragePath = /storage/ZeedzINOCollection
        self.CollectionPublicPath = /public/ZeedzINOCollection
        self.AdminStoragePath = /storage/ZeedzINOMinter
        self.AdminPrivatePath=/private/ZeedzINOAdminPrivate

        self.AdminClientPublicPath= /public/ZeedzINOAdminClient
        self.AdminClientStoragePath=/storage/ZeedzINOAdminClien

        self.totalSupply = 0
        self.numberMintedPerType = {}

        self.account.save(<- create Administrator(), to: self.AdminStoragePath)
        self.account.link<&Administrator>(self.AdminPrivatePath, target: self.AdminStoragePath)

        emit ContractInitialized()
    }
}