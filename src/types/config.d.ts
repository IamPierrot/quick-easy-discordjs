export declare interface ConfigPath {
    eventFolderPath: string
    prefixCommandFolderPath: string
    slashCommandFolderPath: string
}

export declare interface QEOption {
    /**
     * Recommend to set it true
     * @description will setup a default ready, messageCreate and interactionCreate event so as to handle commands.
     * @returns it will default to true.
     * @note the event registering Commannds for slashs will be added even set false. 
     */
    useDefaultHandler: boolean

    /**
     * Recommend to set it true
     * @property it will setup a default ping commands as prefix.
     * @returns it will default to true.
     */
    useDefaultPrefix: boolean

    /**
     * Recommend to set it true
     * @property it will setup a default ping commands as slash.
     * @returns it will default to true.
     */
    useDefaultSlash: boolean

    /**
     * Not recommend to set it true.
     * @property it will block the eventName Property in EventDiscord class
     * @returns it will default to false
     */
    useFolderNameAsCategory: boolean
    /**
     * @property a choice for register only in 1 guild or global slash commands
     * @returns it will default to false
     */
    uselocalCommand: boolean
}