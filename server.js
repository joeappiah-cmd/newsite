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
* Published URL: https://newsite-one-lilac.vercel.app/about
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
  res.render('home');
});

app.get("/about", (req, res) => {
  res.render('about');
});


app.get("/lego/addset", async(req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render('addset', {themes:themes});
  } catch (err){
    res.status(400).send(`Error fetching themes: ${err}`);
  }
});

app.post("/lego/addset", async (req, res) => {
  try {
    let foundTheme = await legoData.getThemeById(req.body.theme_id);
    if (!foundTheme) {
      res.status(400).send("Theme not found");
      return;
    }

    req.body.theme = foundTheme.name;
    await legoData.addSet(req.body);

    res.redirect("/lego/sets");
  } catch (err) {
    res.status(500).send(`Error adding set: ${err.message}`);
  }
});

app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;

  if (theme) {
    legoData.getSetsByTheme(theme)
      .then((sets) => {
        res.render('sets', { sets: sets });
      })
      .catch((err) => res.status(404).send(err));
  } else {
    legoData.getAllSets()
      .then((sets) => {
        res.render('sets', { sets: sets });
      })
      .catch((err) => res.status(404).send(err));
  }
});

app.get("/lego/sets/:set_num", (req, res) => {
  const setNum = req.params.set_num;

  legoData.getSetByNum(setNum)
    .then((set) => res.render('setDetails', { set: set }))
    .catch((err) => res.status(404).send(err));
});

app.get("/lego/deleteSet/:set_num", async (req, res) => {
  try {
    const setNum = req.params.set_num;
    await legoData.deleteSetByNum(setNum); 
    res.redirect("/lego/sets"); 
  } catch (err) {
    res.status(404).send(`Error deleting set: ${err.message}`);
  }
});

app.use((req, res) => {
  res.status(404).render('404'); 
});
