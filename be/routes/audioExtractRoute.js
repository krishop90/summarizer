const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router();
ffmpeg.setFfmpegPath(ffmpegPath);

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post('/extract-audio', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  const videoPath = req.file.path;
  const audioPath = path.join('uploads', `${Date.now()}-audio.wav`);

  ffmpeg(videoPath)
    .noVideo()
    .audioCodec('pcm_s16le')
    .save(audioPath)
    .on('end', () => {
      fs.unlinkSync(videoPath);
      res.json({ message: 'Audio extracted successfully', audioFile: audioPath });
    })
    .on('error', (err) => {
      console.error('Error extracting audio:', err);
      res.status(500).send('Failed to extract audio from video.');
    });
});

module.exports = router;
