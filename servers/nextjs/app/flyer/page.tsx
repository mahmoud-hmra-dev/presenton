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
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [contact, setContact] = useState("");
  const [design, setDesign] = useState("cartoon");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const buildPrompt = () => {
    const styles: Record<string, string> = {
      cartoon: "Vertical cartoon-style educational flyer with a playful editorial infographic layout. Use bold black outlines (2–4px), pastel sky-blue background, and rounded sans-serif fonts. Each section should be bright and colorful with clear, numbered blocks and matching cartoon icons. Include a hand-drawn thought bubble for the title, and clear visual structure for easy reading.",
      minimalist: "Clean, white-space-heavy minimalist flyer with muted pastel tones, modern thin sans-serif fonts, and sharp visual structure. Keep icons minimal and layout airy.",
      retro: "Bold retro-style flyer with bright contrasting colors (red, blue, yellow), thick outlines, vintage fonts, and nostalgic visuals. Each section should be expressive, like an 80s poster.",
    };

    const sectionExamples = `
1. Talent Match — We connect top-tier professionals with leading institutions.
2. Learning Paths — Accelerate your career through certified programs.
3. Flexible Work — Full-time, freelance, or remote? You choose.
4. Digital HRMS — Streamline workforce operations with smart tools.
5. Social Impact — Empowering communities through care.`;

    const prompt = `${styles[design]}

Design layout:
- Title: "${title}" inside a large yellow thought bubble at the top
- Subtitle: "${topic}" directly under the title
- Body: 5 large sections clearly numbered (1–5), each with a bold short title and a 1–2 sentence description

TEXT CONTENT:
${sectionExamples}

Contact Info: ${contact}

Ensure all text is crystal clear and readable, with high contrast and clean visual hierarchy. Poster should be suitable for print and social media. Do not leave any section empty or vague.`;

    return prompt;
  };

  const generate = async () => {
    setLoading(true);
    const prompt = buildPrompt();
    setGeneratedPrompt(prompt);
    const form = new FormData();
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
      <OverlayLoader show={loading} text="Generating high-quality flyer..." />
      <Header />
      <Wrapper className="py-10 max-w-3xl space-y-6">
        <div className="space-y-4 bg-white rounded p-6">
          <h2 className="text-xl font-bold">🎨 Create Professional Flyer</h2>

          <ReactSelect
            classNamePrefix="select"
            options={[
              { value: "cartoon", label: "🖍️ Cartoon Style" },
              { value: "minimalist", label: "📐 Minimalist Style" },
              { value: "retro", label: "📺 Retro Style" },
            ]}
            value={{ value: design, label: `Style: ${design.charAt(0).toUpperCase() + design.slice(1)}` }}
            onChange={(opt) => setDesign(opt!.value)}
          />

          <Input
            placeholder="Flyer Title (e.g. Clepius)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Flyer Subtitle / Topic (e.g. Healthcare Talent Across Africa)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Input
            placeholder="Contact Info (email, website, etc.)"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />

          <Button onClick={generate} disabled={loading}>
            🚀 Generate Flyer
          </Button>

          {generatedPrompt && (
            <div className="mt-6">
              <h4 className="font-semibold mb-2">🧠 Generated Prompt:</h4>
              <pre className="bg-gray-100 text-sm p-4 rounded whitespace-pre-wrap border border-gray-300">
                {generatedPrompt}
              </pre>
            </div>
          )}

          {imageUrl && (
            <div className="flex justify-center pt-6">
              <img
                src={imageUrl}
                alt="Generated flyer"
                className="rounded shadow-lg border border-gray-200 max-w-full"
              />
            </div>
          )}
        </div>
      </Wrapper>
    </div>
  );
}
