pub contract ZeedzDrops {

    pub event PackPurchased(packName: String, userID: String)

    pub event PackAdded(packID: UInt64)

    pub let ZeedzDropsAdminStoragePath: StoragePath

    pub struct PackDetails {
        // pack name
        pub let name: String

        // description
        pub let description: String

        // total pack item quantity
        pub let total: UInt64

        init (
           name: String, description: String, total: UInt64
        ) {
            self.name = name
            self.description = description
            self.total = total
        }
    }


    pub resource interface PackPublic {
        pub fun purchase(payment: @FungibleToken.Vault)
        pub fun getDetails(packID: UInt64): PackDetails
        pub fun getSaleEnabledStatus(): Bool 
        pub fun getDetails(): PackDetails
        pub fun getStartTime(): UFix64 
        pub fun getEndTime(): UFix64
        pub fun getPrices(): {String : UFix64}
        pub fun getSold(): UInt64
    }

    pub resource interface PackManage {
        pub fun setSaleEnabledStatus(status: Bool)
        pub fun setStartTime(startTime: UFix64)
        pub fun setEndTime(endTime: UFix64)
    }


    pub resource interface PacksAdmin {
        pub fun removePack(packID: UInt64)
        pub fun addPack(total: UInt64, timeStart: UFix64, timeEnd: UFix64, prices: {String : UFix64})
    }

    pub resource Pack: PackPublic {
        // static pack details
        access(self) let details: PackDetails

        // total packs sold
        access(contract) var sold: UInt64

        // if true, the pack is buyable
        access(contract) var saleEnabled: Bool

        // pack sale start timestamp
        access(contract) var timeStart: UFix64

        // pack sale start timestamp
        access(contract) var timeEnd: UFix64

        // {Type of the FungibleToken => price}
        access(contract) let prices: {String : UFix64}

        pub fun getSaleEnabledStatus(): Bool {
            retrun self.saleEnabled
        }

        pub fun getDetails(): PackDetails {
            return self.details
        }

        pub fun getStartTime(): UFix64 {
            return self.timeStart
        }

        pub fun getEndTime(): UFix64 {
            return self.timeEnd
        }

        pub fun getPrices(): {String : UFix64} {
            retrun self.prices
        }

        pub fun getSold(): UInt64 {
            return self.sold
        }
    }

    pub resource Administrator: PackManage, PacksAdmin {

    }

    init () {
        self.ZeedzDropsAdminStoragePath = /storage/ZeedzDropsAdmin

        let admin <- create Administrator()
        self.account.save(<-admin, to: self.ZeedzDropsAdminStoragePath)
    }
}