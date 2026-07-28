import { XtoolService } from './xtool.service';
import type { IAdminCreateAccountRequest, IAdminChangePasswordRequest } from '@shared/api.interface';
export declare class XtoolController {
    private readonly xtoolService;
    private readonly logger;
    constructor(xtoolService: XtoolService);
    private verifyAdminToken;
    getDrawings(type?: string, style?: string, page?: string, limit?: string): Promise<import("./xtool.service").PaginatedResult<{
        id: string;
        type: string;
        style: string;
        filename: string;
        filepath: string;
        description: string;
        createdAt: Date;
        createdBy: string;
        updatedAt: Date;
        updatedBy: string;
    }>>;
    getDrawingStyles(): Promise<{
        id: string;
        value: string;
        label: string;
        createdAt: Date;
        createdBy: string;
        updatedAt: Date;
        updatedBy: string;
    }[]>;
    createDrawing(body: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
    }>;
    batchUploadDrawings(body: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
    }>;
    updateDrawing(id: string, body: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteDrawing(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSamples(material?: string, drawingType?: string, machine?: string, page?: string, limit?: string): Promise<import("./xtool.service").PaginatedResult<{
        id: string;
        createdAt: Date;
        createdBy: string;
        updatedAt: Date;
        updatedBy: string;
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
    }>>;
    checkDuplicateSample(machine: string, material: string, drawingType: string): Promise<{
        found: boolean;
        sample: {
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
        };
    }>;
    exportSamples(): Promise<{
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
    batchImportSamples(body: {
        records: Array<{
            id: string;
            record: Record<string, unknown>;
        }>;
    }): Promise<{
        success: boolean;
        added: number;
        updated: number;
        errors: string[];
    }>;
    createSample(body: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
    }>;
    updateSample(id: string, body: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteSample(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getMaterials(): Promise<{
        id: string;
        value: string;
        label: string;
        createdAt: Date;
        createdBy: string;
        updatedAt: Date;
        updatedBy: string;
        category: string;
    }[]>;
    createMaterial(body: {
        value: string;
        label?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    updateMaterial(id: string, body: {
        value?: string;
        label?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteMaterial(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getMachines(): Promise<{
        id: string;
        value: string;
        label: string;
        supportedTypes: string;
        createdAt: Date;
        createdBy: string;
        updatedAt: Date;
        updatedBy: string;
    }[]>;
    createMachine(body: {
        value: string;
        label?: string;
        supportedTypes?: string[];
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    updateMachine(id: string, body: {
        label?: string;
        supportedTypes?: string[];
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteMachine(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    analyzeMaterial(body: {
        imageBase64: string;
        mimeType?: string;
    }): Promise<import("@shared/api.interface").IAnalyzeMaterialResponse>;
    getHunyuanApiKeyStatus(token: string): Promise<{
        configured: boolean;
        apiKeyId: string;
    }>;
    setHunyuanApiKey(token: string, body: {
        apiKey: string;
        apiKeyId?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    recognizeText(body: {
        text: string;
    }): Promise<Record<string, unknown>>;
    recognizeTextBatch(body: {
        texts: string[];
    }): Promise<{
        results: {
            text: string;
            recognized: Record<string, unknown>;
            duplicate: {
                found: boolean;
                sample: unknown;
            };
        }[];
    }>;
    createStyle(body: {
        value: string;
        label?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    updateStyle(id: string, body: {
        value?: string;
        label?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteStyle(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPopupImage(): Promise<{
        url: string;
    }>;
    setPopupImage(body: {
        url: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getRemoveBgKeyStatus(token: string): Promise<{
        configured: boolean;
    }>;
    setRemoveBgKey(token: string, body: {
        apiKey: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    login(body: {
        username: string;
        password: string;
    }): Promise<import("@shared/api.interface").IAdminLoginResponse | {
        success: boolean;
        message: string;
    }>;
    verifyToken(token: string): Promise<{
        valid: boolean;
    }>;
    listAccounts(token: string): Promise<import("@shared/api.interface").IAdminAccount[]>;
    createAccount(token: string, body: IAdminCreateAccountRequest): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteAccount(token: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(token: string, body: IAdminChangePasswordRequest): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(token: string, body: {
        id: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
