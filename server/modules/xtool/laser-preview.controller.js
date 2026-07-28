"use strict";
var LaserPreviewController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaserPreviewController = void 0;
const tslib_1 = require("tslib");
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const path = tslib_1.__importStar(require("path"));
const fs = tslib_1.__importStar(require("fs"));
let LaserPreviewController = LaserPreviewController_1 = class LaserPreviewController {
    logger = new common_1.Logger(LaserPreviewController_1.name);
    static resolveAssetsDir(logger) {
        const candidates = [
            path.join(process.cwd(), 'server', 'assets', 'v5'),
            path.join(__dirname, '..', '..', 'assets', 'v5'),
            path.join(process.cwd(), 'client', 'public', 'v5'),
        ];
        for (const dir of candidates) {
            if (fs.existsSync(path.join(dir, 'index.html'))) {
                return dir;
            }
        }
        if (logger) {
            logger.error(`Assets dir not found, tried: ${candidates.join(', ')}`);
        }
        return candidates[0];
    }
    resolveAssetsDir() {
        return LaserPreviewController_1.resolveAssetsDir(this.logger);
    }
    servePage(res) {
        const assetsDir = this.resolveAssetsDir();
        const filePath = path.join(assetsDir, 'index.html');
        if (!fs.existsSync(filePath)) {
            this.logger.error(`Laser preview HTML not found at ${filePath}`);
            res.status(404).send('Not found');
            return;
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(filePath);
    }
    serveAsset(filename, res) {
        const allowed = ['family-bg.png', 'machine-bg.png', 'xTool_Logo_Color_White.png', 'Untitled.svg'];
        if (!allowed.includes(filename)) {
            res.status(404).send('Not found');
            return;
        }
        const assetsDir = this.resolveAssetsDir();
        const filePath = path.join(assetsDir, filename);
        if (!fs.existsSync(filePath)) {
            this.logger.error(`Asset not found: ${filePath}`);
            res.status(404).send('Not found');
            return;
        }
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
        };
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(filePath);
    }
};
exports.LaserPreviewController = LaserPreviewController;
tslib_1.__decorate([
    (0, common_1.Get)('page'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], LaserPreviewController.prototype, "servePage", null);
tslib_1.__decorate([
    (0, common_1.Get)('asset/:filename'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Param)('filename')),
    tslib_1.__param(1, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], LaserPreviewController.prototype, "serveAsset", null);
exports.LaserPreviewController = LaserPreviewController = LaserPreviewController_1 = tslib_1.__decorate([
    (0, common_1.Controller)(['api/laser-preview', 'api/preview'])
], LaserPreviewController);
