import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';
import { enforceJurisdictionAccess, resolveJurisdiction } from '../../middlewares';

export const accountRouter = Router();

accountRouter.use(wrapHandler(resolveJurisdiction()));
accountRouter.use(enforceJurisdictionAccess);

accountRouter.get('/staff', wrapHandler(async (req: Request, res: Response) => {
    const { staffUserRepository } = res.app.repositories;
    const [records, count] = await staffUserRepository.findAll(req.jurisdiction.id);
    res.status(200).send({ data: records, count: count });
}))

accountRouter.get('/staff/lookup', wrapHandler(async (req: Request, res: Response) => {
    const { staffUserRepository } = res.app.repositories;
    const [records, count] = await staffUserRepository.lookupTable(req.jurisdiction.id);
    res.status(200).send({ data: records, count: count });
}))

accountRouter.get('/staff/:id', wrapHandler(async (req: Request, res: Response) => {
    const { staffUserRepository } = res.app.repositories;
    const { id } = req.params;
    const record = await staffUserRepository.findOne(req.jurisdiction.id, id);
    res.status(200).send({ data: record });
}))

accountRouter.get('/staff/departments/', wrapHandler(async (req: Request, res: Response) => {
    const { staffUserService } = res.app.services;
    const record = await staffUserService.getDepartmentMap(req.jurisdiction.id);
    res.status(200).send({ data: record });
}))

accountRouter.post('/staff/departments/assign/:id', wrapHandler(async (req: Request, res: Response) => {
    const { staffUserService } = res.app.services;
    const { id } = req.params;
    const { departmentId, isLead } = req.body;
    const record = await staffUserService.assignDepartment(req.jurisdiction.id, id, departmentId, isLead);
    res.status(200).send({ data: record });
}))

accountRouter.post('/staff/departments/remove/:id', wrapHandler(async (req: Request, res: Response) => {
    const { staffUserService } = res.app.services;
    const { id } = req.params;
    const { departmentId } = req.body;
    const record = await staffUserService.removeDepartment(req.jurisdiction.id, id, departmentId);
    if (!record) {
        res.status(400).send({
            data: {
                isError: true,
                message: 'Invalid action. Ensure another Staff User is Department lead first.'
            }
        });
    } else {
        res.status(200).send({ data: record });
    }
}))
