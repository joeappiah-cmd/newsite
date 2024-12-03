/********************************************************************************
* WEB700 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Augustine Appiah Bamfo  Student ID: 131215238 Date: 4th December 2024
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

app.use(express.urlencoded({ extended: true })); 


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

// app.post("/lego/addset", async (req, res) => {
//   try {
//     let foundTheme = await legoData.getThemeById(req.body.theme_id);
//     if (!foundTheme) {
//       res.status(400).send("Theme not found");
//       return;
//     }

//     req.body.theme = foundTheme.name;
//     await legoData.addSet(req.body);

//     res.redirect("/lego/sets");
//   } catch (err) {
//     res.status(400).send(`Error adding set: ${err.message}`);
//   }
// });

app.post('/lego/addSet', async (req, res) => {
  try {
    const newSet = {
      set_num: req.body.set_num,
      name: req.body.name,
      year: req.body.year,
      num_parts: req.body.num_parts,
      img_url: req.body.img_url,
      theme_id: req.body.theme_id,
    };
    await legoData.addSet(newSet);
    res.redirect('/lego/sets');
  } catch (err) {
    console.error(err);
    res.status(500).render("500", { message: err });
  }
});

app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;

  if (theme) {
    legoData.getSetsByTheme(theme)
      .then((setfiltered) => {
        res.render("sets", { sets: setfiltered });
      })
      .catch((err) => res.status(404).send(err));
  } else {
    legoData.getAllSets()
      .then((allsets) => {
        res.render("sets", { sets: allsets });
      })
      .catch((err) => res.status(500).send("Error getting the set"));
  }
});

app.get("/lego/sets/:set_num", (req, res) => {
  const setNum = req.params.set_num;

  legoData.getSetByNum(setNum)
    .then((legoSet) => {
      console.log(legoSet); 
      res.render('set', { set: legoSet });
    })
    .catch((err) => {
      console.error(err); 
      res.status(404).send(err);
    });
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
