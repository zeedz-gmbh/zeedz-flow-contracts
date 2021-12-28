
import ZeedzINO from "../../contracts/ZeedzINO.cdc"

/* 
    This transaction gives an user the administrator capability
*/ 

transaction(userAddress: Address) {

    prepare(signer: AuthAccount) {
        
        let user= getAccount(userAddress)

        // get the users ZeedzINO admin client
        let client= user.getCapability<&{ZeedzINO.AdminClient}>(ZeedzINO.AdminClientPublicPath)
                .borrow() ?? panic("Could not borrow admin client")

        // give the user the TFCToken admin capability
        let AdminCap=signer.getCapability<&ZeedzINO.Administrator>(ZeedzINO.AdminPrivatePath)
        client.addCapability(AdminCap)
    }
}
