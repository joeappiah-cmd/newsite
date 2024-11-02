/********************************************************************************
* WEB700 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Augustine Appiah Bamfo  Student ID: 131215238 Date: 1st November 2024
*
* Published URL: 
*
********************************************************************************/

const express = require("express");
const path = require("path");
const LegoData = require("./modules/legoSets");

const app = express();
const HTTP_PORT = process.env.PORT || 8083;
const legoData = new LegoData();

legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log(`Server listening on port ${HTTP_PORT}`);
  });
}).catch((err) => {
  console.log("Unable to start the server: ", err);
});

app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;

  if (theme) {
    legoData.getSetsByTheme(theme)
      .then((sets) => res.json(sets))
      .catch((err) => res.status(404).send(err));
  } else {
    legoData.getAllSets()
      .then((sets) => res.json(sets))
      .catch((err) => res.status(404).send(err));
  }
});

app.get("/lego/sets/:set_num", (req, res) => {
  const setNum = req.params.set_num;

  legoData.getSetByNum(setNum)
    .then((set) => res.json(set))
    .catch((err) => res.status(404).send(err));
});

app.get("/lego/add-test", (req, res) => {
  let testSet = {
      set_num: "123",
      name: "testSet name",
      year: "2024",
      theme_id: "366",
      num_parts: "123",
      img_url: "https://fakeimg.pl/375x375?text=[+Lego+]"
  };

  legoData.addSet(testSet)
      .then(() => {
          // Redirect to the sets page if successful
          res.redirect("/lego/sets");
      })
      .catch((err) => {
          // Set status code to 422 and return the error
          res.status(422).send(err);
      });
});


app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

