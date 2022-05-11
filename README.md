# Project Purpose
The Sync-Robot seeks to eliminate double entry work from humans and provide a secure, reliable method of publish-subscribe reporting to third parties.
It utilizes the Mulesoft API's to find, create, and update records of Students, Teams, Enrollments, and Attendancem depending on the contract needs with the third-party.

# Why not API-API?
The reality of many school district systems is they provide only Web-API access, which follows the logical flow provided for human user manipulation. This system overcomes that barrier by behaving like a human user, much like a Web automation testing system does.
## Key Features
## Security
## Testing
[User/System Acceptance Tests](https://github.com/AmericaSCORESBayArea/External-Sync-Robot/blob/main/UAT.md)
## How to Contribute
## Additional Notes for Developers

# Mac Install
## XCode
`xcode-select --install`

## Homebrew
`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

```
==> Next steps:
- Run these two commands in your terminal to add Homebrew to your PATH:
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/m/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
```

Reopen terminal

`brew update`

Turn off Brew Analytics `brew analytics off`

## MongoDB
`brew tap mongodb/brew`
`brew install mongodb-community@5.0`

Open new terminal window

TEST : `which mongo` should output some path (not empty line or not found)

## NVM Install (if NodeJS not already installed)
`brew install nvm`
`mkdir ~/.nvm`
`nano ~/.zprofile`

Add these lines to the end
```
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh
```
Open new terminal window

TEST : `which nvm` should output some path (not empty line or not found)

`nvm install 14` (or other version as needed)
`nvm use 14` (or other version as needed)

## Docker
1. Create a Docker Hub Account (free tier) with AmericaScores credentials : https://hub.docker.com
2. Download Docker Desktop Application

TEST : `which docker` should output some path (not empty line or not found)

## Geckodriver (aka Firefox)
This is used by the Selium commands as a the webdriver browser

https://github.com/mozilla/geckodriver/releases/

Download to a static folder like `~/geckodriver`

`nano ~/.zprofile` (or `.bashrc` depending on OS version)

Add this line to the end of the file

`export PATH=$PATH:~/geckodriver`

Open new terminal window

TEST : `which geckodriver` should output some path (not empty line or not found)

The first time running there may be security warnings that need to be disabled.

## Mingo
Download as a Desktop database viewer and data importer

https://mingo.io/download

# Windows Install
This is a work in progress and needs more details. The high level dependencies are listed out in the titles.

## Linux for Windows Subsystem

## MongoDB

## NodeJS

## Docker

## Geckodriver (aka Firefox)

## Mingo

# Running Mongo Docker Compose
`docker-compose -f stack.yml up`
This will start all Docker Services. 

`http://localhost:8081/db/local` to view database in browser via the Mongo Express package

 - **UI** to initiate scripts : http://localhost:3000
- **Selenium Grid** to view session overview : http://localhost:4444
- **Selenium Viewer** to observe progress : http://localhost:7900 (password is `secret`)

# Create or Update Mongo Indices and Views
Run these commands: `bash/mongodb/createAllIndices.sh` and `bash/mongodb/createAllViews.sh`
This will generate the associated indices/views definitions found in the root `mongodb/` folders. These are required for the results of the various scrapes and MuleSoft API calls to generate the correct outputs to determine what to scrape and/or push.

Sometimes views will need to be dropped or created. Running the `createAllViews` commands will take care of dropping any existing view with the same name and recreate with any new aggregation stage definitions.

# Build API Server Files
These files are the transpiled generated files used to trigger the various commands. 

`cd api`
`npm install`
`npm run build`

# Local Environment File `api/.env.example` to `api/.env`
Request the initial values from Program Manager or Developer on the team. Update values as needed - these are intentionally not checked into the GitHub repo since they contain some values that should not be shared. The same file is referenced by both bash commands.

# Commands

## Categories
There are three general categories of commands - `pull`, `scrape` and `push`. These commands are cumulative and iterative.

`pull` commands request data from the external SalesForce (SF) system via the MuleSoft API. The output of these commands are saved directly to the MongoDB and do not require a manual import. Often the pull commands need to be run a few times in a full sync to keep data states up-to-date.

`scrape` commands extract data from browser pages via the selenium webdriver. The ouput of these commands are saved to a local `*.json` file which is later imported to MongoDB (via Mingo or CLI) as one of the data source collections depending on the command.

`push` commands interact with browser pages and save data to the site. The output of the commands are also local files that are just useful for logging and timestamps but aren't imported into MongoDB. Because these commands change the "state" of the page they are interacting with, almost always after doing a push command, a `scrape` command is needed to maintain up-to-date information.

## Running Commands
Navigate to `api/build` - this is the root folder where all commands will run.

### Pull Commands (from Salesforce via Mulesoft)

Since the API is pretty fast, often it's more useful to simply clear out all the MuleSoft results/errors collections and then run all the below commands from scratch as opposed to sifting through thousands of documents to find the few dozen that need to be removed or modified.

To run all of these at once, concatenate the commands with `&&` like this : `node . get_contact_data && node . get_coach_data && node . get_coach_session_data && node . get_coach_session_data && node . get_all_attendances`

#### Get Contact Data
`node . get_contact_data`

#### Get Coach Data
`node . get_coach_data`

#### Get Coach Session Data
`node . get_coach_session_data`

#### Get Enrollments Data
`node . get_coach_session_data`

#### Get Attendance Data
`node . get_all_attendances`


### Scrape Commands

#### Scrape District 1 Participants 
- Clear out `district_participants`collection
- Run `node . scrape district_1_participants`
- Output should be imported to `district_participants` collection

#### Scrape District 1 Teams
- Clear out `district_teams`collection
- Run `node . scrape district_1_teams`
- Output should be imported to `district_teams` collection

#### Scrape District 2 Participants
- Clear out `district_participants`collection
- Run `node . scrape district_2_participants`
- Output should be imported to `district_participants` collection

#### Scrape District 2 Teams
- Clear out `district_teams`collection
- Run `node . scrape district_2_teams`
- Output should be imported to `district_teams` collection

### Push Commands
TBD - commands are done but need to document still



### Database Views

#### Scrape Commands
These PUSH data to the database based on the results from the scrape

- `scrape district_1_participants`
    - destinationMongoCollection: `district_participants`

- `scrape district_1_participant`
    - destinationMongoCollection:`district_participants`

- `scrape district_1_teams_no_attendance`
    - destinationMongoCollection:`district_teams`

- `scrape district_1_teams_with_attendance`
    - destinationMongoCollection:`district_teams`

- `scrape district_2_participants`
    - destinationMongoCollection:`district_participants`

- `scrape district_2_teams_no_attendance`
    - destinationMongoCollection:`district_teams`

- `scrape district_2_teams_with_attendance`
    - destinationMongoCollection:`district_teams`

#### Push Commands
These PULL data from the database depending on [1] scrape data and [2] API data

- `push district_1_teams`
    - sourceMongoCollection:`salesforce_team_seasons_with_missing_district_teams`
    - sourceMongoCollectionQuery:`{"district":"district_1"}`

- `push district_1_participants`
    - sourceMongoCollection:`salesforce_participants_not_in_district_view`
    - sourceMongoCollectionQuery:`{"$and":[{"district":"district_1"},{"StudentName":{"$not":{"$regex":" stub$", "$options":"i"}}},{"StudentName":{"$not":{"$regex":" stubb$", "$options":"i"}}}]}`

- `push district_1_schedule`
    - sourceMongoCollection:`salesforce_sessions_not_in_district_view`
    - sourceMongoCollectionQuery:`{"district":"district_1"}`

- `push district_1_enrollments`
    - sourceMongoCollection:`salesforce_enrollments_not_in_district_view`
    - sourceMongoCollectionQuery:`{"district":"district_1"}`

- `push district_1_attendances`
    - sourceMongoCollection:`salesforce_attendance_to_set_in_district_1`
    - sourceMongoCollectionQuery:`{}`

- `push district_2_participants`
    - sourceMongoCollection:`salesforce_participants_not_in_district_view`
    - sourceMongoCollectionQuery:`{"$and":[{"district":"district_2"},{"StudentName":{"$not":{"$regex":" stub$", "$options":"i"}}},{"StudentName":{"$not":{"$regex":" stubb$", "$options":"i"}}}]}`

- `push district_2_participants_is_youth_a_parent`
    - sourceMongoCollection:`district_participants_view`
    - sourceMongoCollectionQuery:`{"formValues.Is Youth Also A Parent":null}`

- `push district_2_enrollments`
    - sourceMongoCollection:`salesforce_enrollments_not_in_district_view`
    - sourceMongoCollectionQuery:`{"district":"district_2"}`

- `push district_2_schedule`
    - sourceMongoCollection:`salesforce_sessions_not_in_district_view`
    - sourceMongoCollectionQuery:`{"district":"district_2"}`

- `push district_2_attendances`
    - sourceMongoCollection:`salesforce_attendance_to_set_in_district_2`
    - sourceMongoCollectionQuery:`{}`
