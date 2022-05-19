import ZeedzDrops from "../contracts/ZeedzDrops.cdc"

transaction(productID: UInt64, amount: UInt64) {

    let dropsAdmin: &ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}

    prepare(acct: AuthAccount) {
        self.dropsAdmin = acct.borrow<&ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}>(from: ZeedzDrops.ZeedzDropsStoragePath)
            ?? panic("Missing or mis-typed admin resource")
    }

    execute {
        self.dropsAdmin.reserve(productID: productID, amount: amount)
    }
}