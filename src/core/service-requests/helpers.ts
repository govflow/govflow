import { Op } from "sequelize";
import { ServiceRequestInstance, ServiceRequestModel, StaffUserAttributes } from "../../types";

export function makeAuditMessage(user: StaffUserAttributes | undefined, fieldName: string, oldValue:string, newValue:string): string {
    let displayName = 'System';
    if (user) {
        displayName = user.displayName;
    }
    return `${displayName} changed this request ${fieldName} from ${oldValue} to ${newValue}`;
}

export function makePublicIdString(year: number, month: number, counter: number): string {
    const yearStr = year.toString(10).slice(-2);
    const monthStr = String((month + 1).toString(10)).padStart(2, "0");
    return `${yearStr}${monthStr}${counter}`;
}
export async function makePublicIdForRequest(instance: ServiceRequestInstance): Promise<void> {
    if (instance.publicId) {
        // do nothing if the instance already has a publicId
    } else {
        const year = instance.createdAt.getFullYear();
        const month = instance.createdAt.getMonth();
        const windowLower = new Date(year, month, 0);
        const windowHigher =  (month != 11) ? new Date(year, month + 1, 0) : new Date(year + 1, 0, 0);
        const ServiceRequest = instance.constructor as ServiceRequestModel;
        const lookup = await ServiceRequest.findAll(
            {
                where: {
                    jurisdictionId: instance.jurisdictionId,
                    createdAt: { [Op.gte]: windowLower, [Op.lt]: windowHigher }
                }
            }
        ) as ServiceRequestInstance[];
        let lastIncrement = 0;
        if (lookup.length > 0) {
            const lastRecord = lookup.reduce(
                (last: ServiceRequestInstance, curr: ServiceRequestInstance) =>
                (last.idCounter > curr.idCounter) ? last : curr

            );
            lastIncrement = lastRecord.idCounter;
        }
        const idCounter = lastIncrement + 1;
        const publicId = makePublicIdString(year, month, idCounter);
        instance.idCounter = idCounter;
        instance.publicId = publicId;
    }
}
