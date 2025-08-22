🎬 Video Summarizer – Smart Transcription & Summarization
This project allows users to upload a video file, automatically extract audio, transcribe it using AssemblyAI, and then generate a structured summary using Groq AI models.
It supports multi-stage summarization to handle long transcripts efficiently.

✨ Features :
📹 Upload video files (MP4, MKV, etc.)
🎧 Automatically extracts audio from video using ffmpeg
📝 Transcribes audio to text with AssemblyAI
🤖 Summarization powered by Groq 
📑 Multi-stage summarization (chunk → global summary)
🔄 Automatic retry with exponential backoff to handle API rate limits
🛠️ Express.js backend with modular services

🛠️ Tech Stack :
Backend: Node.js (Express.js)
Video → Audio: ffmpeg
Transcription: AssemblyAI API
Summarization: Groq API (models)
Utilities: Axios, dotenv, fs
