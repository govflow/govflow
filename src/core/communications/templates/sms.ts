export function serviceRequestStaffUserNewSmsBody(context: Record<string, string>): string {
    return `Hello ${context.recipientName}. A new service request has been submitted.

    Go to ${context.appName} at ${context.appClientUrl} for further details.`;
}
