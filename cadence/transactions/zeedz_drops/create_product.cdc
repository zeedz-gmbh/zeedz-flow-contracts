import ZeedzDrops from "../contracts/ZeedzDrops.cdc"

transaction(name: String, description: String, id: UInt64, total: UInt64, saleEnabled: Bool, timeStart: UFix64, timeEnd: UFix64, prices: {String : UFix64}) {

    let dropsAdmin: &ZeedzDrops.Drops{ZeedzDrops.ProductsManager}

    prepare(acct: AuthAccount) {
        self.dropsAdmin = acct.borrow<&ZeedzDrops.Drops{ZeedzDrops.ProductsManager}>(from: ZeedzDrops.ZeedzDropsStoragePath)
            ?? panic("Missing or mis-typed NFTStorefront.Storefront")
    }

    execute {
        self.dropsAdmin.addProduct(name: name, description: description, id: id, total: total, saleEnabled: saleEnabled, timeStart: timeStart, timeEnd: timeEnd, prices: prices)
    }
}