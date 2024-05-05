import path from "path";
import * as fs from 'fs';

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

export const checkDirectory = (value: string) => {
    try {
        const stats = fs.statSync(value);
        if (!stats.isDirectory()) {
            throw new Error('The path does not point to a directory!');
        }
    } catch (error) {
        throw new Error(`Error checking directory: ${error}`);
    }
}