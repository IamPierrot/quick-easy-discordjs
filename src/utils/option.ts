import { ConfigPath, QEOption } from "../types/config";

export class Option implements QEOption, ConfigPath {
    public eventFolderPath: string;
    public prefixCommandFolderPath: string;
    public slashCommandFolderPath: string;
    public useDefaultHandler: boolean;
    useDefaultPrefix: boolean;
    useDefaultSlash: boolean;
    /**
    * @property it will block the eventName Property in EventDiscord class
    */
    public useFolderNameAsCategory: boolean = false;

    constructor(options?: QEOption & ConfigPath) {
        this.eventFolderPath = options?.eventFolderPath || '';
        this.prefixCommandFolderPath = options?.prefixCommandFolderPath || '';
        this.slashCommandFolderPath = options?.slashCommandFolderPath || '';
        this.useDefaultHandler = options?.useDefaultHandler || true;
        this.useFolderNameAsCategory = options?.useFolderNameAsCategory || false;
        this.useDefaultPrefix = options?.useDefaultPrefix || true;
        this.useDefaultSlash = options?.useDefaultSlash || false;
    }

}
