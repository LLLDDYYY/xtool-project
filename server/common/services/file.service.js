"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalFileService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
exports.LocalFileService = class LocalFileService {
    logger = new common_1.Logger('LocalFileService');
    uploadDir = path.join(process.cwd(), 'uploads');
    ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    async upload(file, subPath = '') {
        this.ensureDir(path.join(this.uploadDir, subPath));
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
        const filepath = path.join(this.uploadDir, subPath, filename);
        fs.writeFileSync(filepath, file.buffer);
        return { filepath: `/uploads/${subPath ? subPath + '/' : ''}${filename}`, filename };
    }
    async download(filepath) {
        const fullPath = path.join(process.cwd(), filepath);
        if (!fs.existsSync(fullPath)) {
            return null;
        }
        const buffer = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        const mimeTypes = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.pdf': 'application/pdf', '.dxf': 'application/dxf' };
        return { buffer, contentType: mimeTypes[ext] || 'application/octet-stream' };
    }
    async getFileStream(filepath) {
        const fullPath = path.join(process.cwd(), filepath);
        if (!fs.existsSync(fullPath)) {
            return null;
        }
        const ext = path.extname(fullPath).toLowerCase();
        const mimeTypes = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.pdf': 'application/pdf', '.dxf': 'application/dxf' };
        return { createReadStream: () => fs.createReadStream(fullPath), contentType: mimeTypes[ext] || 'application/octet-stream' };
    }
    getFileUrl(filepath) {
        return filepath;
    }
};
