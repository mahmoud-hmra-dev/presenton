"use client";
import { useState } from "react";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    return `Create an infographic flyer in a modern, colorful cartoon style with bold black outlines and soft pastel colors (light blue, yellow, pink).
The infographic should be titled "${title}" inside a large yellow thought bubble at the top, next to cartoon-style icons.

Divide the flyer into ${steps.length} numbered sections. Each section should include:
- A large number in a colored circle
- A title (from user input)
- A short description (from user input)

Topic: ${topic}
Make the layout vertical, readable, and visually engaging.`;
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
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E8F8]">
      <Header />
      <Wrapper className="py-10 max-w-3xl space-y-4">
        <div className="bg-white rounded p-4 space-y-4">
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
        </div>
        {imageUrl && (
          <div className="flex justify-center">
            <img src={imageUrl} alt="flyer" className="max-w-sm w-full" />
          </div>
        )}
      </Wrapper>
    </div>
  );
}
