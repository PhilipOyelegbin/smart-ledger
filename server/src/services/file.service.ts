import fs from "fs";
import path from "path";

export class FileService {
  static fileExists(filePath?: string | null) {
    return Boolean(filePath && fs.existsSync(path.resolve(filePath)));
  }
}
