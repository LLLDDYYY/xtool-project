export interface LaserMaterialRecognitionOneInput {
    /** 待识别的激光加工材质图片 */
    material_image: string[];
}
/**
 * capabilityClient.load('laser_material_recognition_1').call<LaserMaterialRecognitionOneOutput>('imageUnderstanding', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, reasoningContent, response } = result;
 */
export interface LaserMaterialRecognitionOneOutput {
    /** [object Object] */
    content: string;
    /** [object Object] */
    reasoningContent?: string;
    /** [object Object] */
    response?: string;
}
export interface FeishuBitableSampleParamsImportOneAggregatequeryInput {
    /** [object Object] */
    dimensions?: string[];
    /** [object Object] */
    measures?: {
        fieldName: string;
        aggregation: string;
        alias: string;
    }[];
    /** [object Object] */
    pageToken?: string;
    /** [object Object] */
    pageSize?: number;
    /** [object Object] */
    sort?: {
        fieldName: string;
        desc: boolean;
    }[];
    /** [object Object] */
    filter?: {
        conjunction: string;
        conditions: {
            fieldName: string;
            operator: string;
            value: string[];
        }[];
    };
    /** [object Object] */
    expandArrayDimension?: boolean;
}
/**
 * capabilityClient.load('feishu_bitable_sample_params_import_1').call<FeishuBitableSampleParamsImportOneAggregatequeryOutput>('aggregateQuery', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { result, hasMore, pageToken } = result;
 */
export interface FeishuBitableSampleParamsImportOneAggregatequeryOutput {
    /** [object Object] */
    result: {}[];
    /** [object Object] */
    hasMore: boolean;
    /** [object Object] */
    pageToken?: string;
}
export interface FeishuBitableSampleParamsImportOneBatchaddrecordsInput {
    /** [object Object] */
    records: {
        record: {};
    }[];
}
/**
 * capabilityClient.load('feishu_bitable_sample_params_import_1').call<FeishuBitableSampleParamsImportOneBatchaddrecordsOutput>('batchAddRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 */
export interface FeishuBitableSampleParamsImportOneBatchaddrecordsOutput {
    /** [object Object] */
    records: {
        id: string;
    }[];
}
export interface FeishuBitableSampleParamsImportOneBatchupdaterecordsInput {
    /** [object Object] */
    records: {
        id: string;
        record: {};
    }[];
}
/**
 * capabilityClient.load('feishu_bitable_sample_params_import_1').call<FeishuBitableSampleParamsImportOneBatchupdaterecordsOutput>('batchUpdateRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 */
export interface FeishuBitableSampleParamsImportOneBatchupdaterecordsOutput {
    /** [object Object] */
    records: {
        id: string;
    }[];
}
export interface FeishuBitableSampleParamsImportOneDeleterecordsInput {
    /** [object Object] */
    recordIDs: string[];
}
/**
 * capabilityClient.load('feishu_bitable_sample_params_import_1').call<FeishuBitableSampleParamsImportOneDeleterecordsOutput>('deleteRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { success } = result;
 */
export interface FeishuBitableSampleParamsImportOneDeleterecordsOutput {
    /** [object Object] */
    success: boolean;
}
export interface FeishuBitableSampleParamsImportOneGetrecordInput {
    /** [object Object] */
    recordID: string;
}
/**
 * capabilityClient.load('feishu_bitable_sample_params_import_1').call<FeishuBitableSampleParamsImportOneGetrecordOutput>('getRecord', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { id, record } = result;
 */
export interface FeishuBitableSampleParamsImportOneGetrecordOutput {
    /** [object Object] */
    id: string;
    /** [object Object] */
    record?: {};
}
export interface FeishuBitableSampleParamsImportOneSearchrecordsInput {
    /** [object Object] */
    filter?: {
        conditions: {
            fieldName: string;
            operator: string;
            value: string[];
        }[];
        conjunction: string;
    };
    /** [object Object] */
    pageToken?: string;
    /** [object Object] */
    pageSize?: number;
    /** [object Object] */
    fieldNames?: string[];
    /** [object Object] */
    sort?: {
        fieldName: string;
        desc: boolean;
    }[];
}
/**
 * capabilityClient.load('feishu_bitable_sample_params_import_1').call<FeishuBitableSampleParamsImportOneSearchrecordsOutput>('searchRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { hasMore, pageToken, total, ... } = result;
 */
export interface FeishuBitableSampleParamsImportOneSearchrecordsOutput {
    /** [object Object] */
    hasMore: boolean;
    /** [object Object] */
    pageToken?: string;
    /** [object Object] */
    total?: number;
    /** [object Object] */
    records: {
        id: string;
        record: {};
    }[];
}
