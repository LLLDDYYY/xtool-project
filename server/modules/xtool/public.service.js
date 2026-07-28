"use strict";
var PublicService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const fullstack_nestjs_core_1 = require("@lark-apaas/fullstack-nestjs-core");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
let PublicService = PublicService_1 = class PublicService {
    db;
    fileService;
    logger = new common_1.Logger(PublicService_1.name);
    constructor(db, fileService) {
        this.db = db;
        this.fileService = fileService;
    }
    async listMachines() {
        const rows = await this.db
            .select({
            id: schema_1.machines.id,
            value: schema_1.machines.value,
            label: schema_1.machines.label,
            supportedTypes: schema_1.machines.supportedTypes,
        })
            .from(schema_1.machines);
        const items = rows.map((row) => {
            let parsed = [];
            try {
                parsed = JSON.parse(row.supportedTypes || '[]');
            }
            catch {
                this.logger.log(`Failed to parse supportedTypes for machine ${row.id}: ${row.supportedTypes}`);
            }
            return {
                id: row.id,
                value: row.value,
                label: row.label,
                supportedTypes: parsed,
            };
        });
        this.logger.log(`listMachines: ${items.length} machines`);
        return { items };
    }
    async listMaterials() {
        const rows = await this.db
            .select({
            id: schema_1.materials.id,
            value: schema_1.materials.value,
            label: schema_1.materials.label,
        })
            .from(schema_1.materials);
        const items = rows.map((row) => ({
            id: row.id,
            value: row.value,
            label: row.label,
        }));
        this.logger.log(`listMaterials: ${items.length} materials`);
        return { items };
    }
    async listMaterialsByMachine(machine, drawingType) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.samples.machine, machine)];
        if (drawingType) {
            const dbDrawingType = drawingType === 'jarvis' ? 'bitmap' : drawingType;
            conditions.push((0, drizzle_orm_1.eq)(schema_1.samples.drawingType, dbDrawingType));
        }
        const distinctMaterials = await this.db
            .selectDistinct({ material: schema_1.samples.material })
            .from(schema_1.samples)
            .where((0, drizzle_orm_1.and)(...conditions));
        if (distinctMaterials.length === 0)
            return { items: [] };
        const materialValues = distinctMaterials.map((r) => r.material);
        const rows = await this.db
            .select({
            id: schema_1.materials.id,
            value: schema_1.materials.value,
            label: schema_1.materials.label,
        })
            .from(schema_1.materials)
            .where((0, drizzle_orm_1.inArray)(schema_1.materials.value, materialValues));
        const items = rows.map((row) => ({
            id: row.id,
            value: row.value,
            label: row.label,
        }));
        this.logger.log(`listMaterialsByMachine(${machine}, ${drawingType || 'all'}): ${items.length} materials`);
        return { items };
    }
    async listSamples(filters) {
        const conditions = [];
        if (filters.machine)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.samples.machine, filters.machine));
        if (filters.material)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.samples.material, filters.material));
        if (filters.drawingType) {
            const dbDrawingType = filters.drawingType === 'jarvis' ? 'bitmap' : filters.drawingType;
            conditions.push((0, drizzle_orm_1.eq)(schema_1.samples.drawingType, dbDrawingType));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const rows = await this.db
            .select({
            id: schema_1.samples.id,
            material: schema_1.samples.material,
            drawingType: schema_1.samples.drawingType,
            machine: schema_1.samples.machine,
            referPower: schema_1.samples.referPower,
            referSpeed: schema_1.samples.referSpeed,
            referCount: schema_1.samples.referCount,
            referDensity: schema_1.samples.referDensity,
            referFreq: schema_1.samples.referFreq,
            referCustom: schema_1.samples.referCustom,
            referDotTime: schema_1.samples.referDotTime,
            referDpi: schema_1.samples.referDpi,
            referLayerHeight: schema_1.samples.referLayerHeight,
            referSpacing: schema_1.samples.referSpacing,
            imageRefer: schema_1.samples.imageRefer,
            imageShallow: schema_1.samples.imageShallow,
            imageDeep: schema_1.samples.imageDeep,
        })
            .from(schema_1.samples)
            .where(whereClause);
        const items = rows.map((row) => ({
            id: row.id,
            material: row.material,
            drawingType: row.drawingType,
            machine: row.machine ?? '',
            referPower: row.referPower ?? 0,
            referSpeed: row.referSpeed ?? 0,
            referCount: row.referCount ?? 0,
            referDensity: row.referDensity ?? 0,
            referFreq: row.referFreq ?? '',
            referCustom: row.referCustom ?? '',
            referDotTime: row.referDotTime ?? 0,
            referDpi: row.referDpi ?? 0,
            referLayerHeight: row.referLayerHeight ?? 0,
            referSpacing: row.referSpacing ?? 0,
            imageRefer: row.imageRefer ?? '',
            imageShallow: row.imageShallow ?? '',
            imageDeep: row.imageDeep ?? '',
        }));
        this.logger.log(`listSamples: ${items.length} samples, filters=${JSON.stringify(filters)}`);
        return { items };
    }
    async listDrawings(type) {
        const conditions = [];
        if (type)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.drawings.type, type));
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const rows = await this.db
            .select({
            id: schema_1.drawings.id,
            type: schema_1.drawings.type,
            style: schema_1.drawings.style,
            filename: schema_1.drawings.filename,
            filepath: schema_1.drawings.filepath,
        })
            .from(schema_1.drawings)
            .where(whereClause);
        const items = rows.map((row) => ({
            id: row.id,
            type: row.type,
            style: row.style ?? 'default',
            filename: row.filename,
            filepath: row.filepath,
        }));
        this.logger.log(`listDrawings: ${items.length} items, type=${type || 'all'}`);
        return { items };
    }
    async getDrawingFile(id) {
        const rows = await this.db
            .select({ filepath: schema_1.drawings.filepath })
            .from(schema_1.drawings)
            .where((0, drizzle_orm_1.eq)(schema_1.drawings.id, id))
            .limit(1);
        if (rows.length === 0)
            return null;
        const filepath = rows[0].filepath;
        this.logger.log(`getDrawingFile: downloading ${filepath}`);
        const { content, metadata } = await this.fileService
            .download(filepath)
            .asStream();
        return {
            content: content,
            contentType: metadata.metadata.mimeType || 'image/svg+xml',
        };
    }
    async getStorageFile(path) {
        if (!path.includes('/storage/object/'))
            return null;
        this.logger.log(`getStorageFile: downloading ${path}`);
        const { content, metadata } = await this.fileService
            .download(path)
            .asStream();
        return {
            content: content,
            contentType: metadata.metadata.mimeType || 'image/png',
        };
    }
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = PublicService_1 = tslib_1.__decorate([
    tslib_1.__param(0, (0, common_1.Inject)(fullstack_nestjs_core_1.DRIZZLE_DATABASE)),
    tslib_1.__metadata("design:paramtypes", [Function, fullstack_nestjs_core_1.FileService])
], PublicService);
