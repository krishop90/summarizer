import React, { useRef, useState } from "react";
import axios from "axios";
import "./App.css";
const API_BASE = import.meta.env.VITE_API_BASE;

function UploadCard({ onFileChange, onUpload, uploading, videoFile }) {
  const fileInputRef = useRef();

  return (
    <div className="upload-card">
      <h2 style={{ color: "black" }}>Upload a Video File</h2>
      <input
        type="file"
        accept="video/*"
        onChange={onFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
        disabled={uploading}
      />
      <button
        className="choose-file-btn"
        type="button"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        disabled={uploading}
      >
        {videoFile ? "Change File" : "Choose File"}
      </button>
      {videoFile && (
        <div className="file-name">
          <span>Selected: {videoFile.name}</span>
        </div>
      )}
      <button
        onClick={onUpload}
        disabled={!videoFile || uploading}
        style={{ marginTop: "1rem" }}
      >
        {uploading ? "Processing..." : "Upload & Summarize"}
      </button>
    </div>
  );
}

function TranscriptCard({ transcript }) {
  if (!transcript) return null;
  return (
    <div className="result-card">
      <h2>Transcript</h2>
      <div className="transcript-text">
        {transcript.split("\n").map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function PointsCard({ points, type }) {
  if ((!points || !Array.isArray(points) || points.length === 0) && !type) return null;
  return (
    <div className="result-card">
      <h2 style={{ color: "black" }}>Important Points</h2>
      {type && (
        <div className="type-label" style={{ color: "black" }}>
          <span>Type: </span>
          <span className={`type-badge type-${type}`}>{type}</span>
        </div>
      )}
      <ul className="points-list">
        {points && points.map((pt, idx) => (
          <li key={idx}>{pt}</li>
        ))}
      </ul>
    </div>
  );
}

function Status({ status }) {
  return status ? <div className="status">{status}</div> : null;
}

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [points, setPoints] = useState([]);
  const [type, setType] = useState("");

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
    setTranscript("");
    setPoints([]);
    setType("");
    setStatus("");
  };

  const handleUpload = async () => {
    if (!videoFile) return;
    setUploading(true);
    setStatus("Uploading video...");
    setTranscript("");
    setPoints([]);
    setType("");

    const formData = new FormData();
    formData.append("file", videoFile);

    try {
      const extractRes = await axios.post(
        `${API_BASE}/api/extract-audio`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const audioPath = extractRes.data.audioFile;
      setStatus("Audio extracted. Transcribing and summarizing...");

      const transcribeRes = await axios.post(`${API_BASE}/api/transcribe`, { audioPath });
      setStatus("Done!");

      let summary = transcribeRes.data.summary;
      let transcriptText = transcribeRes.data.transcriptionText;

      let extractedPoints = [];
      let extractedType = "";
      if (summary && typeof summary === "object") {
        if (Array.isArray(summary.extracted)) {
          extractedPoints = summary.extracted;
        }
        if (summary.type) {
          extractedType = summary.type;
        }
      } else if (typeof summary === "string") {
        try {
          const parsed = JSON.parse(summary);
          if (Array.isArray(parsed.extracted)) {
            extractedPoints = parsed.extracted;
          }
          if (parsed.type) {
            extractedType = parsed.type;
          }
        } catch {
          extractedPoints = [summary];
        }
      }
      setPoints(extractedPoints);
      setType(extractedType);
      setTranscript(transcriptText || "");
    } catch (err) {
      setStatus("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Video Summarizer</h1>
      {!transcript && !points.length ? (
        <UploadCard
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          uploading={uploading}
          videoFile={videoFile}
        />
      ) : null}
      <Status status={status} />
      {(transcript || points.length) && (
        <div className="results-container">
          <TranscriptCard transcript={transcript} />
          <PointsCard points={points} type={type} />
        </div>
      )}
    </div>
  );
}

export default App;