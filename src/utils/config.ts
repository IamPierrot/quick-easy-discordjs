import {  ConfigPath, QEOption } from "../types/config";

export class Option implements QEOption {
    public EventPath?: string;
    public PrefixCommandPath?: string;
    public SlashCommandPath?: string;
    public useDefault: boolean;

    constructor(options?: ConfigPath & QEOption) {
        this.EventPath = options?.EventPath;
        this.PrefixCommandPath = options?.PrefixCommandPath;
        this.SlashCommandPath = options?.SlashCommandPath
        this.useDefault = options?.useDefault || true;
    }
}