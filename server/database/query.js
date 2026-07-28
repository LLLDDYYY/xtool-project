"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./index");
function getAll(table, orderBy = 'created_at', order = 'DESC') {
    const db = database_1.getDb();
    const results = db.exec(`SELECT * FROM ${table} ORDER BY ${orderBy} ${order}`);
    return rowsToObjects(results);
}
function getOne(table, where, params) {
    const db = database_1.getDb();
    const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
    const sql = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
    const stmt = db.prepare(sql);
    stmt.bind(params || Object.values(where));
    if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
    }
    stmt.free();
    return null;
}
function insert(table, data) {
    const db = database_1.getDb();
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    db.run(sql, values);
    database_1.saveDatabase();
    return { success: true };
}
function update(table, data, where, whereParams) {
    const db = database_1.getDb();
    const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    db.run(sql, [...Object.values(data), ...Object.values(where)]);
    database_1.saveDatabase();
    return { success: true };
}
function remove(table, where, params) {
    const db = database_1.getDb();
    const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    db.run(sql, params || Object.values(where));
    database_1.saveDatabase();
    return { success: true };
}
function count(table, where, params) {
    const db = database_1.getDb();
    if (where) {
        const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
        const sql = `SELECT COUNT(*) as c FROM ${table} WHERE ${whereClause}`;
        const stmt = db.prepare(sql);
        stmt.bind(params || Object.values(where));
        stmt.step();
        const result = stmt.getAsObject();
        stmt.free();
        return Number(result.c);
    }
    const results = db.exec(`SELECT COUNT(*) as c FROM ${table}`);
    return Number(results[0]?.values[0]?.[0] || 0);
}
function rowsToObjects(results) {
    if (!results || results.length === 0)
        return [];
    const { columns, values } = results[0];
    return values.map(row => {
        const obj = {};
        columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        return obj;
    });
}
function query(sql, params = []) {
    const db = database_1.getDb();
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}
function queryOne(sql, params = []) {
    const results = query(sql, params);
    return results.length > 0 ? results[0] : null;
}
function run(sql, params = []) {
    const db = database_1.getDb();
    db.run(sql, params);
    database_1.saveDatabase();
}
module.exports = { getAll, getOne, insert, update, remove, count, rowsToObjects, query, queryOne, run };
