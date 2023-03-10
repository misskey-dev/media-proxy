export class StatusError extends Error {
    constructor(message, statusCode, statusMessage) {
        super(message);
        this.name = 'StatusError';
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
        this.isClientError = typeof this.statusCode === 'number' && this.statusCode >= 400 && this.statusCode < 500;
    }
}
