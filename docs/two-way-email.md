# Two-way email [DRAFT]

Extending the functionality described in [Inbound Email](inbound-email.md), [Email Delivery Management](email-delivery-management.md), and [core email dispatch functionality](https://github.com/govflow/govflow/blob/main/src/email/index.ts#L9), Gov Flow supports full two way communication between Staff Users and Submitters around a Service Request.

This means that, as well as [commenting on a Service Request](https://github.com/govflow/govflow/blob/main/src/core/service-requests/routes.ts#L72) via the API (used by client apps that implement a dashboard, for example), an email can be sent, to a specifically configured [inbound email address](), and that email will be turned into a comment on the service request, with provenance information such as who made the comment and when.

## How it works

- Comments POSTed with `broadcastToSubmitter` as `true` are send by email to the original submitter of the request. Additionally, the submitter can reply to the email and it will write her comment into Gov Flow as a new Service Request Comment.
- Comments POSTed with `broadcastToAssignee` as `true` are send by email to the current assignee of the request. Additionally, the assignee can reply to the email and it will write her comment into Gov Flow as a new Service Request Comment.
- Comments POSTed with `broadcastToStaff` as `true` are send by email to the staff of GovFlow of the request. Depending on the jurisdiction configuration, these currently means one of two scenarios:
  - All Staff Users which are admins (the current behaviour of Gov Flow for notifications around a request)
  - If `jurisdiction.enforceAssignmentThroughDepartment` is `true`, and if the Service Request has `departmentId` set, then, only Staff Users which are leads of a department receive the broadcast to email.

## Example request

```http
POST {{ host }}/service-requests/comments/:serviceRequestId?jurisdictionId={{ jurisdictionId }}
content-type: application/json

{
    // other service request comment fields
    broadcastToSubmitter: true,
    broadcastToAssignee: true,
    broadcastToStaff: true
}
```

## UI implementation notes

User interfaces that allow Staff Users to send messages from within a Gov Flow dashboard should consider the following points:

- The backend always ensure that communication around a service request is only allowed for staff users and the original submitter of a request, and where the emails of those potential receipts are valid for sending emails [ref.](https://github.com/govflow/govflow/blob/main/src/core/communications/helpers.ts#L106), [ref.](https://github.com/govflow/govflow/blob/main/src/core/communications/repositories.ts#L90), [ref.](https://github.com/govflow/govflow/blob/main/src/core/service-requests/routes.ts#L72).
- Before allowing a Staff User to "send an email" via a UI, call the "email status" endpoint for any potential recipients `/communications/status/email/:email` (ref.)[https://github.com/govflow/govflow/blob/main/src/core/communications/routes.ts#L51] to verify that the email address can be delivered to (see [Email Delivery Management](email-deliver-management.md) for further details).
  - If the email address cannot be delivered, alert the user. A payload for sending an email to an undeliverable address will still be accepted by the Gov Flow server, but, it will ultimately throw an error outside of the request/response cycle and not be delivered [ref.](https://github.com/govflow/govflow/blob/main/src/core/communications/helpers.ts#L106).
