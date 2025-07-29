"use client";
import { useState } from "react";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import ReactSelect from "react-select";

export default function FlyerPage() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [design, setDesign] = useState("cartoon");
  const [loading, setLoading] = useState(false);

  const buildPrompt = () => {
    return `Vertical cartoon-style educational flyer, editorial infographic layout; title in a hand-drawn thought bubble, subtitle below; five numbered sections (1–5) as separate bright color blocks; each block with a short bold title, 1–3 sentence paragraph, and a matching cartoon icon; rounded sans-serif typography; vector-flat shading, bold black outlines (2–4px); pastel sky-blue background; accent colors yellow, coral, red, mint, navy; clean margins, balanced spacing, grid-based composition; bottom contact row with minimal black/navy icons for email, website, LinkedIn; print-ready look, poster.

TEXT OVERLAY (layout zones for readable text):
Title: ${title}
Subtitle: ${topic}
Contact: ${text}`;
  };

  const generate = async () => {
    setLoading(true);
    const form = new FormData();
    const prompt = buildPrompt();
    form.append("text", prompt);
    try {
      const res = await fetch("/api/v1/social/generate", {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.image_url);
        await fetch("/api/v1/social/flyers/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            title,
            topic,
            design,
            image_url: data.image_url,
          }),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E8F8]">
      <OverlayLoader show={loading} text="Loading..." />
      <Header />
      <Wrapper className="py-10 max-w-3xl space-y-4">
        <div className="space-y-4 bg-white rounded p-4">
          <ReactSelect
            classNamePrefix="select"
            options={[
              { value: "cartoon", label: "Cartoon" },
              { value: "minimalist", label: "Minimalist" },
              { value: "retro", label: "Retro" },
            ]}
            value={{ value: design, label: design.charAt(0).toUpperCase() + design.slice(1) }}
            onChange={(opt) => setDesign(opt!.value)}
          />
          <Input
            placeholder="Flyer title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Subtitle / Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Textarea
            placeholder="Contact info (e.g. email, website)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button onClick={generate} disabled={loading}>
            Generate Flyer
          </Button>
          {imageUrl && (
            <div className="flex justify-center pt-4">
              <img src={imageUrl} alt="flyer" className="max-w-sm w-full" />
            </div>
          )}
        </div>
      </Wrapper>
    </div>
  );
}
