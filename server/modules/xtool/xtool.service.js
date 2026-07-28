"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XtoolService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const query_1 = require("../../database/query");
const SESSION_SECRET = 'xtool-admin-session-a7f3b9c2e1d4';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
let XtoolService = class XtoolService {
    logger = new common_1.Logger(XtoolService.name);
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
        let sql = `SELECT * FROM drawings WHERE 1=1`;
        const p = [];
        if (type) { sql += ` AND type = ?`; p.push(type); }
        if (style) { sql += ` AND (style = ? OR style LIKE ? OR style LIKE ? OR style LIKE ?)`; p.push(style, `${style},%`, `%,${style}`, `%,${style},%`); }
        const total = query_1.count('drawings', null, null);
        sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        p.push(limit, offset);
        const items = query_1.query(sql, p);
        return { items, total, page, pageSize: limit };
    }
    async listStyles() {
        return query_1.getAll('styles', 'created_at', 'DESC');
    }
    async createDrawing(data) {
        return query_1.insert('drawings', data);
    }
    async deleteDrawing(id) {
        return query_1.remove('drawings', { id });
    }
    async updateDrawing(id, data) {
        return query_1.update('drawings', data, { id });
    }
    // ========== Samples ==========
    async listSamples(params) {
        const { material, drawingType, machine, page, limit } = params;
        const offset = (page - 1) * limit;
        let sql = `SELECT * FROM samples WHERE 1=1`;
        const p = [];
        if (material) { sql += ` AND material = ?`; p.push(material); }
        if (drawingType) { sql += ` AND drawing_type = ?`; p.push(drawingType); }
        if (machine) { sql += ` AND machine = ?`; p.push(machine); }
        const total = query_1.count('samples', null, null);
        sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        p.push(limit, offset);
        const items = query_1.query(sql, p);
        return { items, total, page, pageSize: limit };
    }
    async listAllSamples() {
        return query_1.getAll('samples', 'created_at', 'DESC');
    }
    async createSample(data) {
        return query_1.insert('samples', data);
    }
    async updateSample(id, data) {
        return query_1.update('samples', data, { id });
    }
    async deleteSample(id) {
        return query_1.remove('samples', { id });
    }
    async findDuplicateSample(machine, material, drawingType) {
        return query_1.getOne('samples', { machine, material, drawing_type: drawingType });
    }
    async batchImportSamples(rawRecords) {
        let added = 0;
        let updated = 0;
        const errors = [];
        const validMachines = query_1.getAll('machines');
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
        const existing = query_1.getAll('materials');
        const existingSet = new Set(existing.map((r) => r.value));
        const newMaterials = values.filter((v) => !existingSet.has(v));
        for (const v of newMaterials) {
            try {
                query_1.insert('materials', { value: v, label: v });
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
            refer_power: getNum(findField(['功率', '功率%', 'refer_power', 'power'])),
            refer_speed: getNum(findField(['速度', '速度mm/s', 'refer_speed', 'speed'])),
            refer_count: getNum(findField(['次数', 'refer_count', 'count'])),
            refer_density: getNum(findField(['密度', 'refer_density', 'density'])),
            refer_freq: getText(findField(['频率', '频率kHz', 'refer_freq', 'freq'])),
            refer_dot_time: getNum(findField(['打点时间', '打点时间us', 'refer_dot_time'])),
            refer_dpi: getNum(findField(['DPI', 'dpi', 'refer_dpi'])),
            refer_layer_height: getNum(findField(['层高', '层深', 'refer_layer_height'])),
            refer_spacing: getNum(findField(['间距', 'refer_spacing'])),
        };
    }
    // ========== AI Recognize ==========
    async recognizeText(text) {
        const result = {};
        const allMachines = query_1.getAll('machines');
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
        const allMaterials = query_1.getAll('materials');
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
                        query_1.insert('materials', { value: candidate });
                        this.logger.log(`Auto-created material from recognition: ${candidate}`);
                    }
                    result.material = candidate;
                }
            }
        }
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
        return query_1.getAll('materials');
    }
    async createMaterial(data) {
        return query_1.insert('materials', data);
    }
    async deleteMaterial(id) {
        return query_1.remove('materials', { id });
    }
    async updateMaterial(id, data) {
        const old = query_1.getOne('materials', { id });
        const oldValue = old?.value;
        const result = query_1.update('materials', data, { id });
        if (oldValue && data.value && oldValue !== data.value) {
            query_1.run(`UPDATE samples SET material = ? WHERE material = ?`, [data.value, oldValue]);
        }
        return result;
    }
    // ========== Styles ==========
    async createStyle(data) {
        return query_1.insert('styles', data);
    }
    async updateStyle(id, data) {
        return query_1.update('styles', data, { id });
    }
    async deleteStyle(id) {
        return query_1.remove('styles', { id });
    }
    // ========== Machines ==========
    async listMachines() {
        return query_1.getAll('machines');
    }
    async createMachine(data) {
        return query_1.insert('machines', {
            value: data.value,
            label: data.label || '',
            supported_types: data.supportedTypes ? JSON.stringify(data.supportedTypes) : '[]',
        });
    }
    async updateMachine(id, data) {
        return query_1.update('machines', data, { id });
    }
    async deleteMachine(id) {
        return query_1.remove('machines', { id });
    }
    // ========== Site Settings ==========
    async getSiteSetting(key) {
        const row = query_1.getOne('site_settings', { key });
        return row ? (row.value || '') : '';
    }
    async setSiteSetting(key, value) {
        query_1.remove('site_settings', { key });
        return query_1.insert('site_settings', { key, value });
    }
    // ========== Admin Accounts ==========
    hashPassword(password) {
        return (0, crypto_1.createHash)('md5').update(password).digest('hex');
    }
    async adminLogin(username, password) {
        const hash = this.hashPassword(password);
        const row = query_1.getOne('admin_accounts', { username });
        if (!row || row.password_hash !== hash) {
            return null;
        }
        const expiresAt = Date.now() + SESSION_TTL_MS;
        const token = this.signSessionToken(username, expiresAt);
        this.logger.log(`Admin login success: ${username}`);
        return {
            success: true,
            token,
            username: row.username,
            displayName: row.display_name || '',
            role: row.role || 'admin',
        };
    }
    async verifySession(token) {
        if (!token)
            return false;
        return this.verifySessionToken(token).valid;
    }
    async listAdminAccounts() {
        const rows = query_1.getAll('admin_accounts', 'created_at', 'ASC');
        return rows.map((row) => ({
            id: row.id,
            username: row.username,
            displayName: row.display_name || '',
            role: row.role || 'admin',
            createdAt: row.created_at,
        }));
    }
    async createAdminAccount(data) {
        const existing = query_1.getOne('admin_accounts', { username: data.username });
        if (existing) {
            return { success: false, message: '用户名已存在' };
        }
        query_1.insert('admin_accounts', {
            username: data.username,
            password_hash: this.hashPassword(data.password),
            display_name: data.displayName,
            role: data.role,
        });
        this.logger.log(`Admin account created: ${data.username}`);
        return { success: true, message: '创建成功' };
    }
    async deleteAdminAccount(id) {
        const account = query_1.getOne('admin_accounts', { id });
        if (account && account.role === 'superadmin') {
            const superCount = query_1.count('admin_accounts', null, null);
            if (superCount <= 1) {
                return { success: false, message: '不能删除最后一个超级管理员' };
            }
        }
        query_1.remove('admin_accounts', { id });
        this.logger.log(`Admin account deleted: ${id}`);
        return { success: true, message: '删除成功' };
    }
    async changeAdminPassword(username, oldPassword, newPassword) {
        const row = query_1.getOne('admin_accounts', { username });
        if (!row) {
            return { success: false, message: '用户不存在' };
        }
        if (row.password_hash !== this.hashPassword(oldPassword)) {
            return { success: false, message: '旧密码不正确' };
        }
        query_1.update('admin_accounts', { password_hash: this.hashPassword(newPassword) }, { username });
        this.logger.log(`Admin password changed: ${username}`);
        return { success: true, message: '密码修改成功' };
    }
    async resetAdminPassword(id, newPassword) {
        query_1.update('admin_accounts', { password_hash: this.hashPassword(newPassword) }, { id });
        this.logger.log(`Admin password reset: ${id}`);
        return { success: true, message: '密码重置成功' };
    }
    // ========== AI Material Analysis (Hunyuan Vision) ==========
    async analyzeMaterial(imageBase64, mimeType) {
        const apiKey = await this.getSiteSetting('hunyuan_api_key');
        if (!apiKey) {
            return { success: false, material: '', color: '', rawText: '', error: '请先在系统设置中配置腾讯混元 API Key' };
        }
        const prompt = '请分析图中产品的材质和颜色。判断规则：表面平整哑光、无凹凸纹理、有弹性感 → 硅胶；表面硬朗、有纹理颗粒感，反光较强、接缝明显 → 塑料。品类先验：手机壳类表面平整哑光无明显纹理优先判硅胶；耳机壳/充电仓保护壳即使表面平整也优先判塑料；烟杆类默认优先认定为金属或塑料，有金属光泽则是金属。材质从①木材 ②金属 ③塑料 ④硅胶 ⑤玻璃 ⑥陶瓷 ⑦布料 ⑧皮革 ⑨石材 ⑩纸质 ⑪碳纤维 ⑫其他中选。输出格式：「颜色+材质+物品名称」，如"米白色硅胶手机壳"。仅输出这一句。';
        try {
            const response = await fetch('https://tokenhub.tencentmaas.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'hy-vision-2.0-instruct',
                    messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` } }, { type: 'text', text: prompt }] }],
                }),
            });
            if (!response.ok) {
                const errText = await response.text();
                this.logger.error(`Hunyuan API error: ${response.status} - ${errText}`);
                return { success: false, material: '', color: '', rawText: '', error: `腾讯混元 API 返回错误 (${response.status})` };
            }
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';
            const text = content.trim().replace(/<[|｜][^|｜]*[|｜]>/g, '').replace(/^["""]+|["""\s]+$/g, '').trim();
            const materialKeywords = ['碳纤维', '亚克力', '不锈钢', '木材', '金属', '塑料', '硅胶', '玻璃', '陶瓷', '布料', '皮革', '石材', '纸质', '软木', '竹材', '橡胶', '树脂', '尼龙', '铝合金', '钛合金'];
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
            return { success: true, material, color, rawText: text };
        }
        catch (err) {
            this.logger.error(`Hunyuan API call failed: ${JSON.stringify(String(err))}`);
            return { success: false, material: '', color: '', rawText: '', error: `调用腾讯混元 API 失败: ${String(err)}` };
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
        return key && key.length > 0;
    }
    async getRemoveBgApiKey() {
        return this.getSiteSetting('removebg_api_key');
    }
    async setRemoveBgApiKey(key) {
        await this.setSiteSetting('removebg_api_key', key);
    }
};
exports.XtoolService = XtoolService;
tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], XtoolService);
