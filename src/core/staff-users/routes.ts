import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';
import { enforceJurisdictionAccess, resolveJurisdiction } from '../../middlewares';
import { GovFlowEmitter } from '../event-listeners';

export const accountRouter = Router();

accountRouter.use(wrapHandler(resolveJurisdiction()));
accountRouter.use(enforceJurisdictionAccess);

accountRouter.get('/staff', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    const [records, count] = await StaffUser.findAll(req.jurisdiction.id);
    res.status(200).send({ data: records, count: count });
}))

accountRouter.get('/staff/lookup', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    const [records, count] = await StaffUser.lookupTable(req.jurisdiction.id);
    res.status(200).send({ data: records, count: count });
}))

accountRouter.get('/staff/:id', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    const { id } = req.params;
    const record = await StaffUser.findOne(req.jurisdiction.id, id);
    res.status(200).send({ data: record });
}))

accountRouter.get('/staff/departments/', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.services;
    const record = await StaffUser.getDepartmentMap(req.jurisdiction.id);
    res.status(200).send({ data: record });
}))

accountRouter.post('/staff/departments/assign/:id', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.services;
    const { id } = req.params;
    const { departmentId, isLead } = req.body;
    const record = await StaffUser.assignDepartment(req.jurisdiction.id, id, departmentId, isLead);
    res.status(200).send({ data: record });
}))

accountRouter.post('/staff/departments/remove/:id', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser, OutboundMessage } = res.app.services;
    const { id } = req.params;
    const { departmentId } = req.body;
    const record = await StaffUser.removeDepartment(req.jurisdiction.id, id, departmentId);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (record.isError) {
        res.status(400).send({ data: record });
    } else {
        GovFlowEmitter.emit('serviceRequestChangeAssignedTo', req.jurisdiction, record, OutboundMessage);
        res.status(200).send({ data: record });
    }
    res.status(200).send({ data: record });
}))
