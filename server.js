const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"),
        res.setHeader("Access-Control-Allow-Header",
            "Origin,X-Requested-With,Content-Type,Accept"
        )
    res.setHeader("Access-Control-Allow-Method",
        "GET,POST,DELETE"
    )
    next();
})

let value = null
app.post('/descriptor', (req, res) => {
    let descriptor = req.body;
    console.log(descriptor)
    value = descriptor;
})

app.get('/get', (req, res) => {
    res.send(value)
})

app.listen(port, () => {
    console.log("server start")
})