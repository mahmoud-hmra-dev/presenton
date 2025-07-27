"use client";
import { useState } from "react";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function FlyerPage() {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generate = async () => {
    const form = new FormData();
    if (text) form.append("text", text);
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
      <Wrapper className="py-10 max-w-2xl space-y-4">
        <Textarea
          placeholder="Flyer description"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button onClick={generate}>Generate Flyer</Button>
        {imageUrl && <img src={imageUrl} alt="flyer" className="max-w-sm" />}
      </Wrapper>
    </div>
  );
}
