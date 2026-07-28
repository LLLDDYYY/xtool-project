import { Logger } from '@nestjs/common';
import type { Response } from 'express';
export declare class LaserPreviewController {
    private readonly logger;
    static resolveAssetsDir(logger?: Logger): string;
    private resolveAssetsDir;
    servePage(res: Response): void;
    serveAsset(filename: string, res: Response): void;
}
