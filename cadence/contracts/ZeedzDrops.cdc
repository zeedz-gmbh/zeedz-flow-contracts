pub contract ZeedzDrops {

    pub event ProductPurchased(packID: UInt64, details: ProductDetails, currency: String, userID: String)

    pub event ProductAdded(packID: UInt64, packDetails: ProductDetails)

    pub event ProductsReserved(packID: UInt64, amount: UInt64)

    pub event ProductRemoved(packID: UInt64)

    pub let ZeedzDropsAdminStoragePath: StoragePath

    access(contract) var saleCutRequirements: {String : [SaleCutRequirement]}

    access(contract) var packs: @{UInt64: Product}

    pub struct SaleCutRequirement {
        pub let receiver: Capability<&{FungibleToken.Receiver}>

        pub let ratio: UFix64

        init(receiver: Capability<&{FungibleToken.Receiver}>, ratio: UFix64) {
            pre {
                ratio <= 1.0: "ratio must be less than or equal to 1.0"
                reciever.borrow() != nil: "invalid reciever capability"
            }
            self.receiver = receiver
            self.ratio = ratio
        }
    }

    pub struct ProductDetails {
        // pack name
        pub let name: String

        // description
        pub let description: String

        // product id
        pub let id: UInt64

        // total pack item quantity
        pub let total: UInt64

        // {Type of the FungibleToken => price}
        access(contract) prices: {String : UFix64}

        // total packs sold
        pub var sold: UInt64

        // total packs reserved
        pub var reserved: UInt64

        // if true, the pack is buyable
        pub var saleEnabled: Bool

        // pack sale start timestamp
        pub var timeStart: UFix64

        // pack sale start timestamp
        pub var timeEnd: UFix64

        init (
            name: String, 
            description: String, 
            id: UInt64, 
            total: UInt64, 
            saleEnabled: Bool, 
            timeStart: UFix64, 
            timeEnd: UFix64, 
            prices: {String : UFix64}) {
            self.name = name
            self.description = description
            self.id = id
            self.total = total
            self.sold = 0
            self.reserved = 0
            self.timeStart = timeStart
            self.timeEnd = timeEnd
            self.prices = prices
            self.saleEnabled = saleEnabled
        }

        access(contract) fun setSaleEnabledStatus(status: Bool){
            self.saleEnabled = status
        }

        access(contract) fun setStartTime(startTime: UFix64){
            self.timeStart = startTime
        }

        access(contract) fun setEndTime(startTime: UFix64){
            self.timeEnd = endTime
        }

        access(contract) fun setSoldAfterPurchase(){
            self.sold = self.sold + 1
        }

        access(contract) fun reserve(amount: UInt64){
            self.sold = self.sold + amount
            self.reserved = self.reserved + amount
        }

        access(contract) fun setPrices(prices: {String : UFix64}){
            self.prices = prices
        }

        pub fun getPrices(): {String : UFix64} {
            return self.prices
        }
    }


    pub resource interface ProductPublic {
        pub fun purchase(payment: @FungibleToken.Vault, vaultType: Type, userID: String)
        pub fun getDetails(): ProductDetails
    }

    pub resource interface ProductsManager {
        pub fun setSaleEnabledStatus(packID: UInt64, status: Bool)
        pub fun setStartTime(packID: UInt64, startTime: UFix64)
        pub fun setEndTime(packID: UInt64, endTime: UFix64)
        pub fun reserve(packID: UInt64, amount: UInt64)
        pub fun removeProduct(packID: UInt64)
        pub fun purchaseWithDiscount(
            packID: UInt64,
            payment: @FungibleToken.Vault,
            discount: UFix64,
            vaultType: vaultType)
        pub fun addProduct(
            name: String, 
            description: String, 
            id: UInt64, 
            total: UInt64, 
            saleEnabled: Bool, 
            timeStart: UFix64, 
            timeEnd: UFix64, 
            prices: {String : UFix64}): UInt64
        pub fun setPrices(packID: UInt64, prices: {String : UFix64})
    }

    pub resource interface DropsManager {
        pub fun updateSaleCutRequirement(requirements: [SaleCutRequirement], vaultType: Type)
    }

    pub resource Product: ProductPublic {
  
        access(self) let details: ProductDetails

        pub fun getDetails(): ProductDetails {
            return self.details
        }

        pub fun purchase(payment: @FungibleToken.Vault, vaultType: Type, userID: String) {
            pre {
                self.details.saleEnabled == true: "the sale of this pack is disabled"
                (self.details.total - self.details.sold) > 0: "these packs are sold out"
                payment.isInstance(vaultType): "payment vault is not requested fungible token type"
                payment.balance == self.details.prices[vaultType.identifier]: "payment vault does not contain requested price"
                getCurrentBlock().timestamp > self.details.timeStart: "the sale of this pack has not started yet"
                getCurrentBlock().timestamp < self.details.timeEnd: "the sale of this pack has ended"
                self.saleCutRequirements[vaultType.identifier] != nil: "sale cuts not set for requested fungible token"
            }

            var residualReceiver: &{FungibleToken.Receiver}? = nil

            for cut in self.saleCutRequirements[vaultType.identifier] {
                if let receiver = cut.receiver.borrow() {
                   let paymentCut <- payment.withdraw(amount: cut.ratio * self.details.prices[vaultType.identifier])
                    receiver.deposit(from: <-paymentCut)
                    if (residualReceiver == nil) {
                        residualReceiver = receiver
                    }
                }
            }

            assert(residualReceiver != nil, message: "no valid payment receivers")

            residualReceiver!.deposit(from: <-payment)

            self.details.setSoldAfterPurchase()

            emit ProductPurchased(packID: self.uuid, details: self.details, currency: vaultType.identifier, userID: userID)
        }

        access(contract) fun purchaseWithDiscount(payment: @FungibleToken.Vault, discount: UFix64, packID: UInt64, vaultType: Type, userID: String){
             pre {
                discount < 1: "discount cannot be higher than 100%"
                self.details.saleEnabled == true: "the sale of this pack is disabled"
                (self.details.total - self.details.sold) > 0: "these packs are sold out"
                payment.isInstance(vaultType): "payment vault is not requested fungible token type"
                (payment.balance*discount) == self.details.prices[vaultType.identifier]: "payment vault does not contain requested price"
                getCurrentBlock().timestamp > self.details.timeStart: "the sale of this pack has not started yet"
                getCurrentBlock().timestamp < self.details.timeEnd: "the sale of this pack has ended"
                self.saleCutRequirements[vaultType.identifier] != nil: "sale cuts not set for requested fungible token"
            }

            var residualReceiver: &{FungibleToken.Receiver}? = nil

            for cut in self.saleCutRequirements[vaultType.identifier] {
                if let receiver = cut.receiver.borrow() {
                   let paymentCut <- payment.withdraw(amount: cut.ratio * self.details.prices[vaultType.identifier]*discount)
                    receiver.deposit(from: <-paymentCut)
                    if (residualReceiver == nil) {
                        residualReceiver = receiver
                    }
                }
            }

            assert(residualReceiver != nil, message: "no valid payment receivers")

            residualReceiver!.deposit(from: <-payment)

            self.details.setSoldAfterPurchase()

            emit ProductPurchased(packID: self.uuid, details: self.details, currency: vaultType.identifier, userID: userID)
        }

        destroy () {
            emit ProductRemoved(
                packID: self.uuid,
            )
        }

        init (
            name: String, 
            description: String, 
            id: UInt64, 
            total: UInt64, 
            saleEnabled: Bool, 
            timeStart: UFix64, 
            timeEnd: UFix64, 
            prices: {String : UFix64}) {
            self.details = ProductDetails(
              name: String, 
              description: String, 
              id: UInt64, 
              total: UInt64, 
              saleEnabled: Bool, 
              timeStart: UFix64, 
              timeEnd: UFix64, 
              prices: {String : UFix64}
            )
        }
    }

    pub resource Administrator: ProductsManager, DropsManager {
        pub fun addProduct(
            name: String, 
            description: String, 
            id: UInt64, 
            total: UInt64, 
            saleEnabled: Bool, 
            timeStart: UFix64, 
            timeEnd: UFix64, 
            prices: {String : UFix64}): UInt64{
            let pack <- create Product(
                        name: name, 
                        description: description, 
                        id: id,
                        total: total,
                        saleEnabled: saleEnabled,
                        timeStart: timeStart,
                        timeEnd: timeEnd,
                        prices: prices
                    )

            let packID = pack.uuid

            let details = pack.getDetails()

            emit ProductAdded(
                packID: packID,
                packDetails: details
            )

            return packID
        }

        pub fun reserve(packID: UInt64, packID: UInt64, amount: UInt64){
            let pack = self.borrowProduct(packID) ?? panic("not able to borrow specified pack")
            pack.reserve(amount: amount)
            emit ProductsReserved(packID: packID, amount: amount)

        }
        pub fun removeProduct(packID: UInt64){
            pre {
                self.packs[packID] != nil: "could not find pack with given id"
            }
            let pack <- self.packs.remove(key: packID)!
            destroy pack
        }

        pub fun setSaleEnabledStatus(packID: UInt64, status: Bool){
            let pack = self.borrowProduct(packID) ?? panic("not able to borrow specified pack")
            pack.setSaleEnabledStatus(status: status)
        }

        pub fun setStartTime(packID: UInt64, startTime: UFix64,){
            let pack = self.borrowProduct(packID) ?? panic("not able to borrow specified pack")
            pack.setStartTime(startTime: startTime)
        }

        pub fun setEndTime(packID: UInt64, endTime: UFix64){
            let pack = self.borrowProduct(packID) ?? panic("not able to borrow specified pack")
            pack.setEndTime(endTime: endTime)
        }

        pub fun purchaseWithDiscount(packID: UInt64, payment: @FungibleToken.Vault, discount: UFix64, packID: UInt64, vaultType: Type, userID: String){
            let pack = self.borrowProduct(packID) ?? panic("not able to borrow specified pack")
            pack.purchaseWithDiscount(payment, discount, packID, vaultType: vaultType, userID: userID)
        }

        pub fun updateSaleCutRequirement(requirements: [SaleCutRequirement], vaultType: Type) {
            var totalRatio: UFix64 = 0.0
            for requirement in requirements {
                totalRatio = totalRatio + requirement.ratio
            }
            assert(totalRatio <= 1.0, message: "total ratio must be less than or equal to 1.0")
            self..saleCutRequirements[vaultType.identifier] = requirements
        }

        pub fun setPrices(packID: UInt64, prices: {String : UFix64}){
             let pack = self.borrowProduct(packID) ?? panic("not able to borrow specified pack")
            pack.setPrices(prices: prices)
        }

        init(){
             self.packs <- {}
        }
    }

    pub fun getAllSaleCutRequirements(): {String: [SaleCutRequirement]} {
        return self.saleCutRequirements
    }

    pub fun getProductIDs(): [UInt64] {
        return self.packs.keys
    }

    pub fun borrowProduct(id: UInt64): &Product? {
        if self.packs[id] != nil {
            return &self.packs[id] as! &Product
        } else {
            return nil
        }
    }

    init () {
        self.ZeedzDropsAdminStoragePath = /storage/ZeedzDropsAdmin
        self.saleCutRequirements = {}

        let admin <- create Administrator()
        self.account.save(<-admin, to: self.ZeedzDropsAdminStoragePath)
    }
}