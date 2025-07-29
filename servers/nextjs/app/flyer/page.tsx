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
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [design, setDesign] = useState("cartoon");
  const [loading, setLoading] = useState(false);

  const buildPrompt = () => {
    return `Vertical cartoon-style educational flyer, inspired by modern editorial infographics. Fun, professional layout with colorful hand-drawn feel.

Title inside a thought bubble, bold and rounded sans-serif font
Subtitle line directly below the title
Five separate sections (1–5) as bright color blocks with:
- Bold short title
- 1–3 sentence paragraph
- Matching cartoon-style icon

Color style: pastel sky-blue background, accents of yellow, coral, red, mint, and navy. Clean grid layout with spacing. Poster-ready resolution.

TEXT OVERLAY:
Title: ${title}
Subtitle: ${description}
Contact: ${contact}`;
  };

  const generate = async () => {
    if (!title || !description) return alert("Please fill in title and description");
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
            topic: description,
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
            placeholder="Flyer Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Subtitle / Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Textarea
            placeholder="Contact info (optional)"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
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
