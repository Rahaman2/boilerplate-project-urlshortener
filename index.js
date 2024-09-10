require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const shortId = require("shortid");
const validUrl = require("valid-url");
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}))
// connecting to DB
const uri = process.env.Mongo_URI;
mongoose.connect(uri, {
  useNewUrlParser : true,
  useUnifiedTopology: true
});
// testing connection to DB
mongoose.connection.on("error",console.error.bind("console", "connection error"));
mongoose.connection.once("open", () => {
  console.log("connected to database established");
});



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
// creating urkl schema
const UrlShcema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const Url = mongoose.model("URL",UrlShcema);

app.post("/api/shorturl",async (req,res)=>{
  const linkToShorten = req.body.url;

      if(!linkToShorten.startsWith("http://") && !linkToShorten.startsWith("https://")) {//checking if given url is valid
        console.log(linkToShorten +" Already Exists");
        return res.json({error: "Invalid url"});
      } else { // if link provided by user does not exist then create short link and add to database
        try {
          let findOne = await Url.findOne({
            original_url: linkToShorten
          });
          if( findOne) {
            res.json({
              original_url: findOne.original_url,
              short_url: findOne.short_url
            });
          } else {
            const url = new Url({
              original_url: linkToShorten,
              short_url: shortId.generate()
            });
            await url.save();
            res.json({
              original_url: url.original_url,
              short_url: url.short_url
            })
          }
        } catch (error) {
          console.log(error);
          res.json({server: "error"});
        }
    }
});

// 
app.get("/api/shorturl/:shortLink",async (req,res) => {
  const shortLink= req.params.shortLink
  const short = await Url.findOne({
    short_url: shortLink
  });
  try {
    if(short) {
      res.redirect(short.original_url);
    }
  } catch (error) {
    console.log(error);
    res.json({error: "error"})
  }
});
// 
const personSchema = new mongoose.Schema({
  name: String,
  age: Number
});
const Person = mongoose.model("Person",personSchema);


Person.find((err,people) => {
  if(err) {
    console.log(err);
  } else {
    for(let i = 0; i<people.length;i++) {
      console.log(people[i].name);
    }
  }
})

// mongoose.connection.close();
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

