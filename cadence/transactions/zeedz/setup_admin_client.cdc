import ZeedzINO from "../../contracts/ZeedzINO.cdc"

/*
    This transaction configures an account to hold the ZeedzINO AdminClient
*/

transaction {
    prepare(signer: AuthAccount) {
    // if the account doesn't already have a  admin client
    if (signer.getCapability<&{ZeedzINO.AdminClient}>(ZeedzINO.AdminClientPublicPath).borrow() == nil) {
        signer.save(<- TFCItems.createAdminClient(), to:TFCItems.AdminClientStoragePath)
        signer.link<&{TFCItems.TFCItemsAdminClient}>(TFCItems.AdminClientPublicPath, target: TFCItems.AdminClientStoragePath)
    }
}   