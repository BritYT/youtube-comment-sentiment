"use client";
import { useState } from "react";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch("/api/analyze-sentiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      setSentiment(data.sentiment);
    } catch (error: any) {
      console.error("Error analyzing sentiment:", error);
      if (error?.name === 'AbortError') {
        setSentiment("Request timed out. The video might have too many comments to analyze.");
      } else {
        setSentiment("Error analyzing comments. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8 flex flex-col items-center justify-center">
      <main className="max-w-3xl w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-white">
            YouTube Comment Sentiment Analyzer
          </h1>
          <p className="text-[#aaa]">
            Analyze the sentiment of comments on any YouTube video
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-4 w-full">
          <div className="relative flex-1">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter YouTube video URL"
              required
              className="w-full px-4 py-2.5 bg-[#121212] border border-[#303030] 
                rounded-full outline-none text-white placeholder-[#888]
                focus:bg-[#1f1f1f] focus:border-[#3ea6ff] focus:shadow-[0_0_0_1px_#3ea6ff]
                hover:border-[#555] hover:bg-[#1f1f1f]
                transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#222222] text-white rounded-full
              hover:bg-[#2f2f2f] border border-[#303030] hover:border-[#555]
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                Analyze
              </>
            )}
          </button>
        </form>

        {sentiment && (
          <div className="mt-8 p-6 bg-[#222222] rounded-lg border border-[#303030]">
            <h2 className="text-lg font-medium mb-3 text-white">Analysis Result</h2>
            <p className="text-[#aaa]">{sentiment}</p>
          </div>
        )}
      </main>
    </div>
  );
}
