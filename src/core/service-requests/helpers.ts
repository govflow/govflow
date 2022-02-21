import { Op } from "sequelize";
import { ServiceRequestInstance, StaffUserAttributes } from "../../types";

export function makeAuditMessage(user: StaffUserAttributes | undefined, fieldName: string, oldValue:string, newValue:string): string {
    let displayName = 'System';
    if (user) {
        displayName = user.displayName;
    }
    return `${displayName} changed this request ${fieldName} from ${oldValue} to ${newValue}`;
}

export async function makePublicIdForRequest(instance: ServiceRequestInstance): Promise<void> {
    const _year = instance.createdAt.getFullYear();
    const _month = instance.createdAt.getMonth();
    const windowLower = new Date(_year, _month, 0);
    const windowHigher =  (_month != 11) ? new Date(_year, _month + 1, 0) : new Date(_year + 1, 0, 0)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const lookup = await instance.constructor.findAll(
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
    const year = _year.toString(10).slice(-2);
    const month = String((_month + 1).toString(10)).padStart(2, "0");
    const idCounter = lastIncrement + 1;
    const publicId = `${year}::${month}::${idCounter}`
    instance.idCounter = idCounter;
    instance.publicId = publicId;
}
