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
  const [example, setExample] = useState("");

  const examples: Record<string, string> = {
    cartoon: `Title: Clepius\nSubtitle: Redefining Healthcare Talent Across Africa & the Mediterranean\n\n1. Talent Match — We connect top-tier professionals with leading institutions.\n2. Learning Paths — Accelerate your career through certified programs.\n3. Flexible Work — Full-time, freelance, or remote? You choose.\n4. Digital HRMS — Streamline workforce operations with smart tools.\n5. Social Impact — Empowering communities through care.\n\nContact: bd@clepius.net | www.clepius.net | LinkedIn: Clepius`,

    minimalist: `Title: 5 Keys to Remote Team Success\nSubtitle: Boost productivity with simple remote work practices.\n\n1. Clear Communication — Always document and share updates.\n2. Async Collaboration — Use tools like Notion or Slack.\n3. Daily Check-ins — Keep everyone aligned.\n4. Boundaries — Separate work and home hours.\n5. Celebrate Wins — Reinforce team morale.\n\nContact: remote@success.io | www.success.io`,

    retro: `Title: GrooveCamp 2025\nSubtitle: Learn, Code, and Dance – The Retro Way!\n\n1. Morning Jams — Start with live DJ coding sessions.\n2. 80s Tech Hacks — Explore vintage tools and games.\n3. Code Battles — Teams compete retro style.\n4. Pixel Art Lab — Build 8-bit masterpieces.\n5. Big Bash — Closing party with synth-pop bands.\n\nContact: info@groovecamp.com | www.groovecamp.com`,
  };

  const buildPrompt = () => {
    return `Vertical ${design}-style educational flyer, editorial infographic layout; title in a hand-drawn thought bubble, subtitle below; five numbered sections (1–5) as separate bright color blocks; each block with a short bold title, 1–3 sentence paragraph, and a matching cartoon icon; rounded sans-serif typography; vector-flat shading, bold black outlines (2–4px); pastel sky-blue background; accent colors yellow, coral, red, mint, navy; clean margins, balanced spacing, grid-based composition; bottom contact row with minimal icons for email, website, LinkedIn; print-ready look, poster.\n\nTEXT OVERLAY:\nTitle: ${title}\nSubtitle: ${topic}\nContact: ${text}`;
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
              { value: "cartoon", label: "Cartoon Style (fun, colorful, icons)" },
              { value: "minimalist", label: "Minimalist Style (clean, white space)" },
              { value: "retro", label: "Retro Style (vibrant, bold, vintage)" },
            ]}
            value={{ value: design, label: design.charAt(0).toUpperCase() + design.slice(1) + " Style" }}
            onChange={(opt) => setDesign(opt!.value)}
          />
          <Button type="button" onClick={() => setExample(examples[design])}>
            Preview Example
          </Button>
          {example && (
            <pre className="bg-gray-100 text-sm p-4 rounded whitespace-pre-wrap border border-gray-300">
              {example}
            </pre>
          )}
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
