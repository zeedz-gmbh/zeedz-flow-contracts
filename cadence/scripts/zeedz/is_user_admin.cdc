import ZeedzINO from "../../contracts/ZeedzINO.cdc"

pub fun main(address: Address): Bool {
    let owner = getAccount(address)
    if (owner.getCapability<&{ZeedzINO.AdminClient}>(ZeedzINO.AdminClientPublicPath)
                .borrow() != nil) {
                return owner.getCapability<&{ZeedzINO.AdminClient}>(ZeedzINO.AdminClientPublicPath)
                .borrow()!.isAdmin()
                }
    else {
        return false
    }
}