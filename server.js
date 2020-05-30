// Dependencies
const express = require("express");
const path = require("path");
const fs = require("fs");

// Create Express Server
const server = express();
const PORT = process.env.PORT || 8050;
const dbFile = path.join(__dirname, "db/db.json");

// Sets up the Express app to handle data parsing
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// Server starts listening to the PORT for incoming requests
server.listen(PORT, function() {
    console.log("Server listening on PORT: " + PORT);
});

// API Route
server.get("/api/notes", function(request, response){
    console.log("Get api/notes", request.url);
    fs.readFile(dbFile, function(err, rawData) {
        if (err) {
            console.log("throwing err");
            console.log(err);
            throw err;
        } 
        response.json(JSON.parse(rawData));
    });
}); 

// POST route
server.post("/api/notes", function(request, response){
    console.log("POST request");
    let inpNote = request.body;
    let newNote = {};
    let maxId = 0;
    fs.readFile(dbFile, function(err, rawData) {
        if (err) {
            throw err;
        } 
        let dbNotes = JSON.parse(rawData);
        if (dbNotes.length > 0) {
            for (i=0; i < dbNotes.length; i++) {
                if (i === 0) {
                    maxId = parseInt(dbNotes[i].id);
                } 
                else {
                    if (maxId < parseInt(dbNotes[i].id)) {
                        maxId = parseInt(dbNotes[i].id);
                    }
                }
            }
            newNote = {
                id: maxId + 1,
                title: inpNote.title,
                text: inpNote.text
            }

        } 
        else {
            newNote = {
                id: 1,
                title: inpNote.title,
                text: inpNote.text
            }
        };
        
        dbNotes.push(newNote);
        stringNotes = JSON.stringify(dbNotes);
        fs.writeFile(dbFile, stringNotes, function (err) {
            if (err) {
                console.log("Error writing new note: ", err);
                response.end(err);
            }
            response.json(newNote);
        });
    });
});

// DELETE route
server.delete("/api/notes/:id", function(request, response) {
    console.log("DELETE request");
    let delNoteId = request.params.id;
    let delNoteFound = false;

    fs.readFile(dbFile, function(err, rawData) {
        if (err) {
            throw err;
        } 
        dbNotes = JSON.parse(rawData);
        for (j=0; j < dbNotes.length; j++) {
            if (dbNotes[j].id == delNoteId) {
                dbNotes.splice(j, 1);
                console.log("Note with id ", delNoteId, " is deleted");
                delNoteFound = true;
            }
        };
        if (delNoteFound) {
            stringNotes = JSON.stringify(dbNotes);
            fs.writeFile(dbFile, stringNotes, function (err) {
                if (err) {
                    console.log("Error updating db after delete, err: ", err);
                    response.end(err);
                }
                response.end("db updated successfully");
            });
        };
    });
});

//HTML Routes
server.get("/notes", function(request, response) {
    console.log("Get notes", request.url);
    response.sendFile(path.join(__dirname, "notes.html"));
});

// This route is to handle favicon.ico 
server.get("/favicon.ico", function(request, response) {
    response.status(204).end();
});

server.get("/assets/js/index.js", function(request, response) {
    response.sendFile(path.join(__dirname, "assets/js/index.js"));
});

server.get("/assets/css/styles.css", function(request, response) {
    response.sendFile(path.join(__dirname, "assets/css/styles.css"));
});

// Keep this route at the end as it has url "*"
server.get("*", function(request, response) {
    response.sendFile(path.join(__dirname, "index.html"));
});
