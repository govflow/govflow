import { Request, Response, Router } from 'express';
import { serviceRequestFiltersToSequelize, wrapHandler } from '../../helpers';
import { enforceJurisdictionAccess, resolveJurisdiction } from '../../middlewares';
import { AuditedStateChangeExtraData, ServiceRequestAttributes } from '../../types';
import { GovFlowEmitter } from '../event-listeners';
import { SERVICE_REQUEST_CLOSED_STATES } from '../service-requests';

export const serviceRequestRouter = Router();

serviceRequestRouter.use(wrapHandler(resolveJurisdiction()));
serviceRequestRouter.use(enforceJurisdictionAccess);

serviceRequestRouter.get('/status-list', wrapHandler(async (req: Request, res: Response) => {
    const { serviceRequestRepository } = res.app.repositories;
    const record = await serviceRequestRepository.findStatusList(req.jurisdiction.id);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.get('/stats', async (req: Request, res: Response) => {
    const { serviceRequestRepository } = res.app.repositories;
    const { dateFrom, dateTo, status, assignedTo } = req.query;
    const queryParams = serviceRequestFiltersToSequelize(
        { dateFrom, dateTo, status, assignedTo } as Record<string, string>
    );
    const record = await serviceRequestRepository.getStats(req.jurisdiction.id as string, queryParams);
    res.status(200).send({ data: { countByStats: record } });
});

serviceRequestRouter.post('/status', wrapHandler(async (req: Request, res: Response) => {
    const { outboundMessageService, serviceRequestService } = res.app.services;
    const { status, serviceRequestId } = req.body;
    const extraData = { user: req.user };
    let eventName = 'serviceRequestChangeStatus';
    const record = await serviceRequestService.createAuditedStateChange(
        req.jurisdiction.id, serviceRequestId, 'status', status, extraData
    );
    if (SERVICE_REQUEST_CLOSED_STATES.includes(status as string)) {
        eventName = 'serviceRequestClosed'
    }
    GovFlowEmitter.emit(eventName, req.jurisdiction, record, outboundMessageService);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/assign', wrapHandler(async (req: Request, res: Response) => {
    const { outboundMessageService, serviceRequestService } = res.app.services;
    const { assignedTo, departmentId, serviceRequestId } = req.body;
    const extraData = {
        user: req.user,
        departmentId
    }
    const record = await serviceRequestService.createAuditedStateChange(
        req.jurisdiction.id,
        serviceRequestId,
        'assignedTo',
        assignedTo,
        extraData as AuditedStateChangeExtraData,
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (record.isError) {
        res.status(400).send({ data: record });
    } else {
        GovFlowEmitter.emit('serviceRequestChangeAssignedTo', req.jurisdiction, record, outboundMessageService);
        res.status(200).send({ data: record });
    }
}))

serviceRequestRouter.post('/department', wrapHandler(async (req: Request, res: Response) => {
    const { serviceRequestService } = res.app.services;
    const { departmentId, serviceRequestId } = req.body;
    const extraData = { user: req.user };
    const record = await serviceRequestService.createAuditedStateChange(
        req.jurisdiction.id, serviceRequestId, 'departmentId', departmentId, extraData
    );
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/service', wrapHandler(async (req: Request, res: Response) => {
    const { serviceRequestService } = res.app.services;
    const { serviceId, serviceRequestId } = req.body;
    const extraData = { user: req.user };
    const record = await serviceRequestService.createAuditedStateChange(
        req.jurisdiction.id, serviceRequestId, 'serviceId', serviceId, extraData
    );
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/comments/:serviceRequestId', wrapHandler(async (req: Request, res: Response) => {
    const { serviceRequestRepository } = res.app.repositories;
    const { outboundMessageService } = res.app.services;
    const { serviceRequestId } = req.params;
    const data = Object.assign({}, req.body, { addedBy: req.user?.id });
    const record = await serviceRequestRepository.createComment(req.jurisdiction.id, serviceRequestId, data);
    if (record.isBroadcast) {
        GovFlowEmitter.emit('serviceRequestCommentBroadcast', req.jurisdiction, record, outboundMessageService);
    }
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/comments/:serviceRequestId/:id', wrapHandler(async (req: Request, res: Response) => {
    const { serviceRequestRepository } = res.app.repositories;
    const { serviceRequestId, id } = req.params;
    const record = await serviceRequestRepository.updateComment(req.jurisdiction.id, serviceRequestId, id, req.body);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.get('/', wrapHandler(async (req: Request, res: Response) => {
    const { serviceRequestRepository } = res.app.repositories;
    const { dateFrom, dateTo, status, assignedTo, department, service } = req.query;
    const queryParams = serviceRequestFiltersToSequelize(
        { dateFrom, dateTo, status, assignedTo, department, service } as Record<string, string>,
    );
    const [records, count] = await serviceRequestRepository.findAll(req.jurisdiction.id, queryParams);
    res.status(200).send({ data: records, count: count });
}))


serviceRequestRouter.get('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { serviceRequestRepository } = res.app.repositories;
    const { id } = req.params;
    const record = await serviceRequestRepository.findOne(req.jurisdiction.id, id);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/', wrapHandler(async (req: Request, res: Response) => {
    const { serviceRequestRepository } = res.app.repositories;
    const { outboundMessageService } = res.app.services;
    const record = await serviceRequestRepository.create(req.body as ServiceRequestAttributes);
    GovFlowEmitter.emit('serviceRequestCreate', req.jurisdiction, record, outboundMessageService);
    res.status(200).send({ data: record });
}))
