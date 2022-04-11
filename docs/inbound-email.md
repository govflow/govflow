# Inbound email

Gov Flow supports multiple "inbound channels" for service requests. The basic inbound channel is submitting data via a POST request, as general done from a web form (and, we call this channel `webform` in the data model ([ref.](https://github.com/govflow/govflow/blob/main/src/core/service-requests/models.ts#L20))).

Gov Flow also supports email as a channel for service requests, and in this implementation, an email can be sent to a special email address, and in turn, data from that email gets sent to Gov Flow, processed, and turned into a service request. There are several aspects of this integration to create structured data out of an email, and here we will go over all the details.

## SendGrid inbound parse

With some MX record setup and configuration in SendGrid, we can enable the sending of emails to a verified domain for inbound emails, something like `inbound.example.com`.

Once this is fully set up, any email address at the `inbound.example.com` domain can receive emails at SendGrid. Then, SendGrid parses these emails and POSTs them to an endpoint of our choosing - in Gov Flow that is `/communications/inbound/email` by default.

- [SendGrid documentation](https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook)
- [Gov Flow integration](https://github.com/govflow/govflow/blob/main/src/core/communications/repositories.ts#L66)
- [Gov Flow endpoint](https://github.com/govflow/govflow/blob/main/src/core/communications/routes.ts#L14)

# Routing inbound emails

Given that the local part of inbound email addresses is completely customizable (following the standard for a valid local identifier for an email address), we use this to provide a configurable routing mechanism. Supported entities for the routing mechanism for a given `Jurisdiction` are:

- **Department:** Provide a valid `departmentId` to associate the created service request with a given department
- **Service:** Provide a valid `serviceId` to associate the created service request with a given service
- **StaffUser:** Provide a valid `staffUserId` to associate the created service request with a given assignee
- **ServiceRequest:** Provide a valid `serviceRequestId` to associate the created service request with a given Service Request

`serviceRequestId` must be used exclusively, and is discussed further as part of the [two-way email](two-way-email.md) feature. The other attributes can be used in any combination.

Gov Flow **only** processes parsed emails if the local identifier of the email is know to the system, as configured in the routing table in the database (the model that represents this table is called `InboundMap` [ref.](https://github.com/govflow/govflow/blob/main/src/core/communications/models.ts#L100)).

## Example requests

```http
POST {{ host }}/communications/create-map?jurisdictionId={{ jurisdictionId }}
content-type: application/json

{
    "jurisdictionId": "{{ jurisdictionId }}",
    "departmentId": "{{ departmentId }}",
    "id": "my-inbound-email-to-department"
}
```

```http
POST {{ host }}/communications/create-map?jurisdictionId={{ jurisdictionId }}
content-type: application/json

{
    "jurisdictionId": "{{ jurisdictionId }}",
    "serviceId": "{{ serviceId }}",
    "id": "my-inbound-email-to-service"
}
```

```http
POST {{ host }}/communications/create-map?jurisdictionId={{ jurisdictionId }}
content-type: application/json

{
    "jurisdictionId": "{{ jurisdictionId }}",
    "staffUserId": "{{ staffUserId }}",
    "id": "my-inbound-email-to-assignee"
}
```

```http
POST {{ host }}/communications/create-map?jurisdictionId={{ jurisdictionId }}
content-type: application/json

{
    "jurisdictionId": "{{ jurisdictionId }}",
    "departmentId": "{{ departmentId }}",
    "serviceId": "{{ serviceId }}",
    "staffUserId": "{{ staffUserId }}",
    "id": "my-inbound-email-to-department-service-assignee"
}
```
