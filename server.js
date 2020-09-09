const express = require("express");
const logger = require("morgan");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true }));//this is the middleware
app.use(express.json());
app.use(logger("dev"));
app.use(express.static("public"));//fixes everything!

app.get("/", function(req,res){
    //telling it what to send
    res.sendFile(__dirname + ".html");
})
// * The application should have a `db.json` file on the backend that will be used to store and retrieve notes using the `fs` module.
app.get("/api/notes", function(req, res){
    fs.readFile(__dirname + '/db/db.json', "utf8", function(err, data) {
        res.send(JSON.parse(data))
        console.log(data);
    });
})

app.post("/api/notes", function(req, res){//this pushes data into  the array
    let note = {
        id: uuidv4(),
        ...req.body
    };
    fs.readFile(__dirname + "/db/db.json", "utf8", function(err, data){
        const notes = JSON.parse(data);
        notes.push(note);
        const strData = JSON.stringify(notes, null, 2);
        fs.writeFile(__dirname + "/db/db.json", strData, function(){
          res.json(note);
        })
    })
    // res.json(note);
})

app.delete("/api/notes/:id", async function(req, res){
    try {
        const { id } = req.params;
        const data = await fs.promises.readFile(__dirname + "/db/db.json", "utf8");
        let notes = JSON.parse(data);
        notes = notes.filter((note)=> note.id !== id);//filtering out  the specific notes w/o the id
        const strData = JSON.stringify(notes, null, 2);
        await fs.promises.writeFile(__dirname + "/db/db.json", strData);
        res.json(true);//this sends a response to the front end
        } catch (err){res.status(500).end()};

});


app.get("/notes", function(req, res){//this send the user to the notes.html page
    res.sendFile(path.join(__dirname + "/public/notes.html"));
});
// * The following API routes should be created:
app.get("*", function(req, res){//all paths will take the user back to index.html with the *
    res.sendFile(__dirname + "/public/index.html")
});

app.listen(PORT, () => console.log(`App Listening ${PORT}`));