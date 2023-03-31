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

module.exports = router;
