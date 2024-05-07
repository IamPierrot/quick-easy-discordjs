import path from "path";
import * as fs from 'fs';
import chalk from "chalk";
import { pathToFileURL } from "url";

export default function getAllFiles(directory: string, foldersOnly: boolean = false): string[] {
    const fileNames: string[] = [];
    try {
        const files = fs.readdirSync(directory, { withFileTypes: true });
        for (const file of files) {
            const filePath = path.join(directory, file.name);

            if (foldersOnly) {
                if (file.isDirectory()) {
                    fileNames.push(filePath);
                }
            } else {
                if (file.isFile()) {
                    fileNames.push(filePath);
                }
            }
        }

    } catch (error) {
        console.log(`Invalid ${directory} : ${error}`);
    }
    return fileNames;
}

export const checkDirectory = (directoryPath: string) => {
    try {
        if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory())
            throw new Error(`The path ${directoryPath} is not a valid directory.`)
    } catch (error) {
        throw new Error(`Error checking directory: ${error}`);
    }
}

export const dynamicImportModule = async (filePath: string) => {
    try {
        const fileUrl = pathToFileURL(path.resolve(filePath)).href;
        const module = await import(fileUrl);
        // Check for ES6 default export
        return module.default || module;
    } catch (error) {
        console.log(chalk.red.bold(`Error importing module ${filePath}:`, error));
    }
}
