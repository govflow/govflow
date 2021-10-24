import type { NextFunction, Request, Response } from 'express';

/* eslint-disable */
// @ts-ignore
export function wrapAsync(handler) {
    return (req: Request, res: Response, next: NextFunction) => {
        handler(req, res, next).catch(next)
    }
}
/* eslint-enable */
