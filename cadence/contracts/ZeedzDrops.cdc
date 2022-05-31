import FungibleToken from 0xFUNGIBLE_TOKEN

pub contract ZeedzDrops {

    pub event ProductPurchased(productID: UInt64, details: ProductDetails, currency: String, userID: String)

    pub event ProductAdded(productID: UInt64, productDetails: ProductDetails)

    pub event ProductsReserved(productID: UInt64, amount: UInt64)

    pub event ProductRemoved(productID: UInt64)

    pub let ZeedzDropsStoragePath: StoragePath

    pub let ZeedzDropsPublicPath: PublicPath

    access(contract) var saleCutRequirements: {String : [SaleCutRequirement]}

    pub struct SaleCutRequirement {
        pub let receiver: Capability<&{FungibleToken.Receiver}>

        pub let ratio: UFix64

        init(receiver: Capability<&{FungibleToken.Receiver}>, ratio: UFix64) {
            pre {
                ratio <= 1.0: "ratio must be less than or equal to 1.0"
                receiver.borrow() != nil: "invalid reciever capability"
            }
            self.receiver = receiver
            self.ratio = ratio
        }
    }

    pub struct ProductDetails {
        // product name
        pub let name: String

        // description
        pub let description: String

        // product id
        pub let id: String

        // total product item quantity
        pub let total: UInt64

        // {Type of the FungibleToken => price}
        access(contract) var prices: {String : UFix64}

        // total products sold
        pub var sold: UInt64

        // total products reserved
        pub var reserved: UInt64

        // if true, the product is buyable
        pub var saleEnabled: Bool

        // product sale start timestamp
        pub var timeStart: UFix64

        // product sale start timestamp
        pub var timeEnd: UFix64

        init (
            name: String,
            description: String,
            id: String,
            total: UInt64,
            saleEnabled: Bool,
            timeStart: UFix64,
            timeEnd: UFix64,
            prices: {String: UFix64},
        ) {
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

        access(contract) fun setSaleEnabledStatus(status: Bool) {
            self.saleEnabled = status
        }

        access(contract) fun setStartTime(startTime: UFix64) {
            assert(self.timeEnd > startTime, message: "startTime should be lesser than endTime")
            self.timeStart = startTime
        }

        access(contract) fun setEndTime(endTime: UFix64) {
            assert(endTime > self.timeStart, message: "endTime should be grater than startTime")
            self.timeEnd = endTime
        }

        access(contract) fun setSoldAfterPurchase() {
            self.sold = self.sold + 1
        }

        access(contract) fun reserve(amount: UInt64) {
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
        pub fun getDetails(): ProductDetails
    }

    pub resource interface ProductsManager {
        pub fun setSaleEnabledStatus(productID: UInt64, status: Bool)
        pub fun setStartTime(productID: UInt64, startTime: UFix64)
        pub fun setEndTime(productID: UInt64, endTime: UFix64)
        pub fun reserve(productID: UInt64, amount: UInt64)
        pub fun removeProduct(productID: UInt64)
        pub fun purchase(productID: UInt64, payment: @FungibleToken.Vault, vaultType: Type, userID: String)
        pub fun purchaseWithDiscount(
            productID: UInt64,
            payment: @FungibleToken.Vault,
            discount: UFix64,
            vaultType: Type,
            userID: String)
        pub fun addProduct(
            name: String, 
            description: String, 
            id: String, 
            total: UInt64, 
            saleEnabled: Bool, 
            timeStart: UFix64, 
            timeEnd: UFix64, 
            prices: {String : UFix64}): UInt64
        pub fun setPrices(productID: UInt64, prices: {String : UFix64})
    }

    pub resource interface DropsManager {
        pub fun updateSaleCutRequirement(requirements: [SaleCutRequirement], vaultType: Type)
    }

    pub resource interface DropsPublic {
        pub fun getProductIDs(): [UInt64]
        pub fun borrowProduct(id: UInt64): &Product?
    }

    pub resource Product: ProductPublic {
  
        access(contract) let details: ProductDetails

        pub fun getDetails(): ProductDetails {
            return self.details
        }

        access(contract) fun purchase(payment: @FungibleToken.Vault, vaultType: Type, userID: String) {
            pre {
                self.details.saleEnabled == true: "the sale of this product is disabled"
                (self.details.total - self.details.sold) > 0: "these products are sold out"
                payment.isInstance(vaultType): "payment vault is not requested fungible token type"
                payment.balance == self.details.prices[vaultType.identifier]: "payment vault does not contain requested price"
                getCurrentBlock().timestamp > self.details.timeStart: "the sale of this product has not started yet"
                getCurrentBlock().timestamp < self.details.timeEnd: "the sale of this product has ended"
                ZeedzDrops.saleCutRequirements[vaultType.identifier] != nil: "sale cuts not set for requested fungible token"
            }

            var residualReceiver: &{FungibleToken.Receiver}? = nil

            for cut in ZeedzDrops.saleCutRequirements[vaultType.identifier]! {
                if let receiver = cut.receiver.borrow() {
                   let paymentCut <- payment.withdraw(amount: cut.ratio * self.details.prices[vaultType.identifier]!)
                    receiver.deposit(from: <-paymentCut)
                    if (residualReceiver == nil) {
                        residualReceiver = receiver
                    }
                }
            }

            assert(residualReceiver != nil, message: "no valid payment receivers")

            residualReceiver!.deposit(from: <-payment)

            self.details.setSoldAfterPurchase()

            emit ProductPurchased(productID: self.uuid, details: self.details, currency: vaultType.identifier, userID: userID)
        }

        access(contract) fun purchaseWithDiscount(payment: @FungibleToken.Vault, discount: UFix64, productID: UInt64, vaultType: Type, userID: String) {
             pre {
                discount < 1.0: "discount cannot be higher than 100%"
                self.details.saleEnabled == true: "the sale of this product is disabled"
                (self.details.total - self.details.sold) > 0: "these products are sold out"
                payment.isInstance(vaultType): "payment vault is not requested fungible token type"
                (payment.balance) == self.details.prices[vaultType.identifier]!*(1.0-discount): "payment vault does not contain requested price"
                getCurrentBlock().timestamp > self.details.timeStart: "the sale of this product has not started yet"
                getCurrentBlock().timestamp < self.details.timeEnd: "the sale of this product has ended"
                ZeedzDrops.saleCutRequirements[vaultType.identifier] != nil: "sale cuts not set for requested fungible token"
            }

            var residualReceiver: &{FungibleToken.Receiver}? = nil

            for cut in ZeedzDrops.saleCutRequirements[vaultType.identifier]! {
                if let receiver = cut.receiver.borrow() {
                   let paymentCut <- payment.withdraw(amount: cut.ratio * self.details.prices[vaultType.identifier]!*(1.0-discount))
                    receiver.deposit(from: <-paymentCut)
                    if (residualReceiver == nil) {
                        residualReceiver = receiver
                    }
                }
            }

            assert(residualReceiver != nil, message: "no valid payment receivers")

            residualReceiver!.deposit(from: <-payment)

            self.details.setSoldAfterPurchase()

            emit ProductPurchased(productID: self.uuid, details: self.details, currency: vaultType.identifier, userID: userID)
        }

        destroy () {
            emit ProductRemoved(
                productID: self.uuid,
            )
        }

        init (
            name: String, 
            description: String, 
            id: String, 
            total: UInt64, 
            saleEnabled: Bool, 
            timeStart: UFix64, 
            timeEnd: UFix64, 
            prices: {String : UFix64}) {
            self.details = ProductDetails(
                name: name, 
                description: description, 
                id: id, 
                total: total, 
                saleEnabled: saleEnabled, 
                timeStart: timeStart, 
                timeEnd: timeEnd, 
                prices: prices
                )
        }
    }

    pub resource DropsAdmin: ProductsManager, DropsManager, DropsPublic {
        pub fun addProduct(
            name: String, 
            description: String, 
            id: String, 
            total: UInt64, 
            saleEnabled: Bool, 
            timeStart: UFix64, 
            timeEnd: UFix64, 
            prices: {String : UFix64}
            ): UInt64 {
            let product <- create Product(
                        name: name, 
                        description: description, 
                        id: id,
                        total: total,
                        saleEnabled: saleEnabled,
                        timeStart: timeStart,
                        timeEnd: timeEnd,
                        prices: prices
                    )

            let productID = product.uuid

            let details = product.getDetails()
            
            let oldProduct <- self.products[productID] <- product
            // Note that oldProduct will always be nil, but we have to handle it.
            destroy oldProduct

            emit ProductAdded(
                productID: productID,
                productDetails: details
            )

            return productID
        }

        access(contract) var products: @{UInt64: Product}

        pub fun reserve(productID: UInt64, amount: UInt64) {
            let product = self.borrowProduct(id: productID) ?? panic("not able to borrow specified product")
            assert(product.details.total - product.details.sold >= amount, message: "reserve amount can't be higher than available pack amount")
            product.details.reserve(amount: amount)
            emit ProductsReserved(productID: productID, amount: amount)

        }
        pub fun removeProduct(productID: UInt64) {
            pre {
                self.products[productID] != nil: "could not find product with given id"
            }
            let product <- self.products.remove(key: productID)!
            destroy product
        }

        pub fun setSaleEnabledStatus(productID: UInt64, status: Bool) {
            let product = self.borrowProduct(id: productID) ?? panic("not able to borrow specified product")
            product.details.setSaleEnabledStatus(status: status)
        }

        pub fun setStartTime(productID: UInt64, startTime: UFix64,) {
            let product = self.borrowProduct(id :productID) ?? panic("not able to borrow specified product")
            product.details.setStartTime(startTime: startTime)
        }

        pub fun setEndTime(productID: UInt64, endTime: UFix64) {
            let product = self.borrowProduct(id :productID) ?? panic("not able to borrow specified product")
            product.details.setEndTime(endTime: endTime)
        }

        pub fun purchase(productID: UInt64, payment: @FungibleToken.Vault, vaultType: Type, userID: String) {
            let product = self.borrowProduct(id: productID) ?? panic("not able to borrow specified product")
            product.purchase(payment: <- payment, vaultType: vaultType, userID: userID)
        }

        pub fun purchaseWithDiscount(productID: UInt64, payment: @FungibleToken.Vault, discount: UFix64, vaultType: Type, userID: String) {
            let product = self.borrowProduct(id: productID) ?? panic("not able to borrow specified product")
            product.purchaseWithDiscount(payment: <- payment, discount: discount, productID: productID, vaultType: vaultType, userID: userID)
        }

        pub fun updateSaleCutRequirement(requirements: [SaleCutRequirement], vaultType: Type) {
            var totalRatio: UFix64 = 0.0
            for requirement in requirements {
                totalRatio = totalRatio + requirement.ratio
            }
            assert(totalRatio <= 1.0, message: "total ratio must be less than or equal to 1.0")
            ZeedzDrops.saleCutRequirements[vaultType.identifier] = requirements
        }

        pub fun setPrices(productID: UInt64, prices: {String : UFix64}) {
            let product = self.borrowProduct(id: productID) ?? panic("not able to borrow specified product")
            product.details.setPrices(prices: prices)
        }

        pub fun getProductIDs(): [UInt64] {
            return self.products.keys
        }

        pub fun borrowProduct(id: UInt64): &ZeedzDrops.Product? {
            return (&self.products[id] as &ZeedzDrops.Product?)!
        }

        destroy () {
            destroy self.products
        }

        init(){
             self.products <- {}
        }
    }

    pub fun getAllSaleCutRequirements(): {String: [SaleCutRequirement]} {
        return self.saleCutRequirements
    }

    pub fun getAllProductIDs(): [UInt64]? {
        let capabaility =  self.account.getCapability<&ZeedzDrops.DropsAdmin{ZeedzDrops.DropsPublic}>(ZeedzDrops.ZeedzDropsPublicPath)
        if capabaility.check() {
            let drops = capabaility.borrow()
            return drops!.getProductIDs()
        } else {
            return nil
        }
    }

    pub fun getProduct(id: UInt64): &Product? {
        let capabaility =  self.account.getCapability<&ZeedzDrops.DropsAdmin{ZeedzDrops.DropsPublic}>(ZeedzDrops.ZeedzDropsPublicPath)
        if capabaility.check() {
            let drops = capabaility.borrow()
            return drops!.borrowProduct(id: id)
        } else {
            return nil
        }
    }

    init () {
        self.ZeedzDropsStoragePath = /storage/ZeedzDrops
        self.ZeedzDropsPublicPath= /public/ZeedzDrops
        self.saleCutRequirements = {}

        let admin <- create DropsAdmin()
        self.account.save(<-admin, to: self.ZeedzDropsStoragePath)
        self.account.link<&ZeedzDrops.DropsAdmin{ZeedzDrops.DropsPublic}>(self.ZeedzDropsPublicPath, target: self.ZeedzDropsStoragePath)
    }
}