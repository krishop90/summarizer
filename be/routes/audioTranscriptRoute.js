const express = require('express');
const { uploadAudio, requestTranscription, getTranscriptionResult } = require('../services/transcriptService');
const { analyzeTranscript } = require('../services/summarizeService');
const router = express.Router();

router.post('/transcribe', async (req, res) => {
  try {
    const { audioPath } = req.body;
    if (!audioPath) {
      return res.status(400).json({ error: "audioPath is required" });
    }
    const uploadUrl = await uploadAudio(audioPath);
    const transcriptId = await requestTranscription(uploadUrl);
    const transcriptText = await getTranscriptionResult(transcriptId);

    let summaryResult = null;
    try {
      summaryResult = await analyzeTranscript(transcriptText);
    } catch (e) {
      console.error("Summarization failed:", e);
    }

    if (summaryResult) {
      res.json({ summary: summaryResult });
    } else {
      res.json({ transcriptionText: transcriptText });
    }
  } catch (error) {
    console.error("AssemblyAI transcription error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

module.exports = router;