pub contract ZeedzSettings {

    pub let ZeedzSettingsAdminStoragePath: StoragePath

    // Setting name => AnyStruct
    access(contract) let settings: {String: AnyStruct}

    //
    // Administrator resource, owner account can update the Zeedz settings.
    //
    pub resource Administrator {
        pub fun updateSettings(_ settings: {String: AnyStruct}) {
            ZeedzSettings.settings = settings
        }
    }

    //
    // Returns all of the current Zeedz settings
    //
    pub fun getAllSettings(): {String: AnyStruct} {
        return self.settings
    }

    init () {
        self.ZeedzSettingsAdminStoragePath = /storage/ZeedzSettingsAdmin

        self.settings = {}

        let admin <- create Administrator()
        self.account.save(<-admin, to: self.ZeedzSettingsAdminStoragePath)
    }
}