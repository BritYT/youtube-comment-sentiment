import { NextResponse } from "next/server";
import { google } from "googleapis";
import OpenAI from "openai";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { videoUrl } = await req.json();
    
    // Extract video ID from URL
    const videoId = new URL(videoUrl).searchParams.get("v");
    if (!videoId) {
      return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
    }
    
    // Get comments using YouTube API
    const response = await youtube.commentThreads.list({
      part: ["snippet"],
      videoId,
      maxResults: 100,
    });

    const comments = response.data.items?.map(
      (item) => item.snippet?.topLevelComment?.snippet?.textDisplay
    ).filter(Boolean);

    // Analyze comments with OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing YouTube comments. Provide a concise summary of the general sentiment and main themes in the comments.",
        },
        {
          role: "user",
          content: `Analyze these YouTube comments and provide a summary of the general sentiment: ${comments?.join("\n")}`,
        },
      ],
      model: "gpt-4-turbo",
    });

    return NextResponse.json({ sentiment: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze comments" },
      { status: 500 }
    );
  }
} 