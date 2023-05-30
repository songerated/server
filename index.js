const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require('cors')
var bodyParser = require('body-parser')
app.use(bodyParser.json())

const db = mysql.createPool({

    host: 'verse-server.database.windows.net',
    user: 'CloudSA44654426@verse-server',
    password: 'gudri@9852',
    database: 'verse-db',
    multipleStatements: true


})

app.use(cors()) 

app.get('/test', (req, res) => {
    
    res.send(db.getConnection())
})

app.get('/', (req, res) => {
    const query = 'SELECT * FROM users'
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err)
        }
        
        res.send(results)
    })
    
})

app.post('/tracks',(req,res)=>{
    var body = req.body.topTracks.items;
    var id = req.body.uid;

    console.log(id)
    console.log(body)

    var artistQuery = ""
    var albumQuery = ""
    var songQuery = ""
    var userInfo = ""

    for(var i = 0; i < body.length; i++){
        var artistName = body[i].artists[0].name
        var albumName = body[i].album.name
        var song_name = body[i].name
        artistName = artistName.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
        albumName = albumName.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
        song_name = song_name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
        artistQuery += `INSERT INTO artist(artist_id, artist_name)VALUES('${body[i].artists[0].id}', '${artistName}') ON DUPLICATE KEY UPDATE artist_id=artist_id;`
        albumQuery += `INSERT INTO album(album_id, album_name, artist_id)VALUES('${body[i].album.id}', '${albumName}', '${body[i].artists[0].id}') ON DUPLICATE KEY UPDATE album_id=album_id;`
        songQuery += `INSERT INTO songs(song_id, song_name, album_id, genre_id)VALUES('${body[i].id}', '${song_name}', '${body[i].album.id}', '1' )  ON DUPLICATE KEY UPDATE song_id=song_id;`
        userInfo += `INSERT INTO user_info(song_id, user_id)VALUES('${body[i].id}', '${id}');`
    }

    var sql = artistQuery + albumQuery + songQuery + userInfo;
    db.query(sql, (err, results)=>{
        if(err){
            res.status(500).send(err);
        }
        else {
            res.send(results)
        }
    })
})

app.get('/users', (req, res) => {   
    const query = 'SELECT * FROM users'
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err)
        }
        
        res.send(results)
    })
      
    
})




app.get('/usercreds', (req, res) => {
    const id=req.query.id;
    const name = req.query.name;
    const email = req.query.email;

    const query = `INSERT INTO users(id, username, name, email)VALUES('${id}', '${name}', '${name}', '${email}') ON DUPLICATE KEY UPDATE id=id;`
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err)
        }
        
        res.send(results)
    })
    
})


app.get('/matchingusers', (req, res) => {
    const id=req.query.uid;
    let songs = []
    let usersCMatchCount = new Map();
    const admin_songs_query = `SELECT song_id FROM user_info where user_id = '${id}'`
    const users_song_query = `SELECT * FROM user_info`

    db.query(admin_songs_query, (err, results) => {
        if (err) {
            res.status(500).send(err)
        }
        for(let i = 0; i < results.length; i++){
            console.log(results[i])
            songs.push(results[i].song_id)
        }

        
    
    })

    db.query(users_song_query, (err, results) => {
        if (err) {
            res.status(500).send(err)
        }

        for(let i = 0; i < results.length; i++){
            if(results[i].user_id != id){
                if(songs.includes(results[i].song_id)){
                    if(usersCMatchCount.has(results[i].user_id)){
                        usersCMatchCount.set(results[i].user_id, usersCMatchCount.get(results[i].user_id) + 1)
                    } 
                    else{
                        usersCMatchCount.set(results[i].user_id, 1)
                    }
                }
            }
        }
        
        console.log(id)
        console.log(usersCMatchCount)
        const obj = Object.fromEntries(usersCMatchCount);
        const json = JSON.stringify(obj);
        console.log(json)
        res.send(json)
    })

    

    
})

app.get('/matchingusers2', (req, res) => {
    const id=req.query.uid;
    let artists = []
    let usersCMatchCount = new Map();


    const user_artists_query = "SELECT user_info.user_id, artist.artist_id FROM versemain.user_info join songs on user_info.song_id = songs.song_id join album on songs.album_id = album.album_id join artist on album.artist_id = artist.artist_id;"
    const admin_artists_query = `SELECT user_info.user_id, artist.artist_id FROM versemain.user_info join songs on user_info.song_id = songs.song_id join album on songs.album_id = album.album_id join artist on album.artist_id = artist.artist_id where user_info.user_id = '${id}';`

    db.query(admin_artists_query, (err, results) => {
        if (err) {
            res.status(500).send(err)
        }
        for(let i = 0; i < results.length; i++){
            console.log(results[i])
            artists.push(results[i].artist_id)
        }
    })

    db.query(user_artists_query, (err, results) => {
        if (err) {
            res.status(500).send(err)
        }

        for(let i = 0; i < results.length; i++){
            if(results[i].user_id != id){
                if(artists.includes(results[i].artist_id)){
                    if(usersCMatchCount.has(results[i].user_id)){
                        usersCMatchCount.set(results[i].user_id, usersCMatchCount.get(results[i].user_id) + 1)
                    } 
                    else{
                        usersCMatchCount.set(results[i].user_id, 1)
                    }
                }
            }
        }
        
        console.log(id)
                console.log(id)

        console.log(usersCMatchCount)
        const obj = Object.fromEntries(usersCMatchCount);
        const json = JSON.stringify(obj);
        console.log(json)
        res.send(json)
    })


})


app.get("/userinfo", (req, res) => {

    const id=req.query.uid;
    const query = `SELECT * FROM users WHERE id = '${id}'`
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err)
        }

        res.send(results)
    })
})

app.get("/verifyuser", (req, res) => {
    const id = req.query.id;
    const query = `SELECT * FROM user_info WHERE user_id = '${id}'`  

    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err)
        }

        res.send(results)
    })
})





const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log("Server is running on port 3001")
})
