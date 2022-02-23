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

# XCode Install
`xcode-select --install`

# Brew Install
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


# MongoDB Install
`brew tap mongodb/brew`
`brew install mongodb-community@5.0`

# NVM Install
`brew install nvm`
`mkdir ~/.nvm`
`nano ~/.zprofile`

Add these lines to the end
```
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh
```

`nvm install 14`
`nvm use 14`

# Docker Install
1. Create a Docker Hub Account (free tier) : https://hub.docker.com
2. Download Docker Desktop Application

`docker pull mongo`

`http://localhost:8081/db/local` to view database in browser

# Build
`cd api`
`npm install`
`npm run build`

Copy the `.env` file provided by developer or admin

# Install Geckodriver
https://github.com/mozilla/geckodriver/releases/

Download to a static folder like `~/geckodriver`

`nano ~/.zprofile`

Add this line to the end of the file

`export PATH=$PATH:~/geckodriver`

Reopen terminal window

The first time running there may be security warnings that need to be disabled.

# Running Mongo Docker Compose
`docker-compose -f stack.yml up`

# Create Mongo Indices and Views
Run these commands: `bash/mongodb/createAllIndices.sh` and `bash/mongodb/createAllViews.sh`
This will generate the associated indices/views definitions found in the root `mongodb/` folders. These are required for the results of the various scrapes and MuleSoft API calls to generate the correct outputs to determine what to scrape and/or push.
