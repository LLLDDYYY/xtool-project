import { type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { drawings, samples } from '../../database/schema';
import type { IAdminAccount, IAdminLoginResponse, IAnalyzeMaterialResponse } from '@shared/api.interface';
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}
export declare class XtoolService {
    private readonly db;
    private readonly logger;
    constructor(db: PostgresJsDatabase);
    private signSessionToken;
    private verifySessionToken;
    listDrawings(params: {
        type?: string;
        style?: string;
        page: number;
        limit: number;
    }): Promise<PaginatedResult<typeof drawings.$inferSelect>>;
    listStyles(): Promise<{
        id: string;
        value: string;
        label: string;
        createdAt: Date;
        createdBy: string;
        updatedAt: Date;
        updatedBy: string;
    }[]>;
    createDrawing(data: {
        type: string;
        style: string;
        filename: string;
        filepath: string;
        description?: string;
    }): Promise<import("postgres").RowList<never[]>>;
    deleteDrawing(id: string): Promise<import("postgres").RowList<never[]>>;
    updateDrawing(id: string, data: Record<string, unknown>): Promise<import("postgres").RowList<never[]>>;
    listSamples(params: {
        material?: string;
        drawingType?: string;
        machine?: string;
        page: number;
        limit: number;
    }): Promise<PaginatedResult<typeof samples.$inferSelect>>;
    listAllSamples(): Promise<{
        id: string;
        material: string;
        drawingType: string;
        machine: string;
        referPower: number;
        referSpeed: number;
        referCount: number;
        referDensity: number;
        referFreq: string;
        referCustom: string;
        referDotTime: number;
        referDpi: number;
        referLayerHeight: number;
        referSpacing: number;
        imageRefer: string;
        imageShallow: string;
        imageDeep: string;
        createdAt: Date;
        createdBy: string;
        updatedAt: Date;
        updatedBy: string;
    }[]>;
    createSample(data: {
        material: string;
        drawingType: string;
        machine?: string;
        referPower?: number;
        referSpeed?: number;
        referCount?: number;
        referDensity?: number;
        referFreq?: string;
        referCustom?: string;
        referDotTime?: number;
        referDpi?: number;
        referLayerHeight?: number;
        referSpacing?: number;
        imageRefer?: string;
        imageShallow?: string;
        imageDeep?: string;
    }): Promise<import("postgres").RowList<never[]>>;
    updateSample(id: string, data: Record<string, unknown>): Promise<import("postgres").RowList<never[]>>;
    deleteSample(id: string): Promise<import("postgres").RowList<never[]>>;
    findDuplicateSample(machine: string, material: string, drawingType: string): Promise<{
        id: string;
        material: string;
        drawingType: string;
        machine: string;
        referPower: number;
        referSpeed: number;
        referCount: number;
        referDensity: number;
        referFreq: string;
        referCustom: string;
        referDotTime: number;
        referDpi: number;
        referLayerHeight: number;
        referSpacing: number;
        imageRefer: string;
        imageShallow: string;
        imageDeep: string;
        createdAt: Date;
        createdBy: string;
        updatedAt: Date;
        updatedBy: string;
    }>;
    batchImportSamples(rawRecords: Array<{
        id: string;
        record: Record<string, unknown>;
    }>): Promise<{
        added: number;
        updated: number;
        errors: string[];
    }>;
    private ensureMaterialsExist;
    private mapBitableRecord;
    recognizeText(text: string): Promise<Record<string, unknown>>;
    listMaterials(): Promise<{
        id: string;
        value: string;
        label: string;
        createdAt: Date;
        createdBy: string;
        updatedAt: Date;
        updatedBy: string;
        category: string;
    }[]>;
    createMaterial(data: {
        value: string;
        label?: string;
    }): Promise<import("postgres").RowList<never[]>>;
    deleteMaterial(id: string): Promise<import("postgres").RowList<never[]>>;
    updateMaterial(id: string, data: {
        value?: string;
        label?: string;
    }): Promise<import("postgres").RowList<never[]>>;
    createStyle(data: {
        value: string;
        label?: string;
    }): Promise<import("postgres").RowList<never[]>>;
    updateStyle(id: string, data: {
        value?: string;
        label?: string;
    }): Promise<import("postgres").RowList<never[]>>;
    deleteStyle(id: string): Promise<import("postgres").RowList<never[]>>;
    listMachines(): Promise<{
        id: string;
        value: string;
        label: string;
        supportedTypes: string;
        createdAt: Date;
        createdBy: string;
        updatedAt: Date;
        updatedBy: string;
    }[]>;
    createMachine(data: {
        value: string;
        label?: string;
        supportedTypes?: string[];
    }): Promise<import("postgres").RowList<never[]>>;
    updateMachine(id: string, data: {
        label?: string;
        supportedTypes?: string[];
    }): Promise<import("postgres").RowList<never[]>>;
    deleteMachine(id: string): Promise<import("postgres").RowList<never[]>>;
    getSiteSetting(key: string): Promise<string>;
    setSiteSetting(key: string, value: string): Promise<void>;
    private hashPassword;
    adminLogin(username: string, password: string): Promise<IAdminLoginResponse | null>;
    verifySession(token: string): Promise<boolean>;
    listAdminAccounts(): Promise<IAdminAccount[]>;
    createAdminAccount(data: {
        username: string;
        password: string;
        displayName: string;
        role: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteAdminAccount(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    changeAdminPassword(username: string, oldPassword: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetAdminPassword(id: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    analyzeMaterial(imageBase64: string, mimeType?: string): Promise<IAnalyzeMaterialResponse>;
    getHunyuanApiKeyConfigured(): Promise<boolean>;
    setHunyuanApiKey(key: string): Promise<void>;
    getHunyuanApiKeyId(): Promise<string>;
    setHunyuanApiKeyId(keyId: string): Promise<void>;
    getRemoveBgApiKeyConfigured(): Promise<boolean>;
    getRemoveBgApiKey(): Promise<string>;
    setRemoveBgApiKey(key: string): Promise<void>;
}
