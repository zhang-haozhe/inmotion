const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
//const connectDB = require('./config/db')

const app = express();
const port = process.env.PORT || 8080;

// Connect Database
//connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*"),
//     res.setHeader(
//       "Access-Control-Allow-Header",
//       "Origin,X-Requested-With,Content-Type,Accept"
//     );
//   res.setHeader("Access-Control-Allow-Method", "GET,POST,DELETE");
//   next();
// });
app.use(cors());

let value = null;

app.post("/descriptor", (req, res) => {
  let descriptor = req.body;
  console.log(descriptor);
  value = descriptor;
});

app.get("/get", (req, res) => {
  console.log(value);
  res.send(value);
});

app.post("/user", (req, res) => {
  console.log(req.body)
})

app.listen(port, () => {
  console.log("server start");
});
