"use strict";
var XtoolController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XtoolController = void 0;
const tslib_1 = require("tslib");
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const fullstack_nestjs_core_1 = require("@lark-apaas/fullstack-nestjs-core");
const xtool_service_1 = require("./xtool.service");
let XtoolController = XtoolController_1 = class XtoolController {
    xtoolService;
    logger = new common_1.Logger(XtoolController_1.name);
    constructor(xtoolService) {
        this.xtoolService = xtoolService;
    }
    async verifyAdminToken(token) {
        if (!token || !await this.xtoolService.verifySession(token)) {
            throw new common_1.ForbiddenException('未登录或登录已过期');
        }
    }
    // ========== Drawings ==========
    async getDrawings(type, style, page, limit) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const result = await this.xtoolService.listDrawings({
            type,
            style,
            page: pageNum,
            limit: limitNum,
        });
        this.logger.log(`GET /api/public/admin/drawings: page=${pageNum}, limit=${limitNum}, ` +
            `type=${type || 'all'}, style=${style || 'all'}, total=${result.total}`);
        return result;
    }
    async getDrawingStyles() {
        const result = await this.xtoolService.listStyles();
        this.logger.log(`GET /api/public/admin/drawings/styles: ${result.length} styles`);
        return result;
    }
    async createDrawing(body) {
        this.logger.log(`POST /api/public/admin/drawings: type=${body.type}, style=${body.style}, ` +
            `filename=${body.filename}`);
        await this.xtoolService.createDrawing({
            type: body.type,
            style: body.style || 'default',
            filename: body.filename,
            filepath: body.filepath,
            description: body.description || '',
        });
        return { success: true, message: '创建成功' };
    }
    async batchUploadDrawings(body) {
        this.logger.log(`POST /api/public/admin/drawings/batch: batch upload requested`);
        return {
            success: true,
            message: '批量上传功能暂不可用（FaaS 环境限制），请使用前端存储上传后逐条调用创建接口',
        };
    }
    async updateDrawing(id, body) {
        this.logger.log(`PUT /api/public/admin/drawings/${id}`);
        await this.xtoolService.updateDrawing(id, body);
        return { success: true, message: '更新成功' };
    }
    async deleteDrawing(id) {
        this.logger.log(`DELETE /api/public/admin/drawings/${id}`);
        await this.xtoolService.deleteDrawing(id);
        return { success: true, message: '删除成功' };
    }
    // ========== Samples ==========
    async getSamples(material, drawingType, machine, page, limit) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const result = await this.xtoolService.listSamples({
            material,
            drawingType,
            machine,
            page: pageNum,
            limit: limitNum,
        });
        this.logger.log(`GET /api/public/admin/samples: page=${pageNum}, limit=${limitNum}, ` +
            `material=${material || 'all'}, drawingType=${drawingType || 'all'}, ` +
            `machine=${machine || 'all'}, total=${result.total}`);
        return result;
    }
    async checkDuplicateSample(machine, material, drawingType) {
        if (!machine || !material || !drawingType) {
            return { found: false, sample: null };
        }
        const existing = await this.xtoolService.findDuplicateSample(machine, material, drawingType);
        this.logger.log(`GET /api/public/admin/samples/check-duplicate: machine=${machine}, material=${material}, drawingType=${drawingType}, found=${!!existing}`);
        return { found: !!existing, sample: existing };
    }
    async exportSamples() {
        const samples = await this.xtoolService.listAllSamples();
        this.logger.log(`GET /api/public/admin/samples/export: ${samples.length} samples`);
        return samples;
    }
    async batchImportSamples(body) {
        this.logger.log(`POST /api/public/admin/samples/batch-import: ${body.records.length} records`);
        const result = await this.xtoolService.batchImportSamples(body.records);
        return {
            success: true,
            added: result.added,
            updated: result.updated,
            errors: result.errors,
        };
    }
    async createSample(body) {
        this.logger.log(`POST /api/public/admin/samples: material=${body.material}, ` +
            `drawingType=${body.drawingType}, machine=${body.machine}`);
        await this.xtoolService.createSample(body);
        return { success: true, message: '添加成功' };
    }
    async updateSample(id, body) {
        this.logger.log(`PUT /api/public/admin/samples/${id}`);
        await this.xtoolService.updateSample(id, body);
        return { success: true, message: '更新成功' };
    }
    async deleteSample(id) {
        this.logger.log(`DELETE /api/public/admin/samples/${id}`);
        await this.xtoolService.deleteSample(id);
        return { success: true, message: '删除成功' };
    }
    // ========== Materials ==========
    async getMaterials() {
        const result = await this.xtoolService.listMaterials();
        this.logger.log(`GET /api/public/admin/materials: ${result.length} materials`);
        return result;
    }
    async createMaterial(body) {
        this.logger.log(`POST /api/public/admin/materials: value=${body.value}`);
        await this.xtoolService.createMaterial(body);
        return { success: true, message: '添加成功' };
    }
    async updateMaterial(id, body) {
        this.logger.log(`PUT /api/public/admin/materials/${id}: value=${body.value}`);
        await this.xtoolService.updateMaterial(id, body);
        return { success: true, message: '修改成功' };
    }
    async deleteMaterial(id) {
        this.logger.log(`DELETE /api/public/admin/materials/${id}`);
        await this.xtoolService.deleteMaterial(id);
        return { success: true, message: '删除成功' };
    }
    // ========== Machines ==========
    async getMachines() {
        const result = await this.xtoolService.listMachines();
        this.logger.log(`GET /api/public/admin/machines: ${result.length} machines`);
        return result;
    }
    async createMachine(body) {
        this.logger.log(`POST /api/public/admin/machines: value=${body.value}, supportedTypes=${JSON.stringify(body.supportedTypes)}`);
        await this.xtoolService.createMachine(body);
        return { success: true, message: '添加成功' };
    }
    async updateMachine(id, body) {
        this.logger.log(`PUT /api/public/admin/machines/${id}`);
        await this.xtoolService.updateMachine(id, body);
        return { success: true, message: '更新成功' };
    }
    async deleteMachine(id) {
        this.logger.log(`DELETE /api/public/admin/machines/${id}`);
        await this.xtoolService.deleteMachine(id);
        return { success: true, message: '删除成功' };
    }
    // ========== AI Material Analysis (Hunyuan Vision) ==========
    async analyzeMaterial(body) {
        if (!body.imageBase64) {
            return { success: false, material: '', color: '', rawText: '', error: '缺少图片数据' };
        }
        this.logger.log(`POST /api/public/admin/ai/analyze-material: base64 length=${body.imageBase64.length}, mimeType=${body.mimeType || 'default'}`);
        return this.xtoolService.analyzeMaterial(body.imageBase64, body.mimeType);
    }
    async getHunyuanApiKeyStatus(token) {
        await this.verifyAdminToken(token);
        const configured = await this.xtoolService.getHunyuanApiKeyConfigured();
        const keyId = await this.xtoolService.getHunyuanApiKeyId();
        return { configured, apiKeyId: keyId || '' };
    }
    async setHunyuanApiKey(token, body) {
        await this.verifyAdminToken(token);
        if (!body.apiKey?.trim()) {
            return { success: false, message: 'API Key 不能为空' };
        }
        await this.xtoolService.setHunyuanApiKey(body.apiKey.trim());
        if (body.apiKeyId) {
            await this.xtoolService.setHunyuanApiKeyId(body.apiKeyId.trim());
        }
        this.logger.log('POST /api/public/admin/ai/hunyuan-key: updated');
        return { success: true, message: '腾讯混元 API Key 已保存' };
    }
    // ========== AI Recognize ==========
    async recognizeText(body) {
        this.logger.log(`POST /api/public/admin/ai/recognize: text length=${body.text?.length || 0}`);
        return this.xtoolService.recognizeText(body.text);
    }
    async recognizeTextBatch(body) {
        this.logger.log(`POST /api/public/admin/ai/recognize-batch: ${body.texts?.length || 0} texts`);
        const results = [];
        for (const text of (body.texts || [])) {
            const trimmed = text.trim();
            if (!trimmed)
                continue;
            const recognized = await this.xtoolService.recognizeText(trimmed);
            let duplicate = { found: false, sample: null };
            if (recognized.machine && recognized.material && recognized.drawingType) {
                const existing = await this.xtoolService.findDuplicateSample(recognized.machine, recognized.material, recognized.drawingType);
                if (existing) {
                    duplicate = { found: true, sample: existing };
                }
            }
            results.push({ text: trimmed, recognized, duplicate });
        }
        return { results };
    }
    // ========== Styles (under drawings path) ==========
    async createStyle(body) {
        this.logger.log(`POST /api/public/admin/drawings/styles: value=${body.value}`);
        await this.xtoolService.createStyle(body);
        return { success: true, message: '添加成功' };
    }
    async updateStyle(id, body) {
        this.logger.log(`PUT /api/public/admin/drawings/styles/${id}`);
        await this.xtoolService.updateStyle(id, body);
        return { success: true, message: '更新成功' };
    }
    async deleteStyle(id) {
        this.logger.log(`DELETE /api/public/admin/drawings/styles/${id}`);
        await this.xtoolService.deleteStyle(id);
        return { success: true, message: '删除成功' };
    }
    // ========== Site Settings ==========
    async getPopupImage() {
        const url = await this.xtoolService.getSiteSetting('popup_image_url');
        return { url };
    }
    async setPopupImage(body) {
        await this.xtoolService.setSiteSetting('popup_image_url', body.url || '');
        this.logger.log('POST /api/public/admin/settings/popup-image: updated');
        return { success: true, message: '弹窗图片已保存' };
    }
    // ========== Remove.bg API Key ==========
    async getRemoveBgKeyStatus(token) {
        await this.verifyAdminToken(token);
        const configured = await this.xtoolService.getRemoveBgApiKeyConfigured();
        return { configured };
    }
    async setRemoveBgKey(token, body) {
        await this.verifyAdminToken(token);
        if (!body.apiKey?.trim()) {
            return { success: false, message: 'API Key 不能为空' };
        }
        await this.xtoolService.setRemoveBgApiKey(body.apiKey.trim());
        this.logger.log('POST /api/public/admin/settings/removebg-key: updated');
        return { success: true, message: 'remove.bg API Key 已保存' };
    }
    // ========== Admin Accounts ==========
    async login(body) {
        if (!body.username || !body.password) {
            return { success: false, message: '用户名和密码不能为空' };
        }
        const result = await this.xtoolService.adminLogin(body.username, body.password);
        if (!result) {
            this.logger.warn(`Admin login failed: ${body.username}`);
            return { success: false, message: '用户名或密码错误' };
        }
        return result;
    }
    async verifyToken(token) {
        if (!token)
            return { valid: false };
        const valid = await this.xtoolService.verifySession(token);
        return { valid };
    }
    async listAccounts(token) {
        await this.verifyAdminToken(token);
        const accounts = await this.xtoolService.listAdminAccounts();
        this.logger.log(`GET /api/public/admin/accounts: ${accounts.length} accounts`);
        return accounts;
    }
    async createAccount(token, body) {
        await this.verifyAdminToken(token);
        if (!body.username || !body.password) {
            return { success: false, message: '用户名和密码不能为空' };
        }
        if (body.password.length < 6) {
            return { success: false, message: '密码长度至少6位' };
        }
        this.logger.log(`POST /api/public/admin/accounts: username=${body.username}`);
        return this.xtoolService.createAdminAccount({
            username: body.username,
            password: body.password,
            displayName: body.displayName || body.username,
            role: body.role || 'admin',
        });
    }
    async deleteAccount(token, id) {
        await this.verifyAdminToken(token);
        this.logger.log(`DELETE /api/public/admin/accounts/${id}`);
        return this.xtoolService.deleteAdminAccount(id);
    }
    async changePassword(token, body) {
        await this.verifyAdminToken(token);
        if (!body.newPassword || body.newPassword.length < 6) {
            return { success: false, message: '新密码长度至少6位' };
        }
        this.logger.log(`POST /api/public/admin/accounts/change-password: username=${body.username}`);
        return this.xtoolService.changeAdminPassword(body.username, body.oldPassword, body.newPassword);
    }
    async resetPassword(token, body) {
        await this.verifyAdminToken(token);
        if (!body.newPassword || body.newPassword.length < 6) {
            return { success: false, message: '新密码长度至少6位' };
        }
        this.logger.log(`POST /api/public/admin/accounts/reset-password: id=${body.id}`);
        return this.xtoolService.resetAdminPassword(body.id, body.newPassword);
    }
};
exports.XtoolController = XtoolController;
tslib_1.__decorate([
    (0, common_1.Get)('drawings'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Query)('type')),
    tslib_1.__param(1, (0, common_1.Query)('style')),
    tslib_1.__param(2, (0, common_1.Query)('page')),
    tslib_1.__param(3, (0, common_1.Query)('limit')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getDrawings", null);
tslib_1.__decorate([
    (0, common_1.Get)('drawings/styles'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getDrawingStyles", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Post)('drawings'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "createDrawing", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Post)('drawings/batch'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "batchUploadDrawings", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Put)('drawings/:id'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "updateDrawing", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Delete)('drawings/:id'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "deleteDrawing", null);
tslib_1.__decorate([
    (0, common_1.Get)('samples'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Query)('material')),
    tslib_1.__param(1, (0, common_1.Query)('drawingType')),
    tslib_1.__param(2, (0, common_1.Query)('machine')),
    tslib_1.__param(3, (0, common_1.Query)('page')),
    tslib_1.__param(4, (0, common_1.Query)('limit')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getSamples", null);
tslib_1.__decorate([
    (0, common_1.Get)('samples/check-duplicate'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Query)('machine')),
    tslib_1.__param(1, (0, common_1.Query)('material')),
    tslib_1.__param(2, (0, common_1.Query)('drawingType')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "checkDuplicateSample", null);
tslib_1.__decorate([
    (0, common_1.Get)('samples/export'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "exportSamples", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Post)('samples/batch-import'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "batchImportSamples", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Post)('samples'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "createSample", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Put)('samples/:id'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "updateSample", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Delete)('samples/:id'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "deleteSample", null);
tslib_1.__decorate([
    (0, common_1.Get)('materials'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getMaterials", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Post)('materials'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "createMaterial", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Put)('materials/:id'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "updateMaterial", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Delete)('materials/:id'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "deleteMaterial", null);
tslib_1.__decorate([
    (0, common_1.Get)('machines'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getMachines", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Post)('machines'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "createMachine", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Put)('machines/:id'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "updateMachine", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Delete)('machines/:id'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "deleteMachine", null);
tslib_1.__decorate([
    (0, common_1.Post)('ai/analyze-material'),
    openapi.ApiResponse({ status: 201, type: Object }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "analyzeMaterial", null);
tslib_1.__decorate([
    (0, common_1.Get)('ai/hunyuan-key'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getHunyuanApiKeyStatus", null);
tslib_1.__decorate([
    (0, common_1.Post)('ai/hunyuan-key'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "setHunyuanApiKey", null);
tslib_1.__decorate([
    (0, common_1.Post)('ai/recognize'),
    openapi.ApiResponse({ status: 201, type: Object }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "recognizeText", null);
tslib_1.__decorate([
    (0, common_1.Post)('ai/recognize-batch'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "recognizeTextBatch", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Post)('drawings/styles'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "createStyle", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Put)('drawings/styles/:id'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "updateStyle", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Delete)('drawings/styles/:id'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "deleteStyle", null);
tslib_1.__decorate([
    (0, common_1.Get)('settings/popup-image'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getPopupImage", null);
tslib_1.__decorate([
    (0, fullstack_nestjs_core_1.NeedLogin)(),
    (0, common_1.Post)('settings/popup-image'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "setPopupImage", null);
tslib_1.__decorate([
    (0, common_1.Get)('settings/removebg-key'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getRemoveBgKeyStatus", null);
tslib_1.__decorate([
    (0, common_1.Post)('settings/removebg-key'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "setRemoveBgKey", null);
tslib_1.__decorate([
    (0, common_1.Post)('login'),
    openapi.ApiResponse({ status: 201, type: Object }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "login", null);
tslib_1.__decorate([
    (0, common_1.Get)('verify'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "verifyToken", null);
tslib_1.__decorate([
    (0, common_1.Get)('accounts'),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "listAccounts", null);
tslib_1.__decorate([
    (0, common_1.Post)('accounts'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "createAccount", null);
tslib_1.__decorate([
    (0, common_1.Delete)('accounts/:id'),
    openapi.ApiResponse({ status: 200 }),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "deleteAccount", null);
tslib_1.__decorate([
    (0, common_1.Post)('accounts/change-password'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "changePassword", null);
tslib_1.__decorate([
    (0, common_1.Post)('accounts/reset-password'),
    openapi.ApiResponse({ status: 201 }),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "resetPassword", null);
exports.XtoolController = XtoolController = XtoolController_1 = tslib_1.__decorate([
    (0, common_1.Controller)('api/public/admin'),
    tslib_1.__metadata("design:paramtypes", [xtool_service_1.XtoolService])
], XtoolController);
