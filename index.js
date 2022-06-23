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
    database: 'versemain'

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
    
    var body = req.body.items;
    var name = body[0].name
    var id = body[0].id

    var sql = `INSERT INTO temp(id, name)VALUES('${id}', '${name}' );`;
    db.query(sql, (err, results)=>{
        if(err){
            res.status(500).send(err);
        }
        else {
            console.log(results);
            res.send(results);
        }
    })
    

})



const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log("Server is running on port 3001")
})

function queryExecute(sql,res){
    db.query(sql, function(err, results){
        if(err){
            console.log(err);
          
        }
        res.json(results);
        console.log(results);

    });
}