## Workflow

A major part of managing service requests is the internal workflow to handle and ultimately resolve requests. GovFlow provides all the required APIs for this - assignment of requests to departments and persons, changing service request status (e.g.: todo, doing, done), and indicating if a request if currently open or closed.

At various points in the workflow, GovFlow is configured to send out notifications to the submitter, the staff, or both.

However, GovFlow can also be used "just" as a storage of these records, and the workflow management aspects may not be required.

In this case, the flag `workflowEnabled` is used to enable and disable features that are relevant for workflow management but not for other potential use cases. `workflowEnabled` is a boolean that is `true` by default.

Currently, when `workflowEnabled` is set to `false`, all workflow-related notifications (i.e.: those triggered during a service requests lifecycle) are disabled.
