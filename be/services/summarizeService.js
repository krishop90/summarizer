const axios = require("axios");

function splitTranscript(transcript, chunkSize = 4000) {
  const chunks = [];
  for (let i = 0; i < transcript.length; i += chunkSize) {
    chunks.push(transcript.slice(i, i + chunkSize));
  }
  return chunks;
}

async function callGroq(prompt, apiKey) {
  let retries = 5;
  let delay = 2000;

  while (retries > 0) {
    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "openai/gpt-oss-120b", 
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 512,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`Rate limit hit. Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; 
        retries--;
      } else {
        console.error("Groq API error:", error.response?.data || error.message);
        throw error;
      }
    }
  }
  throw new Error("Groq API rate limit exceeded. Please try again later.");
}

async function analyzeTranscript(transcript) {
  const chunks = splitTranscript(transcript, 4000);

  const chunkSummaries = [];
  for (const chunk of chunks) {
    const chunkPrompt = `
Summarize the following transcript chunk in simple bullet points.
Transcript:
${chunk}
`;
    const summary = await callGroq(chunkPrompt, process.env.GROQ_API_KEY);
    chunkSummaries.push(summary);

    await new Promise((res) => setTimeout(res, 4000));
  }

  const finalPrompt = `
Given the following chunk summaries of a transcript, determine if the conversation is an interview or a casual meeting.
- If it is an interview, extract only the questions asked.
- If it is a casual meeting, extract the most important points discussed.
Return your answer as a JSON object with keys: "type" ("interview" or "meeting"), and "extracted" (array of questions or points).

Chunk Summaries:
${chunkSummaries.join("\n")}
`;

  const finalResponse = await callGroq(finalPrompt, process.env.GROQ_API_KEY);

  try {
    return JSON.parse(finalResponse);
  } catch {
    return { type: "unknown", extracted: [], raw: finalResponse };
  }
}

module.exports = { analyzeTranscript };
