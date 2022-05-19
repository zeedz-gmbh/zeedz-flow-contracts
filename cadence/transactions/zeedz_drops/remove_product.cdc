import ZeedzDrops from "../contracts/ZeedzDrops.cdc"

transaction(productID: UInt64) {

    let dropsAdmin: &ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}

    prepare(acct: AuthAccount) {
        self.dropsAdmin = acct.borrow<&ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}>(from: ZeedzDrops.ZeedzDropsStoragePath)
            ?? panic("Missing or mis-typed NFTStorefront.Storefront")
    }

    execute {
        self.dropsAdmin.removeProduct(productID: productID)
    }
}