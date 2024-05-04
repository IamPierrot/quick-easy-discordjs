import { Config } from "../types/config";

export class Option implements Config {
    public EventPath: string;
    public PrefixCommandPath: string;
    public SlashCommandPath: string;

    constructor(options?: Config) {
        this.EventPath = options?.EventPath || "";
        this.PrefixCommandPath = options?.PrefixCommandPath || "";
        this.SlashCommandPath = options?.SlashCommandPath || "";
    }
}