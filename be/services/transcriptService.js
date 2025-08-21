const axios = require('axios');
const fs = require('fs');

const ASSEMBLYAI_UPLOAD_URL = 'https://api.assemblyai.com/v2/upload';
const ASSEMBLYAI_TRANSCRIPT_URL = 'https://api.assemblyai.com/v2/transcript';

async function uploadAudio(filePath) {
  const stream = fs.createReadStream(filePath);
  const response = await axios.post(
    ASSEMBLYAI_UPLOAD_URL,
    stream,
    {
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );
  return response.data.upload_url;
}

async function requestTranscription(uploadUrl) {
  const response = await axios.post(
    ASSEMBLYAI_TRANSCRIPT_URL,
    { audio_url: uploadUrl },
    {
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      }
    }
  );
  return response.data.id;
}

async function getTranscriptionResult(transcriptId) {
  while (true) {
    const response = await axios.get(
      `${ASSEMBLYAI_TRANSCRIPT_URL}/${transcriptId}`,
      {
        headers: {
          authorization: process.env.ASSEMBLYAI_API_KEY,
          'content-type': 'application/json',
        }
      }
    );
    if (response.data.status === 'completed') {
      return response.data.text;
    } else if (response.data.status === 'error') {
      throw new Error(`Transcription failed: ${response.data.error}`);
    }
    await new Promise(res => setTimeout(res, 3000));
  }
}

module.exports = { uploadAudio, requestTranscription, getTranscriptionResult };