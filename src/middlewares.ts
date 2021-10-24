import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import logger from './logging';

export function notFound(req: Request, res: Response): void {
    const status_code = 404
    const data = { message: 'Route Not Found.', status_code: status_code }
    const dataToLog = Object.assign({}, data, { path: req.path })
    logger.error(dataToLog);
    res.status(status_code).send({ data });
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export function internalServerError(err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction): void {
    /* eslint-enable @typescript-eslint/no-unused-vars */
    const status_code = 500
    const data = { message: 'Internal Server Error.', status_code: status_code }
    const dataToLog = Object.assign({}, data, { path: req.path, error: `${err}` })
    logger.error(dataToLog);
    res.status(status_code).send({ data });
}
