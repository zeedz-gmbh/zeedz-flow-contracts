import ZeedzDrops from "../contracts/ZeedzDrops.cdc"

transaction(productID: UInt64, status: Bool) {

    let dropsAdmin: &ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}

    prepare(acct: AuthAccount) {
        self.dropsAdmin = acct.borrow<&ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}>(from: ZeedzDrops.ZeedzDropsStoragePath)
            ?? panic("Missing or mis-typed admin resource")
    }

    execute {
        self.dropsAdmin.setSaleEnabledStatus(productID: productID, status: status)
    }
}