import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { verifyRecaptchaResponse } from './captcha';
import logger from './logging';
export function notFound(req: Request, res: Response): void {
    const status_code = 404
    const data = { message: 'Route Not Found.', status_code: status_code }
    const dataToLog = Object.assign({}, data, { path: req.path })
    logger.error(dataToLog);
    res.status(status_code).send({ data });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function internalServerError(err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction): void {
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

        const jurisdiction = await Jurisdiction.findOne(jurisdictionId as string);

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
            req.jurisdiction = jurisdiction;
            next();
        }
    }
}

export function enforceJurisdictionAccess(req: Request, res: Response, next: NextFunction): void {
    const STATUS_CODE_UNAUTHORIZED = 401;
    const STATUS_CODE_FORBIDDEN = 403;

    if (!process.env.ENFORCE_AUTHORIZATION) {
        // TODO remove once we support auth on Govflow and adapt tests to make requests as authenticated users
        next();
        return;
    }

    if (!req.user) {
        res.status(STATUS_CODE_UNAUTHORIZED).send();
        return;
    }

    if (req.user.permissions?.includes('access-all-jurisdictions')) {
        next();
        return;
    }

    if (req.user.jurisdiction === req.jurisdiction.id) {
        next();
        return;
    }

    res.status(STATUS_CODE_FORBIDDEN).send();
}

export async function maybeCaptcha(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { captchaEnabled, reCaptchaSecretKey } = req.app.config;
    const captchaResponseToken = req.body['captcha_response_token'];
    delete req.body['captcha_response_token'];

    if (captchaEnabled == true) {
        const captchaResponse = await verifyRecaptchaResponse(reCaptchaSecretKey, captchaResponseToken);
        if (captchaResponse.success == true) {
            next()
        } else {
            const status_code = 400
            const data = {
                message: 'Bad request: The reCaptcha token is invalid',
                status_code: status_code,
                error_codes: captchaResponse['error-codes']
            }
            res.status(status_code).send(data)
        }
    } else {
        next();
    }

}
