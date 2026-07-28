import type { Response } from 'express';
import { PublicService } from './public.service';
import { XtoolService } from './xtool.service';
import type { IAdminLoginRequest } from '@shared/api.interface';
export declare class PublicController {
    private readonly publicService;
    private readonly xtoolService;
    private readonly logger;
    constructor(publicService: PublicService, xtoolService: XtoolService);
    getMachines(): Promise<{
        items: import("@shared/api.interface").IPublicMachine[];
    }>;
    getMaterials(): Promise<{
        items: import("@shared/api.interface").IPublicMaterial[];
    }>;
    getMaterialsByMachine(machine: string, drawingType?: string): Promise<{
        items: import("@shared/api.interface").IPublicMaterial[];
    }>;
    getSamples(machine?: string, material?: string, drawingType?: string): Promise<{
        items: import("@shared/api.interface").IPublicSample[];
    }>;
    getDrawings(type?: string): Promise<{
        items: Array<{
            id: string;
            type: string;
            style: string;
            filename: string;
            filepath: string;
        }>;
    }>;
    getDrawingFile(id: string, res: Response): Promise<void>;
    getStorageFile(path: string, res: Response): Promise<void>;
    getPopupImage(): Promise<{
        url: string;
    }>;
    getRemoveBgKeyValue(): Promise<{
        apiKey: string;
    }>;
    adminLogin(body: IAdminLoginRequest): Promise<import("@shared/api.interface").IAdminLoginResponse | {
        success: boolean;
        message: string;
    }>;
    downloadProject(res: Response): Promise<void>;
}
