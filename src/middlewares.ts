import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import _ from 'lodash';
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

export function resolveJurisdiction(paramKey = 'jurisdictionId', excludedRoutes: string[] = []) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { Jurisdiction } = res.app.repositories;
        const jurisdictionId = req.query[paramKey];
        const errorStatus = 403;
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        /* eslint-enable @typescript-eslint/ban-ts-comment */
        const isExcluded = excludedRoutes.includes(req.path)
        if (isExcluded) {
            next();
        }

        if (_.isNil(jurisdictionId)) {
            const errorMessage = 'A jurisdiction query parameter is required.';
            const error = new Error(errorMessage);
            const errorData = {
                message: errorMessage,
                status_code: errorStatus,
                path: req.path,
                error: `${error}`
            }
            logger.error(errorData);
            res.status(errorStatus).send({ errorData });
        }

        const jurisdiction = await Jurisdiction.findOne(jurisdictionId);

        if (_.isNil(jurisdiction)) {
            const errorMessage = 'A jurisdiction query parameter was present but is invalid.';
            const error = new Error(errorMessage);
            const errorData = {
                message: errorMessage,
                status_code: errorStatus,
                path: req.path,
                error: `${error}`
            }
            logger.error(errorData);
            res.status(errorStatus).send({ errorData });
        } else {
            req.jurisdiction = jurisdiction
            next();
        }
    }
}
