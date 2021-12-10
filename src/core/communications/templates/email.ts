export function serviceRequestStaffUserNewEmailSubject(context: Record<string, string>): string {
    return `[${context.appName}]: A New Service Request Has Been Submitted`;
}

export function serviceRequestStaffUserNewEmailBody(context: Record<string, string>): string {
    return `Hello ${context.recipientName},
    A new service request has been submitted. Go to ${context.appName} at ${context.appClientUrl} for further details.`;
}

export function serviceRequestStaffUserChangedAssigneeEmailSubject(context: Record<string, string>): string {
    return `[${context.appName}]: You Have Been Assigned a Service Request`;
}

export function serviceRequestStaffUserChangedAssigneeEmailBody(context: Record<string, string>): string {
    return `Hello ${context.recipientName},
    An open service request has been assigned to you. Go to ${context.appName}
    at ${context.appClientUrl} for further details.`;
}

export function serviceRequestStaffUserChangedStatusEmailSubject(context: Record<string, string>): string {
    return `[${context.appName}]: A Service Request Has Been Closed`;
}

export function serviceRequestStaffUserChangedStatusEmailBody(context: Record<string, string>): string {
    return `Hello ${context.recipientName},
    A service request has been changed to the ${context.serviceRequestStatus} status.

    Go to ${context.appName} at ${context.appClientUrl} for further details.`;
}

export function serviceRequestPublicUserClosedEmailSubject(context: Record<string, string>): string {
    return `[${context.appName}]: Your service request has been closed`;
}

export function serviceRequestPublicUserClosedEmailBody(context: Record<string, string>): string {
    return `Hello ${context.recipientName},
    A service request you submitted for ${context.jurisdictionName} has been closed

    with the status of ${context.serviceRequestStatus}.

    Thank you for notifying us of the issue.

    Should you have any further comments, reach out to us at ${context.appPublicEmail}.`;
}

export function serviceRequestPublicUserNewEmailSubject(context: Record<string, string>): string {
    return `[${context.appName}]: Thank you for submitting your service request`;
}

export function serviceRequestPublicUserNewEmailBody(context: Record<string, string>): string {
    return `Hello ${context.recipientName},
    Thank you for submitting your service request for ${context.jurisdictionName}. We have received your request and will look into it as soon as possible.`;
}

export function serviceRequestStaffUserClosedEmailSubject(context: Record<string, string>): string {
    return `[${context.appName}]: A Service Request Has Been Closed`;
}

export function serviceRequestStaffUserClosedEmailBody(context: Record<string, string>): string {
    return `Hello ${context.recipientName},
    A service request has been has been closed with the status of ${context.serviceRequestStatus}.

    Go to ${context.appName} at ${context.appClientUrl} for further details.`;
}
