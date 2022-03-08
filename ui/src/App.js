import React, {useReducer, useState, useEffect} from "react";
import { nanoid } from "nanoid";
import axios from "axios";
const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const commandsList = [
  "scrape district_1_teams",
  "scrape district_1_participants",
  "scrape district_2_teams",
  "scrape district_2_participants",
  "pull get_contact_data",
  "pull get_coach_data",
  "pull get_coach_session_data",
  "pull get_all_enrollments",
  "pull get_all_attendances",
  "push get_all_attendances",
  "push district_1_teams",
  "push district_1_participants",
  "push district_1_schedule",
  "push district_1_enrollments",
  "push district_1_attendances",
  "push district_2_participants",
  "push district_2_participants_is_youth_a_parent",
  "push district_2_enrollments",
  "push district_2_schedule",
  "push district_2_attendances"
];

const reqHeaders = {
  headers: {
    'Content-Type': 'application/json'
  }
};

const App = () => {
  const [commandsRun, setCommandsRun] = useReducer((state, newState) => [...state, newState], [])
  const [commandResult, setCommandResult] = useReducer((state, newState) => [...state, newState], [])
  const [disabled, setDisabled] = useState(false);
  const [commandFilter, setCommandFilter] = useState("");
  const [errorMessage, setErrorMessage] = useState("")
  const [gridInfo, setGridInfo] = useState(null)

  useEffect(() => {
    axios.get(`http://localhost:4000/grid-status`)
      .then((res, err) => {
        if (err) console.error(err)
        setGridInfo(res)
      }).catch((e) => {
      console.error(e);
      setErrorMessage("Selenium Grid Not Ready - Please wait a few seconds then reload the page")
    })
  }, [])

  const commandRunClickCallback = (command) => {
    const newId = nanoid()
    setDisabled(true);
    setCommandsRun({
      command,
      date: new Date(),
      id: newId
    });

    const commandSplit = command.trim().split(" ")
    if (commandSplit.length === 2) {
      const submitObj = {
        primary_command: commandSplit[0],
        secondary_command: commandSplit[1]
      };
      axios.post(`http://localhost:4000/run`, JSON.stringify(submitObj), reqHeaders).then((response) => {
        setCommandResult({
          command,
          date: new Date(),
          id: newId,
          message: JSON.stringify(response)
        })
      }, (error) => {
        console.log(error);
        setCommandResult({
          command,
          date: new Date(),
          id: newId,
          error: `Error Type [2] Encountered : ${error}`
        })
      }).catch((e) => {
        console.log(e);
        setCommandResult({
          command,
          date: new Date(),
          id: newId,
          error: `Error Type [2] Encountered : ${e}`
        })
      });
    } else {
      console.error(`INCORRECT COMMAND FOUND  -expecting a split of '2' on spaces but got ${commandSplit.length}`)
      console.error(commandSplit)
      setCommandResult({
        command,
        date: new Date(),
        id: newId,
        error: "Error : command is configured incorrectly"
      })
    }
    setTimeout(() => {
      setDisabled(false);
    }, 5000)
  }

  const filteredCommands = commandFilter.trim().length > 0 ? commandsList.filter((command) => command.indexOf(commandFilter.trim()) > -1) : commandsList

  return (
    <div className="App">
      <img
        src={"/America-SCORES-Logo.jpg"}
        style={{
          width: "100%",
          maxWidth: "300px"
        }}
        alt={`America Scores Logo`}/>
      {
        errorMessage.length > 0 ? <h3
          style={{
            backgroundColor: "lightsalmon",
            textAlign: "center",
            "padding": "20px"
          }}>{errorMessage}</h3> : null
      }
      {
        gridInfo ?
          <div>
            <div
              style={{"padding": "20px"}}
            >
              <input
                placeholder={"filter commands"}
                style={{"float": "left"}}
                value={commandFilter}
                onChange={(e) => setCommandFilter(e.target.value)}
              />
              <div
                style={{"float": "right"}}
              >
                <div
                  key={"grid_link"}
                >
                  <a
                    href={`http://localhost:4444/ui/index.html#/sessions`}
                    target={"_blank"}
                  >Selenium Grid Session</a>
                </div>
                <div
                  key={" viewer_link"}
                >
                  <a
                    href={`http://localhost:8081/db/america_scores`}
                    target={"_blank"}
                  >SCORES MongoDB</a>
                </div>
              </div>
            </div>
            <ul>
              {
                filteredCommands.map((command, index) => {
                  const matchingCommandsRun = commandsRun.filter((history) => history.command === command)
                  return (
                    <li
                      key={index}
                      style={{listStyle: "none"}}
                    >
                      <div
                        style={{padding: "20px", margin: "20px", borderRadius: "20px", backgroundColor: "lightblue"}}
                      >
                        <h4>{command}</h4>
                        <button
                          disabled={disabled}
                          onClick={() => commandRunClickCallback(command)}
                        >Run
                        </button>
                        {
                          matchingCommandsRun.length > 0 &&
                          <ul>
                            {
                              matchingCommandsRun.map((commandHistory, index_2) => {
                                const relativeDate = dayjs().to(dayjs(commandHistory.date)) // "31 years ago"
                                const results = commandResult.filter((result) => result.id === commandHistory.id);
                                return (
                                  <li
                                    key={index_2}
                                  >
                                    <div>
                                      <h5
                                        title={`${commandHistory.date}`}
                                      >{relativeDate}</h5>
                                      {
                                        !results.length &&
                                        <p>No response yet</p>
                                      }
                                      {
                                        results.length > 0 &&
                                        <ul>
                                          {
                                            results.map((result, index_3) => {
                                              const {error, message} = result
                                              return (
                                                <li
                                                  key={index_3}
                                                >
                                                  {
                                                    error &&
                                                    <p
                                                      key={"error"}
                                                      style={{color: "red"}}
                                                    >{error}</p>
                                                  }
                                                  {
                                                    message &&
                                                    <p
                                                      key={"message"}
                                                      style={{color: "green"}}
                                                    >{message}</p>
                                                  }
                                                </li>
                                              )
                                            })
                                          }
                                        </ul>
                                      }
                                    </div>
                                  </li>
                                )
                              })
                            }
                          </ul>
                        }
                      </div>
                    </li>
                  )
                })
              }
            </ul>
          </div>
          :
          <p>No Grid Info Available</p>
      }
    </div>
  );
};

export default App;
