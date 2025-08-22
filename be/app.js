const cors = require('cors');
const express = require('express');
const app = express();
const audioExtractionRoutes = require('./routes/audioExtractRoutes');
const audioTranscriptRoutes = require('./routes/audioTranscriptRoute');

require('dotenv').config();

app.use(cors());
app.use(cors({
  origin: "https://summarizer-1-diph.onrender.com"
}));

app.use(express.json());

app.use('/api', audioExtractionRoutes);
app.use('/api', audioTranscriptRoutes);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});