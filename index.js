const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require('cors')
var bodyParser = require('body-parser')
app.use(bodyParser.json())

const db = mysql.createPool({

    host: 'verse-db.mysql.database.azure.com',
    user: 'Verse123',
    password: 'Dundermifflinpapercompany123',
    database: 'versemain',
    multipleStatements: true


})

app.use(cors()) 

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




const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log("Server is running on port 3001")
})
