"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stylesTable = exports.siteSettingsTable = exports.samplesTable = exports.materialsTable = exports.machinesTable = exports.drawingsTable = exports.adminSessionsTable = exports.adminAccountsTable = exports.adminSessions = exports.adminAccounts = exports.siteSettings = exports.materials = exports.samples = exports.machines = exports.styles = exports.drawings = exports.customTimestamptz = exports.fileAttachmentArray = exports.userProfileArray = exports.fileAttachment = exports.userProfile = void 0;
/* eslint-disable */
/** auto generated, do not edit */
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.userProfile = (0, pg_core_1.customType)({
    dataType() {
        return 'user_profile';
    },
    toDriver(value) {
        return (0, drizzle_orm_1.sql) `ROW(${value})::user_profile`;
    },
    fromDriver(value) {
        const [userId] = value.slice(1, -1).split(',');
        return userId.trim();
    },
});
exports.fileAttachment = (0, pg_core_1.customType)({
    dataType() {
        return 'file_attachment';
    },
    toDriver(value) {
        return (0, drizzle_orm_1.sql) `ROW(${value.bucket_id},${value.file_path})::file_attachment`;
    },
    fromDriver(value) {
        const [bucketId, filePath] = value.slice(1, -1).split(',');
        return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
    },
});
/** Escape single quotes in SQL string literals */
function escapeLiteral(str) {
    return `'${str.replace(/'/g, "''")}'`;
}
exports.userProfileArray = (0, pg_core_1.customType)({
    dataType() {
        return 'user_profile[]';
    },
    toDriver(value) {
        if (!value || value.length === 0) {
            return (0, drizzle_orm_1.sql) `'{}'::user_profile[]`;
        }
        const elements = value.map(id => `ROW(${escapeLiteral(id)})::user_profile`).join(',');
        return drizzle_orm_1.sql.raw(`ARRAY[${elements}]::user_profile[]`);
    },
    fromDriver(value) {
        if (!value || value === '{}')
            return [];
        const inner = value.slice(1, -1);
        const matches = inner.match(/\([^)]*\)/g) || [];
        return matches.map(m => m.slice(1, -1).split(',')[0].trim());
    },
});
exports.fileAttachmentArray = (0, pg_core_1.customType)({
    dataType() {
        return 'file_attachment[]';
    },
    toDriver(value) {
        if (!value || value.length === 0) {
            return (0, drizzle_orm_1.sql) `'{}'::file_attachment[]`;
        }
        const elements = value.map(f => `ROW(${escapeLiteral(f.bucket_id)},${escapeLiteral(f.file_path)})::file_attachment`).join(',');
        return drizzle_orm_1.sql.raw(`ARRAY[${elements}]::file_attachment[]`);
    },
    fromDriver(value) {
        if (!value || value === '{}')
            return [];
        const inner = value.slice(1, -1);
        const matches = inner.match(/\([^)]*\)/g) || [];
        return matches.map(m => {
            const [bucketId, filePath] = m.slice(1, -1).split(',');
            return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
        });
    },
});
exports.customTimestamptz = (0, pg_core_1.customType)({
    dataType(config) {
        const precision = typeof config?.precision !== 'undefined'
            ? ` (${config.precision})`
            : '';
        return `timestamptz${precision}`;
    },
    toDriver(value) {
        if (value == null)
            return value;
        if (typeof value === 'number') {
            return new Date(value).toISOString();
        }
        if (typeof value === 'string') {
            return value;
        }
        if (value instanceof Date) {
            return value.toISOString();
        }
        throw new Error('Invalid timestamp value');
    },
    fromDriver(value) {
        if (value instanceof Date)
            return value;
        return new Date(value);
    },
});
exports.drawings = (0, pg_core_1.pgTable)("drawings", {
    id: (0, pg_core_1.uuid)().defaultRandom().notNull(),
    type: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    style: (0, pg_core_1.varchar)({ length: 255 }).default('default'),
    filename: (0, pg_core_1.text)().notNull(),
    filepath: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)().default(''),
    // System field: Creation time (auto-filled, do not modify)
    createdAt: (0, exports.customTimestamptz)('_created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Creator (auto-filled, do not modify)
    createdBy: (0, exports.userProfile)("_created_by"),
    // System field: Update time (auto-filled, do not modify)
    updatedAt: (0, exports.customTimestamptz)('_updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Updater (auto-filled, do not modify)
    updatedBy: (0, exports.userProfile)("_updated_by"),
}, (table) => [
    (0, pg_core_1.index)("idx_drawings_style").using("btree", table.style.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("idx_drawings_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.pgPolicy)("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"], using: (0, drizzle_orm_1.sql) `(current_setting('app.user_id'::text) = ((_created_by).user_id)::text)` }),
    (0, pg_core_1.pgPolicy)("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadkdb5x3cmhw", "authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadkdb5x3cmhw"] }),
]);
exports.styles = (0, pg_core_1.pgTable)("styles", {
    id: (0, pg_core_1.uuid)().defaultRandom().notNull(),
    value: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    label: (0, pg_core_1.varchar)({ length: 255 }).default(''),
    // System field: Creation time (auto-filled, do not modify)
    createdAt: (0, exports.customTimestamptz)('_created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Creator (auto-filled, do not modify)
    createdBy: (0, exports.userProfile)("_created_by"),
    // System field: Update time (auto-filled, do not modify)
    updatedAt: (0, exports.customTimestamptz)('_updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Updater (auto-filled, do not modify)
    updatedBy: (0, exports.userProfile)("_updated_by"),
}, (table) => [
    (0, pg_core_1.pgPolicy)("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"], using: (0, drizzle_orm_1.sql) `(current_setting('app.user_id'::text) = ((_created_by).user_id)::text)` }),
    (0, pg_core_1.pgPolicy)("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadkdb5x3cmhw", "authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadkdb5x3cmhw"] }),
]);
exports.machines = (0, pg_core_1.pgTable)("machines", {
    id: (0, pg_core_1.uuid)().defaultRandom().notNull(),
    value: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    label: (0, pg_core_1.varchar)({ length: 255 }).default(''),
    supportedTypes: (0, pg_core_1.text)("supported_types").default('[]'),
    // System field: Creation time (auto-filled, do not modify)
    createdAt: (0, exports.customTimestamptz)('_created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Creator (auto-filled, do not modify)
    createdBy: (0, exports.userProfile)("_created_by"),
    // System field: Update time (auto-filled, do not modify)
    updatedAt: (0, exports.customTimestamptz)('_updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Updater (auto-filled, do not modify)
    updatedBy: (0, exports.userProfile)("_updated_by"),
}, (table) => [
    (0, pg_core_1.pgPolicy)("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"], using: (0, drizzle_orm_1.sql) `(current_setting('app.user_id'::text) = ((_created_by).user_id)::text)` }),
    (0, pg_core_1.pgPolicy)("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadkdb5x3cmhw", "authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadkdb5x3cmhw"] }),
]);
exports.samples = (0, pg_core_1.pgTable)("samples", {
    id: (0, pg_core_1.uuid)().defaultRandom().notNull(),
    material: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    drawingType: (0, pg_core_1.varchar)("drawing_type", { length: 255 }).notNull(),
    machine: (0, pg_core_1.varchar)({ length: 255 }).default('F2U UV'),
    referPower: (0, pg_core_1.integer)("refer_power").default(0),
    referSpeed: (0, pg_core_1.integer)("refer_speed").default(0),
    referCount: (0, pg_core_1.integer)("refer_count").default(0),
    referDensity: (0, pg_core_1.integer)("refer_density").default(0),
    referFreq: (0, pg_core_1.text)("refer_freq").default(''),
    referCustom: (0, pg_core_1.text)("refer_custom").default('{}'),
    referDotTime: (0, pg_core_1.integer)("refer_dot_time").default(0),
    referDpi: (0, pg_core_1.integer)("refer_dpi").default(0),
    referLayerHeight: (0, pg_core_1.integer)("refer_layer_height").default(0),
    referSpacing: (0, pg_core_1.integer)("refer_spacing").default(0),
    imageRefer: (0, pg_core_1.text)("image_refer").default(''),
    imageShallow: (0, pg_core_1.text)("image_shallow").default(''),
    imageDeep: (0, pg_core_1.text)("image_deep").default(''),
    // System field: Creation time (auto-filled, do not modify)
    createdAt: (0, exports.customTimestamptz)('_created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Creator (auto-filled, do not modify)
    createdBy: (0, exports.userProfile)("_created_by"),
    // System field: Update time (auto-filled, do not modify)
    updatedAt: (0, exports.customTimestamptz)('_updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Updater (auto-filled, do not modify)
    updatedBy: (0, exports.userProfile)("_updated_by"),
}, (table) => [
    (0, pg_core_1.index)("idx_samples_drawing_type").using("btree", table.drawingType.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("idx_samples_machine").using("btree", table.machine.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("idx_samples_material").using("btree", table.material.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.pgPolicy)("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"], using: (0, drizzle_orm_1.sql) `(current_setting('app.user_id'::text) = ((_created_by).user_id)::text)` }),
    (0, pg_core_1.pgPolicy)("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadkdb5x3cmhw", "authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadkdb5x3cmhw"] }),
]);
exports.materials = (0, pg_core_1.pgTable)("materials", {
    id: (0, pg_core_1.uuid)().defaultRandom().notNull(),
    value: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    label: (0, pg_core_1.varchar)({ length: 255 }).default(''),
    // System field: Creation time (auto-filled, do not modify)
    createdAt: (0, exports.customTimestamptz)('_created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Creator (auto-filled, do not modify)
    createdBy: (0, exports.userProfile)("_created_by"),
    // System field: Update time (auto-filled, do not modify)
    updatedAt: (0, exports.customTimestamptz)('_updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Updater (auto-filled, do not modify)
    updatedBy: (0, exports.userProfile)("_updated_by"),
    category: (0, pg_core_1.varchar)({ length: 255 }).default(''),
}, (table) => [
    (0, pg_core_1.pgPolicy)("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"], using: (0, drizzle_orm_1.sql) `(current_setting('app.user_id'::text) = ((_created_by).user_id)::text)` }),
    (0, pg_core_1.pgPolicy)("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadkdb5x3cmhw", "authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadkdb5x3cmhw"] }),
]);
exports.siteSettings = (0, pg_core_1.pgTable)("site_settings", {
    key: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    value: (0, pg_core_1.text)().default(''),
    // System field: Creation time (auto-filled, do not modify)
    createdAt: (0, exports.customTimestamptz)('_created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Creator (auto-filled, do not modify)
    createdBy: (0, exports.userProfile)("_created_by"),
    // System field: Update time (auto-filled, do not modify)
    updatedAt: (0, exports.customTimestamptz)('_updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Updater (auto-filled, do not modify)
    updatedBy: (0, exports.userProfile)("_updated_by"),
}, (table) => [
    (0, pg_core_1.pgPolicy)("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"], using: (0, drizzle_orm_1.sql) `(current_setting('app.user_id'::text) = ((_created_by).user_id)::text)` }),
    (0, pg_core_1.pgPolicy)("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadkdb5x3cmhw", "authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadkdb5x3cmhw"] }),
]);
exports.adminAccounts = (0, pg_core_1.pgTable)("admin_accounts", {
    id: (0, pg_core_1.uuid)().defaultRandom().notNull(),
    username: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    passwordHash: (0, pg_core_1.varchar)("password_hash", { length: 255 }).notNull(),
    displayName: (0, pg_core_1.varchar)("display_name", { length: 100 }).default(''),
    role: (0, pg_core_1.varchar)({ length: 50 }).default('admin'),
    // System field: Creation time (auto-filled, do not modify)
    createdAt: (0, exports.customTimestamptz)('_created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Creator (auto-filled, do not modify)
    createdBy: (0, exports.userProfile)("_created_by"),
    // System field: Update time (auto-filled, do not modify)
    updatedAt: (0, exports.customTimestamptz)('_updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Updater (auto-filled, do not modify)
    updatedBy: (0, exports.userProfile)("_updated_by"),
}, (table) => [
    (0, pg_core_1.pgPolicy)("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"], using: (0, drizzle_orm_1.sql) `(current_setting('app.user_id'::text) = ((_created_by).user_id)::text)` }),
    (0, pg_core_1.pgPolicy)("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadkdb5x3cmhw", "authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadkdb5x3cmhw"] }),
]);
exports.adminSessions = (0, pg_core_1.pgTable)("admin_sessions", {
    token: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    username: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    expiresAt: (0, pg_core_1.bigint)("expires_at", { mode: "number" }).notNull(),
    // System field: Creation time (auto-filled, do not modify)
    createdAt: (0, exports.customTimestamptz)('_created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Creator (auto-filled, do not modify)
    createdBy: (0, exports.userProfile)("_created_by"),
    // System field: Update time (auto-filled, do not modify)
    updatedAt: (0, exports.customTimestamptz)('_updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    // System field: Updater (auto-filled, do not modify)
    updatedBy: (0, exports.userProfile)("_updated_by"),
}, (table) => [
    (0, pg_core_1.index)("idx_admin_sessions_expires").using("btree", table.expiresAt.asc().nullsLast().op("int8_ops")),
    (0, pg_core_1.pgPolicy)("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"], using: (0, drizzle_orm_1.sql) `(current_setting('app.user_id'::text) = ((_created_by).user_id)::text)`, withCheck: (0, drizzle_orm_1.sql) `(current_setting('app.user_id'::text) = ((_created_by).user_id)::text)` }),
    (0, pg_core_1.pgPolicy)("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadkdb5x3cmhw", "authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkdb5x3cmhw"] }),
    (0, pg_core_1.pgPolicy)("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadkdb5x3cmhw"] }),
]);
// table aliases
exports.adminAccountsTable = exports.adminAccounts;
exports.adminSessionsTable = exports.adminSessions;
exports.drawingsTable = exports.drawings;
exports.machinesTable = exports.machines;
exports.materialsTable = exports.materials;
exports.samplesTable = exports.samples;
exports.siteSettingsTable = exports.siteSettings;
exports.stylesTable = exports.styles;
