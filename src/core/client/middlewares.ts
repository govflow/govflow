import type { NextFunction, Request, Response } from 'express';

export async function verifyClientMiddleware(req: Request, res: Response, next: NextFunction): Promise<NextFunction | Error | void> {
    next();
}
