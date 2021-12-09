export function serviceRequestStaffUserNewSubject(context: Record<string, string>) {
    return `[${context.appName}]: A New Service Request Has Been Submitted`;
}

export function serviceRequestStaffUserNewBody(context: Record<string, string>) {
    return `Hello ${context.recipientName},
    A new service request has been submitted. Go to ${context.appName} at ${context.appClientUrl} for further details.`;
}

export function serviceRequestStaffUserChangedAssigneeSubject(context: Record<string, string>) {
    return `[${context.appName}]: You Have Been Assigned a Service Request`;
}

export function serviceRequestStaffUserChangedAssigneeBody(context: Record<string, string>) {
    return `Hello ${context.recipientName},
    An open service request has been assigned to you. Go to ${context.appName} at ${context.appClientUrl} for further details.`;
}

export function serviceRequestStaffUserChangedStatusSubject(context: Record<string, string>) {
    return `[${context.appName}]: A Service Request Has Been Closed`;
}

export function serviceRequestStaffUserChangedStatusBody(context: Record<string, string>) {
    return `Hello ${context.recipientName},
    A service request has been changed to the ${context.serviceRequestStatus} status. Go to ${context.appName} at ${context.appClientUrl} for further details.`;
}

export function serviceRequestPublicUserClosedSubject(context: Record<string, string>) {
    return `[${context.appName}]: A Service Request Has Been Closed`;
}

export function serviceRequestPublicUserClosedBody(context: Record<string, string>) {
    return `Hello ${context.recipientName},
    A service request you submitted for ${context.jurisdictionName} has been closed with the status of ${context.serviceRequestStatus}.

    Thank you for notifying us of the issue. Should you have any further comments, reach out to us at ${context.appPublicEmail}.`;
}
