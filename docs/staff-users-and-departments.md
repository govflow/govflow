# Staff Users and Departments

By default Staff Users do not "belong" to a Department, Service Requests can be associated with a Department but this has no impact on business logic, and Staff Users can be assigned to Service Requests. As far as broadcasts of actions from the system go, in this scenario, all Staff Users that return `true` for `isAdmin` receive communications via email for various state changes in the system related to service requests.

This can be configured to behave differently, and probably should be for any jursdiction that is not small enough to have a single, small team running GovFlow.

The available options and behaviours are:

- Set `Jurisdiction.enforceAssignmentThroughDepartment` to `true` (default is `false`): This setting will ensure that Staff Users can only be assigned to a Service request when a Service Request is associated with a Department that they too belong to. Looked at another way, with this flag enabled, on a Service Request, an assignee can only be chosen after a Department is chosen, and from the pool of that Department's Staff Users.
- Set `Jurisdiction.filterBroadcastsByDepartment` to `true` (default is `false`): When enabled, instead of sending broadcasts of actions to all Staff Users with `isAdmin: true`, the system will first try to send only to Department leads (of which there is always one per department). If there are no Staff Users assigned to the relevant department, then, the system will still fall back to Staff Users with `isAdmin: true`.
