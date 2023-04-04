const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

// Route 1: Get all notes of User using -POST "api/notes/fetchallNotes" login required
router.get("/fetchallNotes", fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });

    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route 2: add a new note using -POST "api/notes/addnote" login required
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "description must be atleast 5 lettters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
        
    const { title, description, tag } = req.body;
    // if there are errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savednote= await note.save()
      res.json(savednote);
    }
     catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  
})

// Route 3: updating an existing  note using -PUT "api/notes/updatenote/:id" login required
router.put("/updatenote/:id", fetchUser, async (req, res) => {

  const {title, description,tag} =req.body;

  try {
    
 
  // create a new note
  const newNote={};
  if(title) {newNote.title=title};
  if(description) {newNote.description=description};
  if(tag){newNote.tag=tag};
  
  // find the note to be updated and update it;
  let note =await Note.findById(req.params.id);

  if(!note) {
    return res.status(404).send("Not found");
  }

  if(note.user.toString()!=req.user.id){
    return res.status(401).send("Not Allowed");
  }

  note = await Note.findByIdAndUpdate(req.params.id, {$set:newNote}, {new:true});
  res.json({note});

  }catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});


// Route 4: deleting an existing  note using -DELETE "api/notes/deletenote/:id" login required
router.delete("/deletenote/:id", fetchUser, async (req, res) => {

  const {title, description,tag} =req.body;
  try {
  
  // find the note to be delete and delete it;
  let note =await Note.findById(req.params.id);

  if(!note) {
    return res.status(404).send("Not found");
  }

  if(note.user.toString()!=req.user.id){
    return res.status(401).send("Not Allowed");
  }

  note = await Note.findByIdAndDelete(req.params.id);
  res.json({"Success":"Note has been deleted", note:note});

  }catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }

});


module.exports = router;
