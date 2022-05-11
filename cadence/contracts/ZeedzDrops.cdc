pub contract ZeedzDrops {

    pub event PackPurchased(packName: String, userID: String)

    pub event PacksAdded(packID: UInt64)

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


    pub interface PackPublic {
        pub fun purchase(payment: @FungibleToken.Vault)
        pub fun getDetails(): PackDetails
        pub fun getPrices(): {String : UFix64}
    }

    pub resource interface PackManage {
        pub fun setSaleEnabledStatus(status: Bool)
        pub fun setStartTime(startTime: UFix64)
        pub fun setEndTime(endTime: UFix64)
        pub fun reserve(packID: UInt64)
    }


    pub resource interface PacksAdmin {
        pub fun purchaseWithDiscount(payment: @FungibleToken.Vault, discount: UFix64)
        pub fun removePack(packID: UInt64)
        pub fun addPack(total: UInt64, timeStart: UFix64, timeEnd: UFix64, prices: {String : UFix64})
    }

    pub struct Pack: PackPublic {
        // static pack details
        access(self) let details: PackDetails

        // total packs sold
        pub var sold: UInt64

        // if true, the pack is buyable
        pub var saleEnabled: Bool

        // pack sale start timestamp
        pub var timeStart: UFix64

        // pack sale start timestamp
        pub var timeEnd: UFix64

        // {Type of the FungibleToken => price}
        access(contract) let prices: {String : UFix64}

        pub fun getDetails(): PackDetails {
            return self.details
        }

        pub fun getPrices(): {String : UFix64} {
            retrun self.prices
        }

        access(contract) setSaleEnabledStatus(status: Bool){
            self.saleEnabled = status
        }

        access(contract) setStartTime(startTime: UFix64){
            self.timeStart = startTime
        }

        access(contract) setEndTime(startTime: UFix64){
            self.timeEnd = endTime
        }

        access(contract) setStartTime(startTime: UFix64){
            self.startTime = startTime
        }

        access(contract) setSold(sold: UInt64){
            self.sold = sold
        }

        access(contract) reserve(reserved: UInt64){
            self.sold = self.sold - reserved
        }
    }

    pub resource Administrator: PackManage, PacksAdmin {
        pub fun setSaleEnabledStatus(status: Bool){

        }
        pub fun setStartTime(startTime: UFix64){

        }
        pub fun setEndTime(endTime: UFix64){

        }
        pub fun reserve(packID: UInt64){

        }
        pub fun removePack(packID: UInt64){

        }
        pub fun purchaseWithDiscount(payment: @FungibleToken.Vault, discount: UFix64){

        }
        pub fun addPack(total: UInt64, timeStart: UFix64, timeEnd: UFix64, prices: {String : UFix64}){

        }
    }

    init () {
        self.ZeedzDropsAdminStoragePath = /storage/ZeedzDropsAdmin

        self.packs <- {}

        let admin <- create Administrator()
        self.account.save(<-admin, to: self.ZeedzDropsAdminStoragePath)
    }
}