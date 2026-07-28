export interface IDrawing {
    id: string;
    type: string;
    style: string;
    filename: string;
    filepath: string;
    description: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}
export interface IDrawingListResponse {
    items: IDrawing[];
    total: number;
    page: number;
    pageSize: number;
}
export interface ISample {
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
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}
export interface ISampleListResponse {
    items: ISample[];
    total: number;
    page: number;
    pageSize: number;
}
export interface IDictItem {
    id: string;
    value: string;
    label: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}
export interface IMachine {
    id: string;
    value: string;
    label: string;
    supportedTypes: string[];
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}
export interface IActionResponse {
    success: boolean;
    message: string;
}
export interface IPublicMachine {
    id: string;
    value: string;
    label: string;
    supportedTypes: string[];
}
export interface IPublicMaterial {
    id: string;
    value: string;
    label: string;
}
export interface IPublicSample {
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
}
export interface IPublicMachineListResponse {
    items: IPublicMachine[];
}
export interface IPublicMaterialListResponse {
    items: IPublicMaterial[];
}
export interface IPublicSampleListResponse {
    items: IPublicSample[];
}
export interface IBitableRecord {
    id: string;
    record: Record<string, unknown>;
}
export interface IBitableImportRequest {
    records: IBitableRecord[];
}
export interface IBitableImportResponse {
    success: boolean;
    added: number;
    updated: number;
    errors: string[];
}
export interface IAIRecognizeResult {
    success: boolean;
    material: string;
    error?: string;
}
export interface IAnalyzeMaterialRequest {
    imageBase64: string;
}
export interface IAnalyzeMaterialResponse {
    success: boolean;
    material: string;
    color: string;
    rawText: string;
    error?: string;
}
export interface IAdminAccount {
    id: string;
    username: string;
    displayName: string;
    role: string;
    createdAt: string;
}
export interface IAdminLoginRequest {
    username: string;
    password: string;
}
export interface IAdminLoginResponse {
    success: boolean;
    token: string;
    username: string;
    displayName: string;
    role: string;
}
export interface IAdminCreateAccountRequest {
    username: string;
    password: string;
    displayName: string;
    role: string;
}
export interface IAdminChangePasswordRequest {
    username: string;
    oldPassword: string;
    newPassword: string;
}
