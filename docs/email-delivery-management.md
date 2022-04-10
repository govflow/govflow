# Email delivery management

Gov Flow dispatches emails to SendGrid, and SendGrid queues and sends the emails, as well as collecting data on email delivery. In order to know the delivery status of a given email, for example, if it bounced, if the receiver unsubscribed, and so on, Gov Flow exposes an endpoint for integration with SendGrid web hooks for such delivery events from the email delivery lifecycle.

- [SendGrid documentation](https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook)
- [Gov Flow integration](https://github.com/govflow/govflow/blob/ac6705add2d1b5341f6124ca0e6e59c67736e7a7/src/core/communications/repositories.ts#L132)
- [Gov Flow endpoint](https://github.com/govflow/govflow/blob/main/src/core/communications/routes.ts#L23)

Optionally (and, recommended), the `SENDGRID_SIGNED_WEBHOOK_VERIFICATION_KEY` can be set to verify the web requests, to ensure **only** SendGrid is sending data to this endpoint. When this value is falsy, the verification is bypassed and the feature works without verification (we allow this as SendGrid also allow the functionality with our withut verification).

The delivery data is stored in a form that is optimized for querying in the Gov Flow use case [ref.]](https://github.com/govflow/govflow/blob/main/src/core/communications/repositories.ts#L132) and clients of the Gov Flow API can query the status of an email at any given time with a [dedicated status endpoint](https://github.com/govflow/govflow/blob/main/src/core/communications/routes.ts#L51).

**NOTE:** It is recommended that clients do query this endpoint before allowing users to perform actions that require email delivery, to ensure delivery is probable/likely, and to provide feedback to users when delivery is not possible in some circumstances (common case: a request submission was made with an email address this is fake or simply has a typo).

When an email is recorded as in a state that delivery is not allowed (`isAllowed` is `false`) ([ref.](https://github.com/govflow/govflow/blob/main/src/core/communications/models.ts#L156)), attempted delivery will ultimately raise an error ([ref.](https://github.com/govflow/govflow/blob/main/src/core/communications/helpers.ts#L107)). When `isAllowed` is `null`, mail can still be delivered, as `null` indicates that we do not yet know either delivery is possible (`true`) or delivery is not possible (`false`). All SendGrid email event types, and how they map to `true`, `false`, or `null`, are listed [here](https://github.com/govflow/govflow/blob/main/src/core/communications/models.ts#L5).
