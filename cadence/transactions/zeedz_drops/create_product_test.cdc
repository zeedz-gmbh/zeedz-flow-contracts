import ZeedzDrops from 0xZEEDZ_DROPS
import FlowToken from 0xFLOW_TOKEN

transaction(name: String, description: String, id: String, total: UInt64, saleEnabled: Bool) {

    let dropsAdmin: &ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}
    let vaultType: Type

    prepare(acct: AuthAccount) {
        self.dropsAdmin = acct.borrow<&ZeedzDrops.DropsAdmin{ZeedzDrops.ProductsManager}>(from: ZeedzDrops.ZeedzDropsStoragePath)
            ?? panic("Missing or mis-typed admin resource")
        self.vaultType = Type<@FlowToken.Vault>()
    }

    execute {
        let prices = { self.vaultType.identifier : 33.0}
        self.dropsAdmin.addProduct(name: name, description: description, id: id, total: total, saleEnabled: saleEnabled, timeStart: getCurrentBlock().timestamp, timeEnd: getCurrentBlock().timestamp+(600.0*10.0), prices: prices)
    }
}