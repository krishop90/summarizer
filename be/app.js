const cors = require('cors');
const express = require('express');
const app = express();

require('dotenv').config();

app.use(express.json());

app.use(cors({
  origin: "https://summarizer-1-diph.onrender.com",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const audioExtractionRoutes = require('./routes/audioExtractRoute');
const audioTranscriptRoutes = require('./routes/audioTranscriptRoute');

app.use('/api', audioExtractionRoutes);
app.use('/api', audioTranscriptRoutes);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
