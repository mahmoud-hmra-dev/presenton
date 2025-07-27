"use client";
import { useState } from "react";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReactSelect from "react-select";

export default function FlyerPage() {
  interface Step {
    title: string;
    text: string;
  }

  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [design, setDesign] = useState("cartoon");


  const addStep = () => {
    setSteps([...steps, { title: "", text: "" }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, key: keyof Step, value: string) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const buildPrompt = () => {
    const base = `Create an infographic flyer in a modern, colorful cartoon style with bold black outlines and soft pastel colors (light blue, yellow, pink). Ensure all text is crisp and easy to read.`;
    const minimalist = `Create a clean minimalist infographic flyer with lots of white space and thin sans-serif fonts. Make the wording sharp and legible.`;
    const retro = `Create a bold retro style infographic flyer with bright contrasting colors and thick outlines. Use clear readable lettering.`;

    const styleMap: Record<string, string> = {
      cartoon: base,
      minimalist: minimalist,
      retro: retro,
    };

    const stepsContent = steps
      .map((s, i) => `${i + 1}. ${s.title}: ${s.text}`)
      .join("\n");

    return `${styleMap[design]}
The infographic should be titled "${title}" inside a large yellow thought bubble at the top, next to cartoon-style icons.

Divide the flyer into ${steps.length} numbered sections with very clear and legible text. Each section should include:
1. A large, colored number inside a circle.
2. A title for the section.
3. A short description for each point.

${stepsContent}

Topic: ${topic}
Use high contrast fonts so all text is easily readable. Make the layout vertical, highly visual, and engaging for social media or print.`;
  };

  const generate = async () => {
    const form = new FormData();
    const prompt = buildPrompt();
    form.append("text", prompt);
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
          steps,
          design,
          image_url: data.image_url,
        }),
      });
    }
  };


  return (
    <div className="min-h-screen bg-[#E9E8F8]">
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
              placeholder="General topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Textarea
              placeholder="Flyer description"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {steps.map((step, idx) => (
              <div key={idx} className="space-y-2 border-t pt-4">
                <Input
                  placeholder={`Step ${idx + 1} Title`}
                  value={step.title}
                  onChange={(e) => updateStep(idx, "title", e.target.value)}
                />
                <Textarea
                  placeholder="Step description"
                  value={step.text}
                  onChange={(e) => updateStep(idx, "text", e.target.value)}
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeStep(idx)}
                >
                  Remove Step
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addStep}>
              Add Step
            </Button>
            <Button onClick={generate}>Generate Flyer</Button>
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
