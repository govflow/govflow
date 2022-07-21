# Two-way SMS and email

Extending the functionality described in [Inbound Email](inbound-email.md), [Inbound SMS](inbound-sms.md), [Email Delivery Management](email-delivery-management.md), [core email dispatch functionality](https://github.com/govflow/govflow/blob/main/src/email/index.ts#L9) and [core SMS dispatch functionality](https://github.com/govflow/govflow/blob/main/src/sms/index.ts), Gov Flow supports full two way communication between Staff Users and Submitters around a Service Request.

This means that, as well as [commenting on a Service Request](https://github.com/govflow/govflow/blob/main/src/core/service-requests/routes.ts#L72) via the API (used by client apps that implement a dashboard, for example), an email or an SMS can be sent, to a specifically configured email or phone, and that email or SMS will be turned into a comment on the service request, with provenance information such as who made the comment and when.

## How it works

There is a jurisdiction setting: `jursidiction.replyToServiceRequestEnabled`.

If this is `false` (the default), emails emitted from the system will not have the Service Request reply to inbound email, and they will just fall back to the (i) jursidiction reply to, or (ii) the system reply to. Likewise, SMS emitted from the system will not handle replies. The rest works when this is `true`.

- Comments POSTed with `broadcastToSubmitter` as `true` are send by email or SMS to the original submitter of the request. Additionally, the submitter can reply to the email and it will write her comment into Gov Flow as a new Service Request Comment.
- Comments POSTed with `broadcastToAssignee` as `true` are send by email to the current assignee of the request. Additionally, the assignee can reply to the email and it will write her comment into Gov Flow as a new Service Request Comment.
- Comments POSTed with `broadcastToStaff` as `true` are send by email to the staff of GovFlow of the request. Depending on the jurisdiction configuration, these currently means one of two scenarios:
  - All Staff Users which are admins (the current behaviour of Gov Flow for notifications around a request)
  - If `jurisdiction.enforceAssignmentThroughDepartment` is `true`, and if the Service Request has `departmentId` set, then, only Staff Users which are leads of a department receive the broadcast to email.

  `ServiceRequestComment.addedBy` is a field for a string, and generally used to store an ID of a staff user. With the new two-way communication features, this field can also take a constant `__SUBMITTER__` to signify when the comment was created by the submitter.

## When and how SMS or Email chosen as the broadcast channel?

- Submitters can be messaged via email or SMS. If they provided an email address, email will be used. If they provide both email and phone, email will be used. If they provide only phone, SMS will be used.
- Staff Users will always only have boradcasts via email (there is not way for such users to add a phone number at present).

## SMS and message disambiguation

With email, we issue unique email handles which allow us to route messages efficiently and correctly.

With SMS this is not so trivial. See [Inbound SMS](inbound-sms.md) for info on the various layers of SMS setup.

So, how do we route SMS messages to their correct destination? It basically works like this:

- GovFlow sees an incoming message
- The incoming message is automatically associated with a Jurisdiction due to a matching InboundMap, and optionally with deeper context (eg, a department) based on the InboundMap configuration
- If the submitter has no OPEN requests for this InboundMap context, then, create a new Service Request (we disambiguated the incoming message without user involvement)
- Otherwise, we disambiguate the new message by asking the user in response:
  - case/ user has one or many tickets: ask her to select from an incremented number list, where each entry is an existing service request (# and snippet of text), and the last entry is "This is a new request"
- To support the manual disambiguation flow, we store message state in the MessageDisambiguation table. Once a message has been routed correctly, the disambiguation record that backed the interaction with the user is closed.

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

- Before the introduction of the two-way feature, adding a comment to a Service Request did not trigger a notification. This behaviour remains the same - the default action (not passing any of the `broadcastTo*` attributes when creating a new comment) does not send a notification for a new comment, and we could consider that implies there is a comment type that is "internal".
- The backend always ensure that communication around a service request is only allowed for staff users and the original submitter of a request, and where the emails of those potential receipts are valid for sending emails [ref.](https://github.com/govflow/govflow/blob/main/src/core/communications/helpers.ts#L106), [ref.](https://github.com/govflow/govflow/blob/main/src/core/communications/repositories.ts#L90), [ref.](https://github.com/govflow/govflow/blob/main/src/core/service-requests/routes.ts#L72).
- Before allowing a Staff User to "send an email" via a UI, call the "email status" endpoint for any potential recipients `/communications/status/email/:email` (ref.)[https://github.com/govflow/govflow/blob/main/src/core/communications/routes.ts#L51] to verify that the email address can be delivered to (see [Email Delivery Management](email-deliver-management.md) for further details).
  - If the email address cannot be delivered, alert the user. A payload for sending an email to an undeliverable address will still be accepted by the Gov Flow server, but, it will ultimately throw an error outside of the request/response cycle and not be delivered [ref.](https://github.com/govflow/govflow/blob/main/src/core/communications/helpers.ts#L106).
