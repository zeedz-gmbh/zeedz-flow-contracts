import ZeedzDrops from 0xZEEDZ_DROPS

transaction(productID: UInt64, startTime: UFix64, endTime: UFix64) {

    let dropsAdmin: &ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}
    let productRef: &ZeedzDrops.Product{ZeedzDrops.ProductPublic}
    let oldEndTime: UFix64
    let oldStartTime: UFix64

    prepare(acct: AuthAccount) {
        self.dropsAdmin = acct.borrow<&ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}>(from: ZeedzDrops.ZeedzDropsStoragePath)
            ?? panic("Missing or mis-typed admin resource")
        self.productRef =  ZeedzDrops.borrowProduct(id: productID) 
            ?? panic("Product with specified id not found")
        self.oldEndTime = self.productRef!.getDetails().timeEnd
        self.oldStartTime = self.productRef!.getDetails().timeStart
    }

    execute {
        if(startTime > self.oldEndTime) {
            self.dropsAdmin.setEndTime(productID: productID, endTime: endTime)
            self.dropsAdmin.setStartTime(productID: productID, startTime: startTime)                  
        } else {
            self.dropsAdmin.setStartTime(productID: productID, startTime: startTime)
            self.dropsAdmin.setEndTime(productID: productID, endTime: endTime)
        }
    }
}