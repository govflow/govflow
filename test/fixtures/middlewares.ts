import { NextFunction, Request, Response } from "express"

export const consoleLogMiddleware = function (req: Request, res: Response, next: NextFunction) {
    console.log('LOGGED')
    next()
}

export function consoleLogParameterizedMiddleware(message: string) {
    return function (req: Request, res: Response, next: NextFunction) {
        console.log(message)
        next()
    }
}
