# Inbound SMS

Gov Flow supports multiple "inbound channels" for service requests. The basic inbound channel is submitting data via a POST request, as generally done from a web form (and, we call this channel `webform` in the data model ([ref.](https://github.com/govflow/govflow/blob/main/src/core/service-requests/models.ts#L20))).

Gov Flow also supports SMS as a channel for service requests, and in this implementation, an SMS can be sent to a special email address, and in turn, data from that email gets sent to Gov Flow, processed, and turned into a service request. There are several aspects of this integration to create structured data out of an SMS, and here we will go over all the details.

## Configure a Twilio Number for the GovFlow instance

At the level of the GovFlow instance (the server), we need one Twilio Number configured, and set at `TWILIO_FROM_PHONE`.

This number is used to emit SMS messages for Service Request submissions as a fallback, and irregardless of whether a given Jurisdiction has opted in to Inbound SMS ot Two-way SMS. Think if it like `webmaster@localhost` for SMS in GovFlow.

This number needs to be configured to send messages (default when you acquire a Twilio Number), and also it is highly recommended to provide an autoresponder from this number so if anyone attempts to respond back to an SMS, it is clear that it is a "no reply" number.

The core configuration for Twilio is to set `TWILIO_ACCOUNT_SID ` and `TWILIO_AUTH_TOKEN` with valid credentials from a Twilio account, in order to interact with Twilio.

### Set up an auto response with Studio Flow

[Studio Flow](https://console.twilio.com/us1/develop/studio?frameUrl=%2Fconsole%2Fstudio%2Fdashboard%3Fx-target-region%3Dus1) is Twilio's UI for creating logic around events in there system. We can use it to set an auto response on our GovFlow instance number.

- Create a new flow (e.g.: called "GovFlow Instance Auto Response")
- Choose the "Message Auto Responder" template
- When the editor opens up, it creates a widget with a default name and message body. Edit it as desired. (e.g: "This number does not accept replies. Please contact the Jursidiction where you submitted your request directly.")
- After you save your widget, click on the "trigger" component, and then, on the right had side edit panel, you will see a link "Using this flow with a Phoen Number". Click that link and follow the stesp to associate it with your GovFlow Instance Number
- Click on the Twilio Number that is your instance number, go down to messaging, and change "A Message Comes in" to Studio Flow and select to Flow you just created.
- Now, this number will be used for sending system messages, but if anyone tries to respond to such messages, they will receive a response back "This number does not accept replies. Please contact the Jursidiction where you submitted your request directly."

## Configure a Twilio Number for a Jurisidiction

Ok, so now with the basics of what the GovFlow server needs done, we can move onto Jurisdiction-level Twilio Number configuration for inbound SMS.

The core configuration for Twilio is to set `TWILIO_ACCOUNT_SID ` and `TWILIO_AUTH_TOKEN` with valid credentials from a Twilio account.

The Twilio setup steps are:

- Create a new number, and give it a friendly name (e.g.: "GovFlow Demo")
- As with the instance-level number, create an auto response (as this is one-way communication, we want it to be clear to submitters).
  - It is recommended to create a generic "jursidiction no reply" response. You can do that by duplicating the "GovFlow Instance Auto Response" we created above, call it "GovFlow Jurisdiction No Reply" and write your message.
  - We will attach all Jurisdiction Numbers to this by default, and only change that if (i) a Jurisdiction wants a custom message, or (ii), the **common case**, if two-way communication via SMS is enabled.

Next, we need to configure the use of this Number for the Jurisdiction in two places:

1. `Jurisdiction.sendFromPhone` - This needs to be set with the new number. When this is set, outgoing messages for the jurisdiction will be sent from this number rather than `TWILIO_FROM_PHONE`. This also includes the sending of messages when `Jursidcition.replyToServiceRequestEnabled` is enabled for two-way communication.
2. Creating a new `InboundMap` record to route incoming SMS from this number to the correct Jurisdiction (this is the equivalent of how InboundMap is used for [Inbound Email](./inbound-email.md)).
  - Note that we **don't** simply use `Jurisdiction.sendFromPhone` because it is possible to create any number of InboundMap records with different Twilio Numbers and/or with different rules. However, the happy path for small Jurisdictions will be to simply create a single InboundMap record associating the Twilio Number and the Jurisdiction, and have all inbound requests come via it.

```http
POST {{ host }}/communications/create-map?jurisdictionId={{ jurisdictionId }}
content-type: application/json

{
    "jurisdictionId": "{{ jurisdictionId }}",
    "channel": "sms",
    "id": "+1-111-11111"
}
```
