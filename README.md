# Project Purpose
The Sync-Robot seeks to eliminate double entry work from humans and provide a secure, reliable method of publish-subscribe reporting to third parties.
It utilizes the Mulesoft API's to find, create, and update records of Students, Teams, Enrollments, and Attendancem depending on the contract needs with the third-party.
# Why not API-API?
The reality of many school district systems is they provide only Web-API access, which follows the logical flow provided for human user manipulation. This system overcomes that barrier by behaving like a human user, much like a Web automation testing system does.
## Key Features
## Security
## Testing
## How to Contribute
## Additional Notes for Developers

### For first time installations
#### Make a local copy of `api/.env.example` to `api/.env` 
Update values as needed - these are intentionally not checked into the GitHub repo since they contain some values that should not be shared. The same file is referenced by both bash commands and the api server. 

### Basic Command Line

#### Listen for local file changes to auto build 
`cd bash/server/dev && ./startup_dev.sh`

#### Get Contact Data from Salesforce via Mulesoft
`node . get_contact_data`

#### Get Coach Data from Salesforce via Mulesoft
`node . get_coach_data`

#### Get Coach Session Data from Salesforce via Mulesoft
`node . get_coach_session_data`

#### List Participants Missing In District and Not in Salesforce
`node . list_participants_in_district_not_in_salesforce`
