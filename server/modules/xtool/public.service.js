"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const query_1 = require("../../database/query");
const file_service_1 = require("../../common/services/file.service");
let PublicService = class PublicService {
    logger = new common_1.Logger(PublicService.name);
    fileService = new file_service_1.LocalFileService();
    async listMachines() {
        const rows = query_1.getAll('machines');
        const items = rows.map((row) => {
            let parsed = [];
            try {
                parsed = JSON.parse(row.supported_types || '[]');
            }
            catch {
                this.logger.log(`Failed to parse supported_types for machine ${row.id}: ${row.supported_types}`);
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
        const rows = query_1.getAll('materials');
        const items = rows.map((row) => ({
            id: row.id,
            value: row.value,
            label: row.label,
        }));
        this.logger.log(`listMaterials: ${items.length} materials`);
        return { items };
    }
    async listMaterialsByMachine(machine, drawingType) {
        const dbDrawingType = drawingType === 'jarvis' ? 'bitmap' : drawingType;
        let sql = `SELECT DISTINCT material FROM samples WHERE machine = ?`;
        const p = [machine];
        if (dbDrawingType) {
            sql += ` AND drawing_type = ?`;
            p.push(dbDrawingType);
        }
        const distinctMaterials = query_1.query(sql, p);
        if (distinctMaterials.length === 0)
            return { items: [] };
        const materialValues = distinctMaterials.map((r) => r.material);
        const placeholders = materialValues.map(() => '?').join(',');
        const rows = query_1.query(`SELECT id, value, label FROM materials WHERE value IN (${placeholders})`, materialValues);
        const items = rows.map((row) => ({
            id: row.id,
            value: row.value,
            label: row.label,
        }));
        this.logger.log(`listMaterialsByMachine(${machine}, ${drawingType || 'all'}): ${items.length} materials`);
        return { items };
    }
    async listSamples(filters) {
        let sql = `SELECT id, material, drawing_type, machine, refer_power, refer_speed, refer_count, refer_density, refer_freq, refer_custom, refer_dot_time, refer_dpi, refer_layer_height, refer_spacing, image_refer, image_shallow, image_deep FROM samples WHERE 1=1`;
        const p = [];
        if (filters.machine) { sql += ` AND machine = ?`; p.push(filters.machine); }
        if (filters.material) { sql += ` AND material = ?`; p.push(filters.material); }
        if (filters.drawingType) {
            const dbDrawingType = filters.drawingType === 'jarvis' ? 'bitmap' : filters.drawingType;
            sql += ` AND drawing_type = ?`;
            p.push(dbDrawingType);
        }
        const rows = query_1.query(sql, p);
        const items = rows.map((row) => ({
            id: row.id,
            material: row.material,
            drawingType: row.drawing_type,
            machine: row.machine || '',
            referPower: row.refer_power || 0,
            referSpeed: row.refer_speed || 0,
            referCount: row.refer_count || 0,
            referDensity: row.refer_density || 0,
            referFreq: row.refer_freq || '',
            referCustom: row.refer_custom || '',
            referDotTime: row.refer_dot_time || 0,
            referDpi: row.refer_dpi || 0,
            referLayerHeight: row.refer_layer_height || 0,
            referSpacing: row.refer_spacing || 0,
            imageRefer: row.image_refer || '',
            imageShallow: row.image_shallow || '',
            imageDeep: row.image_deep || '',
        }));
        this.logger.log(`listSamples: ${items.length} samples, filters=${JSON.stringify(filters)}`);
        return { items };
    }
    async listDrawings(type) {
        let sql = `SELECT id, type, style, filename, filepath FROM drawings`;
        const p = [];
        if (type) { sql += ` WHERE type = ?`; p.push(type); }
        sql += ` ORDER BY created_at DESC`;
        const rows = query_1.query(sql, p);
        const items = rows.map((row) => ({
            id: row.id,
            type: row.type,
            style: row.style || 'default',
            filename: row.filename,
            filepath: row.filepath,
        }));
        this.logger.log(`listDrawings: ${items.length} items, type=${type || 'all'}`);
        return { items };
    }
    async getDrawingFile(id) {
        const row = query_1.getOne('drawings', { id });
        if (!row)
            return null;
        const filepath = row.filepath;
        this.logger.log(`getDrawingFile: downloading ${filepath}`);
        const result = await this.fileService.download(filepath);
        if (!result)
            return null;
        return {
            content: result.buffer,
            contentType: result.contentType,
        };
    }
    async getStorageFile(path) {
        if (!path.includes('/storage/object/'))
            return null;
        this.logger.log(`getStorageFile: downloading ${path}`);
        const result = await this.fileService.download(path);
        if (!result)
            return null;
        return {
            content: result.buffer,
            contentType: result.contentType,
        };
    }
};
exports.PublicService = PublicService;
tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], PublicService);
