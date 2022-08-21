## CX Surveys

Often, a jurisidction will send a survey after the lifecycle of a service request has completed, known as an "Exit Survey" or a "Customer Experience (CX) Survey".

GovFlow provides basic integration for CX Surveys with the following implementation:

## Jurisdiction settings

- `cxSurveyEnabled` (default: `false`) set to `true` enables code paths for triggering the broadcast of CX Surveys, based on certain conditions (the following settings). Set at `false` (the default), this disables all CX Survey functionality.
- `cxSurveyTriggerStatus` (default: `done`) when a ServiceRequest for this jurisdiction has a status equal to `cxSurveyTriggerStatus`, then, broadcast a CX Survey to the request submitter.
- `cxSurveyUrl` (default: `null`) set to a URL which is the URl to the survey for this Jursidiction. The URL has GET params appended to it (currently, `cx_case_id` with the unique identifier for the ServiceRequest). if `cxSurveyUrl` is null or a blank string then broadcasts will be prevented.
- `cxSurveyBroadcastWindow` (default `24`) the approximate number of hours after a Service Request is set with `cxSurveyTriggerStatus` that a CX Survey broadcast will be emitted. Setting this to `0` means that the broadcast will happen "immediately"

