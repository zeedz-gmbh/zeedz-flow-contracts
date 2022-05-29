import ZeedzINO from 0xZEEDZ_INO

/* 
    This transaction gives an user the administrator capability
*/ 

transaction() {

    let clientCapability: &AnyResource{ZeedzINO.AdminClient}
    let adminCapability: Capability<&ZeedzINO.Administrator>

    prepare(signer: AuthAccount, admin: AuthAccount) {

        self.adminCapability =admin.getCapability<&ZeedzINO.Administrator>(ZeedzINO.AdminPrivatePath)

        // borrow a reference to the Administrator resource in storage
        let adminRef= admin.getCapability(ZeedzINO.AdminPrivatePath)
            .borrow<&ZeedzINO.Administrator>()!

        if (signer.getCapability<&{ZeedzINO.AdminClient}>(ZeedzINO.AdminClientPublicPath).borrow() == nil) {
            signer.save(<- adminRef.createAdminClient(), to: ZeedzINO.AdminClientStoragePath)
            signer.link<&{ZeedzINO.AdminClient}>(ZeedzINO.AdminClientPublicPath, target: ZeedzINO.AdminClientStoragePath)
        }

        self.clientCapability= signer.getCapability<&{ZeedzINO.AdminClient}>(ZeedzINO.AdminClientPublicPath)
            .borrow() ?? panic("Could not borrow admin client")
    }

    execute {
          self.clientCapability.addCapability(self.adminCapability)
    }
}
