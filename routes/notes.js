const express = require('express');
const router = express.Router();
const Notes = require('../modules/Notes');
const { body, validationResult } = require('express-validator');


let fetchuser = require('../middleware/fetchuser');

router.post('/postNotes', fetchuser, [
    body('title', "Enter proper title").isLength({ min: 3 }),
    body('description', "Enter proper description").isLength({ min: 4 })
], async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const newNotes = {
            user: req.user.id,
            title: req.body.title,
            description: req.body.description,
            tag: req.body.tag
        }
        const created = await Notes.create(newNotes);

        if (!created) {
            return res.status(400).json({ error: 'Note not created' });
        }

        return res.status(200).json({ success: "Note is created",note:created});

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }



});


router.get('/getNotes', fetchuser, async (req, res) => {
    try {
        const users = await Notes.find({ user: req.user.id });
        if (!users) {
            return res.status(404).json('User not found');
        }
        const notes=users.map((user)=>{
            return({ _id:user._id,title: user.title, description: user.description, tag: user.tag });
        });

        if(notes)
        {
            return res.status(200).json(notes);
        }
        return res.status(400).send("No notes found");

    } catch (error) {
        return res.status(500).send(error.message);
    }
});


router.put('/updateNotes/:id', fetchuser, async (req, res) => {
    try {
        const newNotes = {
            title: req.body.title,
            description: req.body.description,
            tag: req.body.tag
        }

        const userId = req.user.id;
        const noteId = req.params.id;
        const note = await Notes.findById(noteId);

        if (!note) {
            return res.status(404).json({ error: "Notes does not exist" });
        }
        if (userId !== note.user.toString()) {
            return res.status(403).send('forbidden');
        }

        const updatedNote = await Notes.findByIdAndUpdate(noteId,
            { title: newNotes.title, description: newNotes.description, tag: newNotes.tag },
            { new: true, runValidators: true });

        if (!updatedNote) {
            return res.status(400).json({ error: "failed" });
        }
        res.status(200).json(updatedNote);

    } catch (error) {
        res.status(500).send("Internal server error");
        console.log(error.message);
    }
});


router.delete('/deleteNotes/:id', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        let noteId = req.params.id;

        const note = await Notes.findById(noteId);

        if (!note) {
            return res.status(404).json({ error: "Notes does not exist" });
        }
        if (userId !== note.user.toString()) {
            return res.status(403).send('forbidden');
        }
        const deleted = await Notes.findByIdAndDelete(noteId);
        return res.status(200).json({ success: "Note is deleted",note:deleted });
        
    } catch (error) {
        res.status(500).send("Internal Server error");
        console.log(error.message);
    }
});
module.exports = router;