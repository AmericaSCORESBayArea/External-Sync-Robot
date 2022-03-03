## List of Features for Front-End Application

### Existing API Modifications
- **[API-1]** Wrap Existing External Sync Robot API in an Express Application to expose functionality over HTTP
- **[API-2]** Create GET Endpoint to List Available Sync Robot Requests
  - scrape
    - district_1_participants
    - district_1_teams
    - district_2_participants
    - district_2_teams
  - get_contact_data
  - get_coach_data
  - get_coach_session_data
  - get_all_enrollments
  - get_all_attendances
  - post_new_participants_to_salesforce
  - post_missing_session_dates
  - post_missing_enrollments
  - post_all_attendances
- **[API-3]** Create GET Endpoint to List Status of Previous Requests
- **[API-4]** Create GET Endpoint to List Results of Previous Requests
- **[API-5]** Create GET Endpoint to List Values in Collections or Views to be Pushed/Synced
- **[API-6]** Create POST Endpoint to Initiate New Sync Robot Requests
- **[API-7]** Create WS Endpoint to Subscribe to Sync Robot Status based on Unique Request ID (start, progress, error, end...)

### New UI Application
- **[UI-1]** Create a React App
- **[UI-2]** Connect React App to list values from [API-2], [API-3], [API-4] and [API-5]
- **[UI-3]** Connect UI Button to initiate requests to [API-6]
- **[UI-4]** Connect UI to [API-7]
