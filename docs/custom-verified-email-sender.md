# Custom verified email sender

By default, emails are send from the email set with `SENDGRID_FROM_EMAIL`. Based on the configuration with SendGrid, this needs to be a valid email sender according to how SendGrid defines one. Usually, this will be via domain verification.

Additionally, some jurisdictions prefer to have the email sender be an email address they control. Without getting into issues with DNS and full domain verification, one can configure email addresses (e.g., one per jurisdiction) to ve verified senders. The setup of this is as follows.

- [SendGrid documentation](https://docs.sendgrid.com/api-reference/sender-verification/create-verified-sender-request)
- [Gov Flow integration](https://github.com/govflow/govflow/blob/main/src/email/index.ts#L65)
- [Gov Flow endpoint](https://github.com/govflow/govflow/blob/main/src/core/communications/routes.ts#L75)

## Example request

```bash
POST {{ host }}/communications/verify-sender-request?jurisdictionId={{ jurisdictionId }}
content-type: application/json

{
    "jurisdictionId": "{{ jurisdictionId }}"
}
```

The `sendFromEmail` field of the `Jurisdiction` needs to be set for this request to be send successfully.

This action makes the request with SendGrid, it **does not** complete the verification process. Ther verification process is only complete if the user completed the process via the email that was send to the `sendFromEmail` address by SendGrid.
