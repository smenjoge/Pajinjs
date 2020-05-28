// Dependencies
const express = require("express");
const path = require("path");
const fs = require("fs");

// Create Express Server
const server = express();
const PORT = process.env.PORT || 8050;
const dbFile = path.join(__dirname, "../db/db.json");

// Sets up the Express app to handle data parsing
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// Server starts listening to the PORT for incoming requests
server.listen(PORT, function() {
    console.log("Server listening on PORT: " + PORT);
});


//HTML Routes
server.get("/notes", function(request, response) {
    response.sendFile(path.join(__dirname, "notes.html"));
});

server.get("*", function(request, response) {
    response.sendFile(path.join(__dirname, "index.html"));
});


// API Routes
server.get("api/notes", function(request, response){
    fs.readFile(dbFile, function(err, data) {
        if (err) {
            throw err;
        } else {
            response.json(data);
        }
    });
});
  
server.post("api/notes", function(request, response){
    let inpNote = request.body;
    let newNote = {};
    let maxId = 0;
    fs.readFile(dbFile, function(err, dbNotes) {
        if (err) {
            throw err;
        } 
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

        } else {
            newNote = {
                id: 1,
                title: inpNote.title,
                text: inpNote.text
            }
        }
        dbNotes.push(newNote);
        fs.writeFile(dbFile, dbNotes, function (err) {
            if (err) {
                console.log("Error writing new note: ", err);
                response.end(err);
            }
            response.json(newNote);
        });
    });
});

server.delete("api/note/:id", function(request, response) {
    let delNoteId = request.params.id;
    let delNoteFound = false;

    fs.readFile(dbFile, function(err, dbNotes) {
        if (err) {
            throw err;
        } 
        for (j=0; i < dbNotes.length; j++) {
            if (dbNotes[j].id == delNoteId) {
                dbNotes.splice(j, 1);
                console.log("Note with id ", delNoteId, " is deleted");
                delNoteFound = true;
            }
        };
        if (delNoteFound) {
            fs.writeFile(dbFile, dbNotes, function (err) {
                if (err) {
                    console.log("Error updating db after delete, err: ", err);
                    response.end(err);
                }
                response.end("db updated successfully");
            });
        };
    });
})