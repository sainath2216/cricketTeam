const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const convertObjectToResponse = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

//Get All Player

app.get('/players/', async (request, response) => {
  const getAllPlayersQuery = `
    SELECT 
    * 
    FROM
    cricket_team;`
  const playerArray = await db.all(getAllPlayersQuery)
  response.send(
    playerArray.map(eachPlayer => convertObjectToResponse(eachPlayer)),
  )
})

//Post player
app.post('/players/', async (request, response) => {
  const playerDeatils = request.body
  const {playerName, jerseyNumber, role} = playerDeatils
  const addPlayerQuery = `
  INSERT INTO 
  cricket_team (player_name,jersey_number,role)
  VALUES(
    "${playerName}",
    "${jerseyNumber}",
    "${role}"
  );`
  const dbresponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//Get One playerId
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerIdQuery = `
  SELECT * FROM cricket_team
  WHERE player_id = ${playerId};`
  const playerDetailsResponse = await db.get(playerIdQuery)
  response.send(convertObjectToResponse(playerDetailsResponse))
})

//Put player
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `
  UPDATE
  cricket_team
  SET 
  player_name="${playerName}",
  jersey_number = "${jerseyNumber}",
  role = "${role}"
  WHERE
  player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//Delete players

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `
  DELETE 
  FROM
  cricket_team
  WHERE 
  player_id = ${playerId};`
  await db.run(deleteQuery)
  response.send('Player Removed')
})

module.exports = app
