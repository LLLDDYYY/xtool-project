"use strict";
var XtoolService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XtoolService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const fullstack_nestjs_core_1 = require("@lark-apaas/fullstack-nestjs-core");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
const schema_1 = require("../../database/schema");
const SESSION_SECRET = 'xtool-admin-session-a7f3b9c2e1d4';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
let XtoolService = XtoolService_1 = class XtoolService {
    db;
    logger = new common_1.Logger(XtoolService_1.name);
    constructor(db) {
        this.db = db;
    }
    signSessionToken(username, expiresAt) {
        const payload = `${username}|${expiresAt}`;
        const sig = (0, crypto_1.createHmac)('sha256', SESSION_SECRET).update(payload).digest('base64url');
        return Buffer.from(`${payload}|${sig}`).toString('base64url');
    }
    verifySessionToken(token) {
        try {
            const decoded = Buffer.from(token, 'base64url').toString('utf-8');
            const parts = decoded.split('|');
            if (parts.length !== 3)
                return { valid: false };
            const [username, expiresStr, sig] = parts;
            const expiresAt = Number(expiresStr);
            if (!expiresAt || Date.now() > expiresAt)
                return { valid: false };
            const payload = `${username}|${expiresAt}`;
            const expected = (0, crypto_1.createHmac)('sha256', SESSION_SECRET).update(payload).digest('base64url');
            if (sig !== expected)
                return { valid: false };
            return { valid: true, username };
        }
        catch {
            return { valid: false };
        }
    }
    // ========== Drawings ==========
    async listDrawings(params) {
        const { type, style, page, limit } = params;
        const offset = (page - 1) * limit;
        const conditions = [];
        if (type)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.drawings.type, type));
        if (style) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.drawings.style, style), (0, drizzle_orm_1.like)(schema_1.drawings.style, `${style},%`), (0, drizzle_orm_1.like)(schema_1.drawings.style, `%,${style}`), (0, drizzle_orm_1.like)(schema_1.drawings.style, `%,${style},%`)));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const countResult = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.drawings)
            .where(whereClause);
        const total = Number(countResult[0].count);
        const items = await this.db
            .select()
            .from(schema_1.drawings)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.drawings.createdAt))
            .limit(limit)
            .offset(offset);
        return { items, total, page, pageSize: limit };
    }
    async listStyles() {
        return this.db.select().from(schema_1.styles);
    }
    async createDrawing(data) {
        return this.db.insert(schema_1.drawings).values(data);
    }
    async deleteDrawing(id) {
        return this.db.delete(schema_1.drawings).where((0, drizzle_orm_1.eq)(schema_1.drawings.id, id));
    }
    async updateDrawing(id, data) {
        const updateData = {};
        if (data.type !== undefined)
            updateData.type = data.type;
        if (data.style !== undefined)
            updateData.style = data.style;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.filename !== undefined)
            updateData.filename = data.filename;
        if (data.filepath !== undefined)
            updateData.filepath = data.filepath;
        return this.db.update(schema_1.drawings).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.drawings.id, id));
    }
    // ========== Samples ==========
    async listSamples(params) {
        const { material, drawingType, machine, page, limit } = params;
        const offset = (page - 1) * limit;
        const conditions = [];
        if (material)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.samples.material, material));
        if (drawingType)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.samples.drawingType, drawingType));
        if (machine)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.samples.machine, machine));
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const countResult = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.samples)
            .where(whereClause);
        const total = Number(countResult[0].count);
        const items = await this.db
            .select()
            .from(schema_1.samples)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.samples.createdAt))
            .limit(limit)
            .offset(offset);
        return { items, total, page, pageSize: limit };
    }
    async listAllSamples() {
        return this.db.select().from(schema_1.samples);
    }
    async createSample(data) {
        return this.db.insert(schema_1.samples).values(data);
    }
    async updateSample(id, data) {
        return this.db.update(schema_1.samples).set(data).where((0, drizzle_orm_1.eq)(schema_1.samples.id, id));
    }
    async deleteSample(id) {
        return this.db.delete(schema_1.samples).where((0, drizzle_orm_1.eq)(schema_1.samples.id, id));
    }
    async findDuplicateSample(machine, material, drawingType) {
        const result = await this.db
            .select()
            .from(schema_1.samples)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.samples.machine, machine), (0, drizzle_orm_1.eq)(schema_1.samples.material, material), (0, drizzle_orm_1.eq)(schema_1.samples.drawingType, drawingType)))
            .limit(1);
        return result.length > 0 ? result[0] : null;
    }
    async batchImportSamples(rawRecords) {
        let added = 0;
        let updated = 0;
        const errors = [];
        const validMachines = await this.db
            .select({ value: schema_1.machines.value })
            .from(schema_1.machines);
        const validMachineSet = new Set(validMachines.map((m) => m.value));
        const validDrawingTypes = new Set(['vector', 'bitmap', 'depth']);
        for (let i = 0; i < rawRecords.length; i++) {
            const raw = rawRecords[i];
            const rec = raw.record;
            try {
                const mapped = this.mapBitableRecord(rec);
                if (!mapped.material || !mapped.machine || !mapped.drawingType) {
                    errors.push(`第${i + 1}条: 缺少必填字段(材质/机型/图纸类型)`);
                    continue;
                }
                if (!validMachineSet.has(mapped.machine)) {
                    errors.push(`第${i + 1}条: 机型「${mapped.machine}」不在系统机型列表中，已跳过`);
                    continue;
                }
                if (!validDrawingTypes.has(mapped.drawingType)) {
                    errors.push(`第${i + 1}条: 图纸类型「${mapped.drawingType}」无法识别，已跳过`);
                    continue;
                }
                const existing = await this.findDuplicateSample(mapped.machine, mapped.material, mapped.drawingType);
                if (existing) {
                    await this.updateSample(existing.id, mapped);
                    updated++;
                }
                else {
                    await this.createSample(mapped);
                    added++;
                }
            }
            catch (err) {
                errors.push(`第${i + 1}条: ${err.message}`);
            }
        }
        const materialValues = new Set();
        for (const raw of rawRecords) {
            const rec = raw.record;
            const mat = String(rec['材质'] || rec['材料'] || rec['material'] || '').trim();
            if (mat)
                materialValues.add(mat);
        }
        if (materialValues.size > 0) {
            await this.ensureMaterialsExist([...materialValues]);
        }
        return { added, updated, errors };
    }
    async ensureMaterialsExist(values) {
        if (values.length === 0)
            return;
        const existing = await this.db
            .select({ value: schema_1.materials.value })
            .from(schema_1.materials)
            .where((0, drizzle_orm_1.inArray)(schema_1.materials.value, values));
        const existingSet = new Set(existing.map((r) => r.value));
        const newMaterials = values.filter((v) => !existingSet.has(v));
        for (const v of newMaterials) {
            try {
                await this.db.insert(schema_1.materials).values({ value: v, label: v });
                this.logger.log(`Auto-created material: ${v}`);
            }
            catch (err) {
                this.logger.warn(`Failed to auto-create material ${v}: ${err.message}`);
            }
        }
    }
    mapBitableRecord(rec) {
        const getText = (val) => {
            if (val == null)
                return '';
            if (typeof val === 'object' && val !== null && 'text' in val) {
                return String(val.text || '');
            }
            return String(val);
        };
        const getNum = (val) => {
            if (val == null)
                return 0;
            const n = Number(val);
            return isNaN(n) ? 0 : Math.round(n);
        };
        const findField = (names) => {
            for (const n of names) {
                if (rec[n] !== undefined && rec[n] !== null)
                    return rec[n];
            }
            return undefined;
        };
        const materialVal = getText(findField(['材质', '材料', 'material']));
        const machineVal = getText(findField(['机型', '机器', '设备', 'machine']));
        let drawingTypeVal = getText(findField(['图纸类型', '图纸', '类型', 'drawing_type']));
        drawingTypeVal = drawingTypeVal.toLowerCase();
        if (drawingTypeVal.includes('矢量') || drawingTypeVal === 'vector') {
            drawingTypeVal = 'vector';
        }
        else if (drawingTypeVal.includes('位图') || drawingTypeVal === 'bitmap') {
            drawingTypeVal = 'bitmap';
        }
        else if (drawingTypeVal.includes('深度') || drawingTypeVal === 'depth') {
            drawingTypeVal = 'depth';
        }
        return {
            material: materialVal,
            machine: machineVal,
            drawingType: drawingTypeVal,
            referPower: getNum(findField(['功率', '功率%', 'refer_power', 'power'])),
            referSpeed: getNum(findField(['速度', '速度mm/s', 'refer_speed', 'speed'])),
            referCount: getNum(findField(['次数', 'refer_count', 'count'])),
            referDensity: getNum(findField(['密度', 'refer_density', 'density'])),
            referFreq: getText(findField(['频率', '频率kHz', 'refer_freq', 'freq'])),
            referDotTime: getNum(findField(['打点时间', '打点时间us', 'refer_dot_time'])),
            referDpi: getNum(findField(['DPI', 'dpi', 'refer_dpi'])),
            referLayerHeight: getNum(findField(['层高', '层深', 'refer_layer_height'])),
            referSpacing: getNum(findField(['间距', 'refer_spacing'])),
        };
    }
    // ========== AI Recognize ==========
    async recognizeText(text) {
        const result = {};
        const allMachines = await this.db.select().from(schema_1.machines);
        for (const m of allMachines) {
            if (m.value && text.includes(m.value)) {
                result.machine = m.value;
                break;
            }
            if (m.label && m.label !== m.value && text.includes(m.label)) {
                result.machine = m.value;
                break;
            }
        }
        if (!result.machine) {
            const machineAliases = {
                'F2U UV': 'F2U UV',
                'F2 Ultra UV': 'F2U UV',
                'F1U': 'xTool F1U',
                'M2': 'xTool M2',
                'M3': 'xTool M3',
            };
            for (const [alias, value] of Object.entries(machineAliases)) {
                if (text.includes(alias)) {
                    result.machine = value;
                    break;
                }
            }
        }
        const typePatterns = {
            矢量图: 'vector',
            位图: 'bitmap',
            深度图: 'depth',
            浮雕: 'depth',
        };
        for (const [pattern, value] of Object.entries(typePatterns)) {
            if (text.includes(pattern)) {
                result.drawingType = value;
                break;
            }
        }
        const allMaterials = await this.db.select().from(schema_1.materials);
        for (const mat of allMaterials) {
            if (mat.value && text.includes(mat.value)) {
                result.material = mat.value;
                break;
            }
            if (mat.label && mat.label !== mat.value && text.includes(mat.label)) {
                result.material = mat.value;
                break;
            }
        }
        if (!result.material) {
            const colonIdx = text.indexOf('：');
            const searchRange = colonIdx >= 0 ? text.substring(0, colonIdx) : text;
            const segments = searchRange.split('、').map(s => s.trim()).filter(Boolean);
            const drawingKeywords = ['矢量图', '矢量', '位图', '深度图', '浮雕', '线稿', '线稿位图'];
            if (segments.length >= 2) {
                const candidate = segments.find((s, i) => i > 0 && !drawingKeywords.some(kw => s.includes(kw)));
                if (candidate && candidate !== result.machine) {
                    const exists = allMaterials.some(m => m.value === candidate || m.label === candidate);
                    if (!exists) {
                        await this.db.insert(schema_1.materials).values({ value: candidate });
                        this.logger.log(`Auto-created material from recognition: ${candidate}`);
                    }
                    result.material = candidate;
                }
            }
        }
        // 识别参数 - 正则提取
        const powerMatch = text.match(/功率[：:]?\s*(\d+)/);
        if (powerMatch)
            result.referPower = parseInt(powerMatch[1], 10);
        const speedMatch = text.match(/速度[：:]?\s*(\d+)/);
        if (speedMatch)
            result.referSpeed = parseInt(speedMatch[1], 10);
        const countMatch = text.match(/次数[：:]?\s*(\d+)/);
        if (countMatch)
            result.referCount = parseInt(countMatch[1], 10);
        const densityMatch = text.match(/密度[：:]?\s*(\d+)/);
        if (densityMatch)
            result.referDensity = parseInt(densityMatch[1], 10);
        const freqMatch = text.match(/频率[：:]?\s*(\S+)/);
        if (freqMatch)
            result.referFreq = freqMatch[1];
        const dotTimeMatch = text.match(/打点时间[：:]?\s*(\d+)/);
        if (dotTimeMatch)
            result.referDotTime = parseInt(dotTimeMatch[1], 10);
        const dpiMatch = text.match(/DPI[：:]?\s*(\d+)/i);
        if (dpiMatch)
            result.referDpi = parseInt(dpiMatch[1], 10);
        return result;
    }
    // ========== Materials ==========
    async listMaterials() {
        return this.db.select().from(schema_1.materials);
    }
    async createMaterial(data) {
        return this.db.insert(schema_1.materials).values(data);
    }
    async deleteMaterial(id) {
        return this.db.delete(schema_1.materials).where((0, drizzle_orm_1.eq)(schema_1.materials.id, id));
    }
    async updateMaterial(id, data) {
        const updateData = {};
        if (data.value !== undefined)
            updateData.value = data.value;
        if (data.label !== undefined)
            updateData.label = data.label;
        let oldValue;
        if (data.value !== undefined) {
            const old = await this.db.select({ value: schema_1.materials.value }).from(schema_1.materials).where((0, drizzle_orm_1.eq)(schema_1.materials.id, id)).limit(1);
            oldValue = old[0]?.value;
        }
        const result = await this.db.update(schema_1.materials).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.materials.id, id));
        if (oldValue && data.value && oldValue !== data.value) {
            await this.db.update(schema_1.samples).set({ material: data.value }).where((0, drizzle_orm_1.eq)(schema_1.samples.material, oldValue));
        }
        return result;
    }
    // ========== Styles ==========
    async createStyle(data) {
        return this.db.insert(schema_1.styles).values(data);
    }
    async updateStyle(id, data) {
        const updateData = {};
        if (data.value !== undefined)
            updateData.value = data.value;
        if (data.label !== undefined)
            updateData.label = data.label;
        return this.db.update(schema_1.styles).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.styles.id, id));
    }
    async deleteStyle(id) {
        return this.db.delete(schema_1.styles).where((0, drizzle_orm_1.eq)(schema_1.styles.id, id));
    }
    // ========== Machines ==========
    async listMachines() {
        return this.db.select().from(schema_1.machines);
    }
    async createMachine(data) {
        return this.db.insert(schema_1.machines).values({
            value: data.value,
            label: data.label || '',
            supportedTypes: data.supportedTypes
                ? JSON.stringify(data.supportedTypes)
                : '[]',
        });
    }
    async updateMachine(id, data) {
        const updateData = {};
        if (data.label !== undefined) {
            updateData.label = data.label;
        }
        if (data.supportedTypes !== undefined) {
            updateData.supportedTypes = JSON.stringify(data.supportedTypes);
        }
        return this.db.update(schema_1.machines).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.machines.id, id));
    }
    async deleteMachine(id) {
        return this.db.delete(schema_1.machines).where((0, drizzle_orm_1.eq)(schema_1.machines.id, id));
    }
    // ========== Site Settings ==========
    async getSiteSetting(key) {
        const rows = await this.db
            .select({ value: schema_1.siteSettings.value })
            .from(schema_1.siteSettings)
            .where((0, drizzle_orm_1.eq)(schema_1.siteSettings.key, key))
            .limit(1);
        return rows.length > 0 ? (rows[0].value || '') : '';
    }
    async setSiteSetting(key, value) {
        await this.db.delete(schema_1.siteSettings).where((0, drizzle_orm_1.eq)(schema_1.siteSettings.key, key));
        await this.db.insert(schema_1.siteSettings).values({ key, value });
    }
    // ========== Admin Accounts ==========
    hashPassword(password) {
        return (0, crypto_1.createHash)('md5').update(password).digest('hex');
    }
    async adminLogin(username, password) {
        const hash = this.hashPassword(password);
        const rows = await this.db
            .select({
            id: schema_1.adminAccounts.id,
            username: schema_1.adminAccounts.username,
            passwordHash: schema_1.adminAccounts.passwordHash,
            displayName: schema_1.adminAccounts.displayName,
            role: schema_1.adminAccounts.role,
        })
            .from(schema_1.adminAccounts)
            .where((0, drizzle_orm_1.eq)(schema_1.adminAccounts.username, username))
            .limit(1);
        if (rows.length === 0 || rows[0].passwordHash !== hash) {
            return null;
        }
        const expiresAt = Date.now() + SESSION_TTL_MS;
        const token = this.signSessionToken(username, expiresAt);
        this.logger.log(`Admin login success: ${username}`);
        return {
            success: true,
            token,
            username: rows[0].username,
            displayName: rows[0].displayName || '',
            role: rows[0].role || 'admin',
        };
    }
    async verifySession(token) {
        if (!token)
            return false;
        return this.verifySessionToken(token).valid;
    }
    async listAdminAccounts() {
        const rows = await this.db
            .select({
            id: schema_1.adminAccounts.id,
            username: schema_1.adminAccounts.username,
            displayName: schema_1.adminAccounts.displayName,
            role: schema_1.adminAccounts.role,
            createdAt: schema_1.adminAccounts.createdAt,
        })
            .from(schema_1.adminAccounts)
            .orderBy(schema_1.adminAccounts.createdAt);
        return rows.map((row) => ({
            id: row.id,
            username: row.username,
            displayName: row.displayName || '',
            role: row.role || 'admin',
            createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
        }));
    }
    async createAdminAccount(data) {
        const existing = await this.db
            .select({ id: schema_1.adminAccounts.id })
            .from(schema_1.adminAccounts)
            .where((0, drizzle_orm_1.eq)(schema_1.adminAccounts.username, data.username))
            .limit(1);
        if (existing.length > 0) {
            return { success: false, message: '用户名已存在' };
        }
        await this.db.insert(schema_1.adminAccounts).values({
            username: data.username,
            passwordHash: this.hashPassword(data.password),
            displayName: data.displayName,
            role: data.role,
        });
        this.logger.log(`Admin account created: ${data.username}`);
        return { success: true, message: '创建成功' };
    }
    async deleteAdminAccount(id) {
        const account = await this.db
            .select({ role: schema_1.adminAccounts.role })
            .from(schema_1.adminAccounts)
            .where((0, drizzle_orm_1.eq)(schema_1.adminAccounts.id, id))
            .limit(1);
        if (account.length > 0 && account[0].role === 'superadmin') {
            const superCount = await this.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.adminAccounts)
                .where((0, drizzle_orm_1.eq)(schema_1.adminAccounts.role, 'superadmin'));
            if (Number(superCount[0].count) <= 1) {
                return { success: false, message: '不能删除最后一个超级管理员' };
            }
        }
        await this.db.delete(schema_1.adminAccounts).where((0, drizzle_orm_1.eq)(schema_1.adminAccounts.id, id));
        this.logger.log(`Admin account deleted: ${id}`);
        return { success: true, message: '删除成功' };
    }
    async changeAdminPassword(username, oldPassword, newPassword) {
        const rows = await this.db
            .select({ id: schema_1.adminAccounts.id, passwordHash: schema_1.adminAccounts.passwordHash })
            .from(schema_1.adminAccounts)
            .where((0, drizzle_orm_1.eq)(schema_1.adminAccounts.username, username))
            .limit(1);
        if (rows.length === 0) {
            return { success: false, message: '用户不存在' };
        }
        if (rows[0].passwordHash !== this.hashPassword(oldPassword)) {
            return { success: false, message: '旧密码不正确' };
        }
        await this.db
            .update(schema_1.adminAccounts)
            .set({ passwordHash: this.hashPassword(newPassword) })
            .where((0, drizzle_orm_1.eq)(schema_1.adminAccounts.id, rows[0].id));
        this.logger.log(`Admin password changed: ${username}`);
        return { success: true, message: '密码修改成功' };
    }
    async resetAdminPassword(id, newPassword) {
        await this.db
            .update(schema_1.adminAccounts)
            .set({ passwordHash: this.hashPassword(newPassword) })
            .where((0, drizzle_orm_1.eq)(schema_1.adminAccounts.id, id));
        this.logger.log(`Admin password reset: ${id}`);
        return { success: true, message: '密码重置成功' };
    }
    // ========== AI Material Analysis (Hunyuan Vision) ==========
    async analyzeMaterial(imageBase64, mimeType) {
        const apiKey = await this.getSiteSetting('hunyuan_api_key');
        if (!apiKey) {
            return {
                success: false,
                material: '',
                color: '',
                rawText: '',
                error: '请先在系统设置中配置腾讯混元 API Key',
            };
        }
        const prompt = '请分析图中产品的材质和颜色。判断规则：表面平整哑光、无凹凸纹理、有弹性感 → 硅胶；表面硬朗、有纹理颗粒感、反光较强、接缝明显 → 塑料。品类先验：手机壳类表面平整哑光无明显纹理优先判硅胶；耳机壳/充电仓保护壳即使表面平整也优先判塑料；烟杆类默认优先认定为金属或塑料，有金属光泽则是金属。材质从①木材 ②金属 ③塑料 ④硅胶 ⑤玻璃 ⑥陶瓷 ⑦布料 ⑧皮革 ⑨石材 ⑩纸质 ⑪碳纤维 ⑫其他中选。输出格式：「颜色+材质+物品名称」，如"米白色硅胶手机壳"。仅输出这一句。';
        try {
            const response = await fetch('https://tokenhub.tencentmaas.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'hy-vision-2.0-instruct',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'image_url',
                                    image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` },
                                },
                                { type: 'text', text: prompt },
                            ],
                        },
                    ],
                }),
            });
            if (!response.ok) {
                const errText = await response.text();
                this.logger.error(`Hunyuan API error: ${response.status} - ${errText}`);
                return {
                    success: false,
                    material: '',
                    color: '',
                    rawText: '',
                    error: `腾讯混元 API 返回错误 (${response.status})`,
                };
            }
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';
            const text = content.trim()
                .replace(/<[|｜][^|｜]*[|｜]>/g, '')
                .replace(/^["""]+|["""\s]+$/g, '')
                .trim();
            const materialKeywords = [
                '碳纤维', '亚克力', '不锈钢',
                '木材', '金属', '塑料', '硅胶', '玻璃', '陶瓷',
                '布料', '皮革', '石材', '纸质', '软木', '竹材',
                '橡胶', '树脂', '尼龙', '铝合金', '钛合金',
            ];
            let material = '';
            let color = '';
            for (const kw of materialKeywords) {
                const idx = text.indexOf(kw);
                if (idx !== -1) {
                    material = kw;
                    color = text.slice(0, idx).trim();
                    break;
                }
            }
            if (!material) {
                const m = text.match(/^[^\s]*?([^\s]{2,4})(?=[^\s]*$)/);
                material = m?.[1] || text;
                color = '';
            }
            return {
                success: true,
                material,
                color,
                rawText: text,
            };
        }
        catch (err) {
            this.logger.error(`Hunyuan API call failed: ${JSON.stringify(String(err))}`);
            return {
                success: false,
                material: '',
                color: '',
                rawText: '',
                error: `调用腾讯混元 API 失败: ${String(err)}`,
            };
        }
    }
    async getHunyuanApiKeyConfigured() {
        const key = await this.getSiteSetting('hunyuan_api_key');
        return !!key;
    }
    async setHunyuanApiKey(key) {
        await this.setSiteSetting('hunyuan_api_key', key);
    }
    async getHunyuanApiKeyId() {
        return this.getSiteSetting('hunyuan_api_key_id');
    }
    async setHunyuanApiKeyId(keyId) {
        await this.setSiteSetting('hunyuan_api_key_id', keyId);
    }
    // ========== Remove.bg API Key ==========
    async getRemoveBgApiKeyConfigured() {
        const key = await this.getSiteSetting('removebg_api_key');
        return key.length > 0;
    }
    async getRemoveBgApiKey() {
        return this.getSiteSetting('removebg_api_key');
    }
    async setRemoveBgApiKey(key) {
        await this.setSiteSetting('removebg_api_key', key);
    }
};
exports.XtoolService = XtoolService;
exports.XtoolService = XtoolService = XtoolService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Inject)(fullstack_nestjs_core_1.DRIZZLE_DATABASE)),
    tslib_1.__metadata("design:paramtypes", [Function])
], XtoolService);
