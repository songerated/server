const express = require('express')
const app = express()
const mysql = require('mysql')

const db = mysql.createPool({

    host: 'verse-db.mysql.database.azure.com',
    user: 'Verse123',
    password: 'Dundermifflinpapercompany123',
    database: 'versemain'

})

app.get('/', (req, res) => {
    const query = 'SELECT * FROM users'
    db.query(query, (err, results) => {
        if (err) throw err
        res.send(results)
    })
})

app.listen(3001, () => {
    console.log("Server is running on port 3001")
})