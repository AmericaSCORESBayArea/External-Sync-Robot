#Acceptance Test#
Updated: 9-21-21
##Primary Criteria##
- [ ] The Sync Robot compares the status of an external stakeholder database to the Scores internal system of record (salesforce)
- [ ] The scope of comparisions include students, teams, enrollments, sessions and participation
- [ ] The Sync Robot can determine which version of any record to treat as authoritative, outdated, or in-question as a step to reconciling both systems
- [ ] The Sync Robot can take human input at a record level to resolve in-question records
- [ ] The Sync Robot updates (creates/writes) records on either system to achieve "sync"
- [ ] The process can be performed, reliably, on a monthly basis
- [ ] A record/log is generated for review during sync

##Secondary Criteria##
- [ ] Tests can be completed on a limited set of records before a full-scope sync
- [ ] Supported external systems are Oakland Unified and San Francisco Unified school districts (more may be added later)
