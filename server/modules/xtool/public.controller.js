"use strict";
var PublicController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const tslib_1 = require("tslib");
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const child_process_1 = require("child_process");
const public_service_1 = require("./public.service");
const xtool_service_1 = require("./xtool.service");
let PublicController = PublicController_1 = class PublicController {
    publicService;
    xtoolService;
    logger = new common_1.Logger(PublicController_1.name);
    constructor(publicService, xtoolService) {
        this.publicService = publicService;
        this.xtoolService = xtoolService;
    }
    async getMachines() {
        const result = await this.publicService.listMachines();
        this.logger.log(`GET /api/public/machines: ${result.items.length} items`);
        return result;
    }
    async getMaterials() {
        const result = await this.publicService.listMaterials();
        this.logger.log(`GET /api/public/materials: ${result.items.length} items`);
        return result;
    }
    async getMaterialsByMachine(machine, drawingType) {
        const result = await this.publicService.listMaterialsByMachine(machine, drawingType);
        this.logger.log(`GET /api/public/materials/by-machine?machine=${machine}&drawingType=${drawingType || ''}: ${result.items.length} items`);
        return result;
    }
    async getSamples(machine, material, drawingType) {
        const result = await this.publicService.listSamples({
            machine,
            material,
            drawingType,
        });
        this.logger.log(`GET /api/public/samples: ${result.items.length} items, ` +
            `machine=${machine || 'all'}, material=${material || 'all'}, ` +
            `drawingType=${drawingType || 'all'}`);
        return result;
    }
    async getDrawings(type) {
        const result = await this.publicService.listDrawings(type);
        this.logger.log(`GET /api/public/drawings: ${result.items.length} items, type=${type || 'all'}`);
        return result;
    }
    async getDrawingFile(id, res) {
        try {
            const result = await this.publicService.getDrawingFile(id);
            if (!result) {
                res.status(404).send('Not found');
                return;
            }
            res.setHeader('Content-Type', result.contentType);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const reader = result.content.getReader();
            const pump = async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    res.write(Buffer.from(value));
                }
                res.end();
            };
            await pump();
        }
        catch (err) {
            this.logger.error(`Error streaming drawing file ${id}: ${String(err)}`);
            res.status(500).send('Internal server error');
        }
    }
    async getStorageFile(path, res) {
        try {
            const result = await this.publicService.getStorageFile(path);
            if (!result) {
                res.status(404).send('Not found');
                return;
            }
            res.setHeader('Content-Type', result.contentType);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const reader = result.content.getReader();
            const pump = async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    res.write(Buffer.from(value));
                }
                res.end();
            };
            await pump();
        }
        catch (err) {
            this.logger.error(`Error streaming storage file: ${String(err)}`);
            res.status(500).send('Internal server error');
        }
    }
    // ========== Admin Auth ==========
    async getPopupImage() {
        const url = await this.xtoolService.getSiteSetting('popup_image_url');
        return { url };
    }
    async getRemoveBgKeyValue() {
        const apiKey = await this.xtoolService.getRemoveBgApiKey();
        return { apiKey };
    }
    async adminLogin(body) {
        this.logger.log(`POST /api/public/admin/login: username=${body.username}`);
        const result = await this.xtoolService.adminLogin(body.username, body.password);
        if (!result) {
            return { success: false, message: '用户名或密码错误' };
        }
        return result;
    }
    async downloadProject(res) {
        const filePath = (0, path_1.resolve)('/tmp/xtool-project.tar.gz');
        if (!(0, fs_1.existsSync)(filePath)) {
            try {
                this.logger.log('Regenerating project archive...');
                let projectRoot = process.cwd();
                for (let i = 0; i < 5; i++) {
                    if ((0, fs_1.existsSync)((0, path_1.resolve)(projectRoot, 'package.json')) &&
                        (0, fs_1.existsSync)((0, path_1.resolve)(projectRoot, 'client'))) {
                        break;
                    }
                    projectRoot = (0, path_1.resolve)(projectRoot, '..');
                }
                (0, child_process_1.execSync)(`tar -czf ${filePath} ` +
                    `--exclude='.git' --exclude='.openclaw' --exclude='.agent' ` +
                    `--exclude='.agent-memory' --exclude='dist' --exclude='build' ` +
                    `--exclude='tmp' --exclude='.DS_Store' --exclude='*.log' ` +
                    `client server shared node_modules ` +
                    `$(find . -maxdepth 1 -type f \\( -name "*.json" -o -name "*.ts" -o -name "*.md" \\) -printf '%P\\n')`, { cwd: projectRoot, timeout: 300000 });
                this.logger.log(`Project archive regenerated: ${(0, fs_1.statSync)(filePath).size} bytes`);
            }
            catch (err) {
                this.logger.error(`Failed to regenerate archive: ${String(err)}`);
                res.status(500).send('Failed to generate project archive');
                return;
            }
        }
        const stat = (0, fs_1.statSync)(filePath);
        res.setHeader('Content-Type', 'application/gzip');
        res.setHeader('Content-Disposition', 'attachment; filename="xtool-project.tar.gz"');
        res.setHeader('Content-Length', stat.size);
        const stream = (0, fs_1.createReadStream)(filePath);
        stream.pipe(res);
    }
};
exports.PublicController = PublicController;
tslib_1.__decorate([
    (0, common_1.Get)('machines'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "getMachines", null);
tslib_1.__decorate([
    (0, common_1.Get)('materials'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "getMaterials", null);
tslib_1.__decorate([
    (0, common_1.Get)('materials/by-machine'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Query)('machine')),
    tslib_1.__param(1, (0, common_1.Query)('drawingType')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "getMaterialsByMachine", null);
tslib_1.__decorate([
    (0, common_1.Get)('samples'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Query)('machine')),
    tslib_1.__param(1, (0, common_1.Query)('material')),
    tslib_1.__param(2, (0, common_1.Query)('drawingType')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "getSamples", null);
tslib_1.__decorate([
    (0, common_1.Get)('drawings'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Query)('type')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "getDrawings", null);
tslib_1.__decorate([
    (0, common_1.Get)('drawing-file/:id'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "getDrawingFile", null);
tslib_1.__decorate([
    (0, common_1.Get)('storage-file'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Query)('path')),
    tslib_1.__param(1, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "getStorageFile", null);
tslib_1.__decorate([
    (0, common_1.Get)('settings/popup-image'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "getPopupImage", null);
tslib_1.__decorate([
    (0, common_1.Get)('settings/removebg-key'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "getRemoveBgKeyValue", null);
tslib_1.__decorate([
    (0, common_1.Post)('admin/login'),
    openapi.ApiResponse({ status: 201, type: Object }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "adminLogin", null);
tslib_1.__decorate([
    (0, common_1.Get)('download/project'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "downloadProject", null);
exports.PublicController = PublicController = PublicController_1 = tslib_1.__decorate([
    (0, common_1.Controller)('api/public'),
    tslib_1.__metadata("design:paramtypes", [public_service_1.PublicService,
        xtool_service_1.XtoolService])
], PublicController);
