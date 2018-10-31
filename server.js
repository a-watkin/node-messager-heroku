var os = require("os");

var express = require("express");
var bodyParser = require("body-parser");

// for environment variables from .env file
require("dotenv").config();

var app = express();

// uses the node.js http server module passing in the express app
// make sure that it is with an uppercase S
var http = require("http").Server(app);

app.use(express.static(__dirname));

// required to parse data from the front end
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var io = require("socket.io")(http);

// for talking to mongodb
var mongoose = require("mongoose");
// tell mongoose to use default es6 promise library
mongoose.Promise = Promise;

var PORT = 3000;
var dbUrl = null;

if (os.hostname() === "a-Z97-D3H") {
  console.log("on local machine");

  // PORT = 2999

  // for environment variables from .env file
  require("dotenv").config();

  const db = {
    username: process.env.DB_USER,
    password: process.env.DB_PASS
  };

  dbUrl = `mongodb://${db.username}:${
    db.password
  }@ds139722.mlab.com:39722/bobbytables`;
} else {
  console.log("on heroku");

  // heroku env variable
  PORT = process.env.PORT || 5000;

  // make database connection
  dbUrl = process.env.PROD_MONGODB;
}

console.log(dbUrl);
// // removed because it's also deprechiated, but without some second argument
// // there's a warning message
// // second argument
// useMongoClient: true
mongoose.connect(
  dbUrl,
  { useNewUrlParser: true },
  err => {
    console.log("mongo db conncetions", err);
  }
);

var Message = mongoose.model("Message", {
  name: String,
  dateTime: Object,
  message: String
});

// url, request, response
app.get("/messages", (req, res) => {
  // changed to get messages fromt he database
  // and then send them to the frontend
  Message.find({}, (err, messages) => {
    if (err) {
      console.log(err);
    }
    // console.log('messages from db ', res)
    res.send(messages);
  });
});

app.get("/messages/:user", (req, res) => {
  Message.find({}, (err, messages) => {
    if (err) {
      console.log(err);
    }
    console.log("messages from db for user ", res);
    res.send(messages);
  });
});

app.post("/messages", async (req, res) => {
  console.log(req.body);
  try {
    // throw 'error'
    // throw 'some error'

    // new database object, req.body contains the same structure
    var message = new Message(req.body);

    // uses a promise
    var savedMessage = await message.save();
    // returns the record from the database
    var censored = await Message.findOne({ message: "badword" });

    if (censored) {
      console.log("censored words found", censored);
      await Message.remove({ _id: censored.id });
    } else {
      io.emit("message", req.body);
    }
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    return console.error(error);
  } finally {
    // call logger maybe, or close recourse
    // console.log('hello from finally')
  }
});

app.post("/delete", (req, res) => {
  // console.log('test')

  Message.remove({}, err => {
    if (err) {
      // console.log(err)
      res.sendStatus(500);
    } else {
      // console.log('it worked?')
      res.sendStatus(200);
      // io.emit()
    }
  });
});

// // logs a message anytime a client connects
io.on("connection", socket => {
  console.log("a user connected");
});

var server = http.listen(PORT, err => {
  console.log("server is listening on port", server.address().port);

  if (err) {
    console.log(err);
  }
});
