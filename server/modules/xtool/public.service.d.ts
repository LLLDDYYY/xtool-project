import { type PostgresJsDatabase, FileService } from '@lark-apaas/fullstack-nestjs-core';
import type { IPublicMachine, IPublicMaterial, IPublicSample } from '@shared/api.interface';
export declare class PublicService {
    private readonly db;
    private readonly fileService;
    private readonly logger;
    constructor(db: PostgresJsDatabase, fileService: FileService);
    listMachines(): Promise<{
        items: IPublicMachine[];
    }>;
    listMaterials(): Promise<{
        items: IPublicMaterial[];
    }>;
    listMaterialsByMachine(machine: string, drawingType?: string): Promise<{
        items: IPublicMaterial[];
    }>;
    listSamples(filters: {
        machine?: string;
        material?: string;
        drawingType?: string;
    }): Promise<{
        items: IPublicSample[];
    }>;
    listDrawings(type?: string): Promise<{
        items: Array<{
            id: string;
            type: string;
            style: string;
            filename: string;
            filepath: string;
        }>;
    }>;
    getDrawingFile(id: string): Promise<{
        content: Blob;
        contentType: string;
    } | null>;
    getStorageFile(path: string): Promise<{
        content: Blob;
        contentType: string;
    } | null>;
}
