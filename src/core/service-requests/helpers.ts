import { StaffUserAttributes } from "../../types";

export function makeAuditMessage(user: StaffUserAttributes | undefined, fieldName: string, oldValue:string, newValue:string): string {
    let displayName = 'System';
    if (user) {
        displayName = user.displayName;
    }
    return `${displayName} changed this request ${fieldName} from ${oldValue} to ${newValue}`;
}

export function makePublicIdForRequest(): string {

    return ""
}
