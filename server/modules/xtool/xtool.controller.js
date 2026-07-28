"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XtoolController = void 0;
const tslib_1 = require("tslib");
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const xtool_service_1 = require("./xtool.service");
const admin_auth_guard_1 = require("../../common/guards/admin-auth.guard");
let XtoolController = class XtoolController {
    xtoolService;
    logger = new common_1.Logger(XtoolController.name);
    constructor(xtoolService) {
        this.xtoolService = xtoolService;
    }
    async verifyAdminToken(token) {
        if (!token || !await this.xtoolService.verifySession(token)) {
            throw new common_1.ForbiddenException('未登录或登录已过期');
        }
    }
    async getDrawings(type, style, page, limit) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.xtoolService.listDrawings({ type, style, page: pageNum, limit: limitNum });
    }
    async getDrawingStyles() {
        return this.xtoolService.listStyles();
    }
    async createDrawing(body) {
        await this.xtoolService.createDrawing({ type: body.type, style: body.style || 'default', filename: body.filename, filepath: body.filepath, description: body.description || '' });
        return { success: true, message: '创建成功' };
    }
    async updateDrawing(id, body) {
        await this.xtoolService.updateDrawing(id, body);
        return { success: true, message: '更新成功' };
    }
    async deleteDrawing(id) {
        await this.xtoolService.deleteDrawing(id);
        return { success: true, message: '删除成功' };
    }
    async getSamples(material, drawingType, machine, page, limit) {
        return this.xtoolService.listSamples({ material, drawingType, machine, page: parseInt(page || '1'), limit: parseInt(limit || '10') });
    }
    async checkDuplicateSample(machine, material, drawingType) {
        if (!machine || !material || !drawingType) return { found: false, sample: null };
        const existing = await this.xtoolService.findDuplicateSample(machine, material, drawingType);
        return { found: !!existing, sample: existing };
    }
    async exportSamples() {
        return this.xtoolService.listAllSamples();
    }
    async batchImportSamples(body) {
        const result = await this.xtoolService.batchImportSamples(body.records);
        return { success: true, added: result.added, updated: result.updated, errors: result.errors };
    }
    async createSample(body) {
        await this.xtoolService.createSample(body);
        return { success: true, message: '添加成功' };
    }
    async updateSample(id, body) {
        await this.xtoolService.updateSample(id, body);
        return { success: true, message: '更新成功' };
    }
    async deleteSample(id) {
        await this.xtoolService.deleteSample(id);
        return { success: true, message: '删除成功' };
    }
    async getMaterials() {
        return this.xtoolService.listMaterials();
    }
    async createMaterial(body) {
        await this.xtoolService.createMaterial(body);
        return { success: true, message: '添加成功' };
    }
    async updateMaterial(id, body) {
        await this.xtoolService.updateMaterial(id, body);
        return { success: true, message: '修改成功' };
    }
    async deleteMaterial(id) {
        await this.xtoolService.deleteMaterial(id);
        return { success: true, message: '删除成功' };
    }
    async getMachines() {
        return this.xtoolService.listMachines();
    }
    async createMachine(body) {
        await this.xtoolService.createMachine(body);
        return { success: true, message: '添加成功' };
    }
    async updateMachine(id, body) {
        await this.xtoolService.updateMachine(id, body);
        return { success: true, message: '更新成功' };
    }
    async deleteMachine(id) {
        await this.xtoolService.deleteMachine(id);
        return { success: true, message: '删除成功' };
    }
    async analyzeMaterial(body) {
        if (!body.imageBase64) return { success: false, material: '', color: '', rawText: '', error: '缺少图片数据' };
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
        if (!body.apiKey?.trim()) return { success: false, message: 'API Key 不能为空' };
        await this.xtoolService.setHunyuanApiKey(body.apiKey.trim());
        if (body.apiKeyId) await this.xtoolService.setHunyuanApiKeyId(body.apiKeyId.trim());
        return { success: true, message: '腾讯混元 API Key 已保存' };
    }
    async recognizeText(body) {
        return this.xtoolService.recognizeText(body.text);
    }
    async recognizeTextBatch(body) {
        const results = [];
        for (const text of (body.texts || [])) {
            const trimmed = text.trim();
            if (!trimmed) continue;
            const recognized = await this.xtoolService.recognizeText(trimmed);
            let duplicate = { found: false, sample: null };
            if (recognized.machine && recognized.material && recognized.drawingType) {
                const existing = await this.xtoolService.findDuplicateSample(recognized.machine, recognized.material, recognized.drawingType);
                if (existing) duplicate = { found: true, sample: existing };
            }
            results.push({ text: trimmed, recognized, duplicate });
        }
        return { results };
    }
    async createStyle(body) {
        await this.xtoolService.createStyle(body);
        return { success: true, message: '添加成功' };
    }
    async updateStyle(id, body) {
        await this.xtoolService.updateStyle(id, body);
        return { success: true, message: '更新成功' };
    }
    async deleteStyle(id) {
        await this.xtoolService.deleteStyle(id);
        return { success: true, message: '删除成功' };
    }
    async getPopupImage() {
        const url = await this.xtoolService.getSiteSetting('popup_image_url');
        return { url };
    }
    async setPopupImage(body) {
        await this.xtoolService.setSiteSetting('popup_image_url', body.url || '');
        return { success: true, message: '弹窗图片已保存' };
    }
    async getRemoveBgKeyStatus(token) {
        await this.verifyAdminToken(token);
        const configured = await this.xtoolService.getRemoveBgApiKeyConfigured();
        return { configured };
    }
    async setRemoveBgKey(token, body) {
        await this.verifyAdminToken(token);
        if (!body.apiKey?.trim()) return { success: false, message: 'API Key 不能为空' };
        await this.xtoolService.setRemoveBgApiKey(body.apiKey.trim());
        return { success: true, message: 'remove.bg API Key 已保存' };
    }
    async login(body) {
        if (!body.username || !body.password) return { success: false, message: '用户名和密码不能为空' };
        const result = await this.xtoolService.adminLogin(body.username, body.password);
        if (!result) return { success: false, message: '用户名或密码错误' };
        return result;
    }
    async verifyToken(token) {
        if (!token) return { valid: false };
        const valid = await this.xtoolService.verifySession(token);
        return { valid };
    }
    async listAccounts(token) {
        await this.verifyAdminToken(token);
        return this.xtoolService.listAdminAccounts();
    }
    async createAccount(token, body) {
        await this.verifyAdminToken(token);
        if (!body.username || !body.password) return { success: false, message: '用户名和密码不能为空' };
        if (body.password.length < 6) return { success: false, message: '密码长度至少6位' };
        return this.xtoolService.createAdminAccount({ username: body.username, password: body.password, displayName: body.displayName || body.username, role: body.role || 'admin' });
    }
    async deleteAccount(token, id) {
        await this.verifyAdminToken(token);
        return this.xtoolService.deleteAdminAccount(id);
    }
    async changePassword(token, body) {
        await this.verifyAdminToken(token);
        if (!body.newPassword || body.newPassword.length < 6) return { success: false, message: '新密码长度至少6位' };
        return this.xtoolService.changeAdminPassword(body.username, body.oldPassword, body.newPassword);
    }
    async resetPassword(token, body) {
        await this.verifyAdminToken(token);
        if (!body.newPassword || body.newPassword.length < 6) return { success: false, message: '新密码长度至少6位' };
        return this.xtoolService.resetAdminPassword(body.id, body.newPassword);
    }
};
exports.XtoolController = XtoolController;
tslib_1.__decorate([
    (0, common_1.Get)('drawings'),
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
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getDrawingStyles", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('drawings'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "createDrawing", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Put)('drawings/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "updateDrawing", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Delete)('drawings/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "deleteDrawing", null);
tslib_1.__decorate([
    (0, common_1.Get)('samples'),
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
    tslib_1.__param(0, (0, common_1.Query)('machine')),
    tslib_1.__param(1, (0, common_1.Query)('material')),
    tslib_1.__param(2, (0, common_1.Query)('drawingType')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "checkDuplicateSample", null);
tslib_1.__decorate([
    (0, common_1.Get)('samples/export'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "exportSamples", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('samples/batch-import'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "batchImportSamples", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('samples'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "createSample", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Put)('samples/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "updateSample", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Delete)('samples/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "deleteSample", null);
tslib_1.__decorate([
    (0, common_1.Get)('materials'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getMaterials", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('materials'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "createMaterial", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Put)('materials/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "updateMaterial", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Delete)('materials/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "deleteMaterial", null);
tslib_1.__decorate([
    (0, common_1.Get)('machines'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getMachines", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('machines'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "createMachine", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Put)('machines/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "updateMachine", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Delete)('machines/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "deleteMachine", null);
tslib_1.__decorate([
    (0, common_1.Post)('ai/analyze-material'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "analyzeMaterial", null);
tslib_1.__decorate([
    (0, common_1.Get)('ai/hunyuan-key'),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getHunyuanApiKeyStatus", null);
tslib_1.__decorate([
    (0, common_1.Post)('ai/hunyuan-key'),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "setHunyuanApiKey", null);
tslib_1.__decorate([
    (0, common_1.Post)('ai/recognize'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "recognizeText", null);
tslib_1.__decorate([
    (0, common_1.Post)('ai/recognize-batch'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "recognizeTextBatch", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('drawings/styles'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "createStyle", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Put)('drawings/styles/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "updateStyle", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Delete)('drawings/styles/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "deleteStyle", null);
tslib_1.__decorate([
    (0, common_1.Get)('settings/popup-image'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getPopupImage", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('settings/popup-image'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "setPopupImage", null);
tslib_1.__decorate([
    (0, common_1.Get)('settings/removebg-key'),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "getRemoveBgKeyStatus", null);
tslib_1.__decorate([
    (0, common_1.Post)('settings/removebg-key'),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "setRemoveBgKey", null);
tslib_1.__decorate([
    (0, common_1.Post)('login'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "login", null);
tslib_1.__decorate([
    (0, common_1.Get)('verify'),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "verifyToken", null);
tslib_1.__decorate([
    (0, common_1.Get)('accounts'),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "listAccounts", null);
tslib_1.__decorate([
    (0, common_1.Post)('accounts'),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "createAccount", null);
tslib_1.__decorate([
    (0, common_1.Delete)('accounts/:id'),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "deleteAccount", null);
tslib_1.__decorate([
    (0, common_1.Post)('accounts/change-password'),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "changePassword", null);
tslib_1.__decorate([
    (0, common_1.Post)('accounts/reset-password'),
    tslib_1.__param(0, (0, common_1.Headers)('x-admin-token')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], XtoolController.prototype, "resetPassword", null);
tslib_1.__decorate([
    (0, common_1.Controller)('api/public/admin'),
    tslib_1.__metadata("design:paramtypes", [xtool_service_1.XtoolService])
], XtoolController);
