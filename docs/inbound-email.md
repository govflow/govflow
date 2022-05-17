# Inbound email

Gov Flow supports multiple "inbound channels" for service requests. The basic inbound channel is submitting data via a POST request, as generally done from a web form (and, we call this channel `webform` in the data model ([ref.](https://github.com/govflow/govflow/blob/main/src/core/service-requests/models.ts#L20))).

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

# Email forwarding

In many, perhaps even most scenarios, emails into Gov Flow will not be sent directly to an inbound email address, but rather will be forwarded to an inbound email address.

This presents some complications in identifying the original sender of a message, especially as the different ways of forwarding an email produce different messages and headers and therefore need to be parsed differently. Combine this with differing behavior across services in **how** they use email headers, and the issue of understanding who the submitter of a Service Request is*, our primary case for inbound email, turns out to be more complex than it originally appears.

Gov Flow supports these forwarding scenarios:

- **Manual forwarding via an email client**: A user of an email client receives email. If that email is actually a Service Request, she uses the "Forward" functionality of her email client to forward the email to an address that she has, which is an inbound email generated from Gov Flow.
  - *Note*: We need to parse the email body. Different email services provide different preambles for forwarded messages (a line of underscores on Outlook, a string like "Begin forwarded message" on Gmail), and then all generally provide a block of text for "From", "Subject", "Date", and "To" lines that describe the forwarded message. Different providers use different subject prefixes (e.g., "Fw:", "Fwd:", "FWD"). It seems all providers use the "References" and "In-Reply-To" headers in forwarding contexts (these are headers used primarily for reply contexts, like threading), but it is hard to make direct connections between the message identifiers in "References", for example, and the original submitter (e.g., we can't rely on a simple matching of domain names as all sorts of domains are used to send email from, which may or may not align with the domain name of the submitter's email address). In Gov Flow, <del>we try to use hints from these different sources of information to find the data we need, and there may be ways we can improve on this</del> we use [this package for parsing forward emails](https://github.com/crisp-oss/email-forward-parser).
  - *Example Scenario*: A small team manages an email inbox for a Public Works department: public-works@example.com. This email is used for a fea different things, so, instead of automatically forwarding all email, when they get a message that is a Service Request, they manually forward it to a Gov Flow inbound email.
- **Automated forwarding via email service forwarding or filtering**: A Jurisdiction has an email inbox that is used exclusively for accepting Service Requests from the public. Using the automated forwarding functionality of the email service the Jurisdiction uses (e.g., either a filtering rule or a forwarding rule in Gmail, a forwarding rule in Outlook 365), all emails that arrive at the Jurisdiction inbox (or, that additionally meet certain requirements, as in the case of a filtering rule in Gmail), are immediately forwarded to a pre-configured inbound email from Gov Flow.
  - *Note*: Automated forwarding sometimes includes special headers to indicate this with the email message. In the absense of a known header to indicate automated forwarding, like `X-Forwarded-For` on Google's email service(s), Gov Flow will fall back to attempting to extract required data from the email body, using the same code path as that of the manual forwarding scenario.

Gov Flow does not support these forwarding scenarios:

- **Manually using "Reply" and changing the recipient**: While this is not the "forwarding" feature in modern email clients, some users may do this to acheive the same result - sending a message to a different recipient. Using this method produces a different email body, which we do not currently parse in order to attempt extraction of an original sender of the email to function as the submitter in Gov Flow
  - *Result*: Emails "forwarded" with this method will have the actual sender as the recipient
- **Manual forwarding as an attachment**: Some email clients allow forwarding a message as an attachment. This actually makes it much easier to parse the correct information from the email payload as we get it as structured data in an attachment. However, we do not currently support email attachments in GovFlow, so this method is not supported. Our assumption is that this type of forwarding is not so common these days, but if we find we are wrong we will re-prioritize and add this feature.
  - *Result*: Emails "forwarded" with this method will have the actual message sent from the forwarder as the message, not the forwarded message at all.

**Note**: that we do not have deep expertise in the domain of email headers or email protocols in general, and we would welcome discussion and/or pull requests to increase the depth and breadth of parsing data from emails for the Gov Flow use cases.

# References

- https://wesmorgan.blogspot.com/2012/07/understanding-email-headers-part-i-what.html
- https://wesmorgan.blogspot.com/2012/07/understanding-email-headers-part-ii.html
- https://wesmorgan.blogspot.com/2012/07/understanding-email-headers-part-iii.html
- https://www.fastmail.help/hc/en-us/articles/1500000278382-Email-standards
