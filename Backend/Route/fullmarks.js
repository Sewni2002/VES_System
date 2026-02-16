// Route/fullmarks.js
const express = require('express');
const router = express.Router();

const FullMarks = require('../Model/FullMarks');

// Save or update marks
router.post('/save', async (req, res) => {
  try {
    const { sid, gid, automatedmarks, manualmarks } = req.body;
    const fullmark = automatedmarks + manualmarks;

   

   




    const result = await FullMarks.findOneAndUpdate(
      { sid },
      { sid, gid, automatedmarks, manualmarks, fullmark },
      { upsert: true, new: true }
    );

   



    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate session link
router.post('/generate-link/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const { frontendHost } = req.body; // host sent from frontend
    const link = `http://${frontendHost}/student-session/${sid}`;


   


    await FullMarks.findOneAndUpdate({ sid }, { link}, { upsert: true});
    res.json({ link});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate link' });
  }
});


// Delete session link
router.delete('/delete-link/:sid', async (req, res) => {
  try {
    const { sid } = req.params;

    const result = await FullMarks.findOneAndUpdate(
      { sid },
      { $set: { link: '' } },
      { new: true }
    );

    res.json({ message: 'Link deleted', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Get FullMarks by SID
router.get('/by-sid/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const fullMarks = await FullMarks.findOne({ sid });
    if (!fullMarks) return res.status(404).json({ message: 'FullMarks not found' });
    res.json(fullMarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// Save result link and QR code
router.post('/save-result/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const { resultLink, qrCode } = req.body;

    const result = await FullMarks.findOneAndUpdate(
      { sid },
      { resultLink, qrCode },
      { new: true }
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
