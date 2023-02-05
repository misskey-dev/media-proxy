export declare class StatusError extends Error {
    statusCode: number;
    statusMessage?: string;
    isClientError: boolean;
    constructor(message: string, statusCode: number, statusMessage?: string);
}
