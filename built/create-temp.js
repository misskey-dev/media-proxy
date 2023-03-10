import * as tmp from 'tmp';
export function createTemp() {
    return new Promise((res, rej) => {
        tmp.file((e, path, fd, cleanup) => {
            if (e)
                return rej(e);
            res([path, process.env.NODE_ENV === 'production' ? cleanup : () => { }]);
        });
    });
}
export function createTempDir() {
    return new Promise((res, rej) => {
        tmp.dir({
            unsafeCleanup: true,
        }, (e, path, cleanup) => {
            if (e)
                return rej(e);
            res([path, process.env.NODE_ENV === 'production' ? cleanup : () => { }]);
        });
    });
}
