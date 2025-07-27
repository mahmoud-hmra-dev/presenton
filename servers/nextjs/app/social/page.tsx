"use client";
import { useEffect, useState } from "react";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface PageInfo { id: string; name: string }

export default function SocialPage() {
  const [text, setText] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const [manualCaption, setManualCaption] = useState("");
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [manualPreview, setManualPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      const res = await fetch("/api/v1/social/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      }
    };
    fetchPages();
  }, []);

  const generate = async () => {
    const form = new FormData();
    if (text) form.append("text", text);
    if (audio) form.append("file", audio);
    const res = await fetch("/api/v1/social/generate", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      setContent(data.content);
      setImageUrl(data.image_url);
      setPages(data.pages || []);
    }
  };

  const publishAI = async () => {
    if (!content || !imageUrl) return;
    const body = new FormData();
    body.append("caption", content);
    body.append("image_url", imageUrl);
    selected.forEach((id) => body.append("page_ids", id));
    const res = await fetch("/api/v1/social/publish", { method: "POST", body });
    if (res.ok) alert("Published");
  };

  const publishManual = async () => {
    if (!manualCaption || !manualFile) return;
    const body = new FormData();
    body.append("caption", manualCaption);
    body.append("file", manualFile);
    selected.forEach((id) => body.append("page_ids", id));
    const res = await fetch("/api/v1/social/publish", { method: "POST", body });
    if (res.ok) alert("Published");
  };

  const onManualFileChange = (file: File | null) => {
    setManualFile(file);
    if (file) {
      setManualPreview(URL.createObjectURL(file));
    } else {
      setManualPreview(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E8F8]">
      <Header />
      <Wrapper className="py-10 max-w-2xl">
        <Tabs defaultValue="ai" className="w-full space-y-6">
          <TabsList className="w-full flex justify-center mb-4">
            <TabsTrigger value="ai">AI Generator</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="ai" className="space-y-4">
            <Textarea
              placeholder="Enter text"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files?.[0] || null)} />
            <Button onClick={generate}>Generate</Button>
            {content && (
              <div className="space-y-2">
                <p>{content}</p>
                {imageUrl && <img src={imageUrl} alt="generated" className="max-w-sm" />}
              </div>
            )}
          </TabsContent>
          <TabsContent value="manual" className="space-y-4">
            <Textarea
              placeholder="Caption"
              value={manualCaption}
              onChange={(e) => setManualCaption(e.target.value)}
            />
            <Input type="file" accept="image/*" onChange={(e) => onManualFileChange(e.target.files?.[0] || null)} />
            {manualPreview && <img src={manualPreview} alt="preview" className="max-w-sm" />}
          </TabsContent>
          {pages.length > 0 && (
            <select
              multiple
              value={selected}
              onChange={(e) =>
                setSelected(Array.from(e.target.selectedOptions).map((o) => o.value))
              }
              className="border p-2 w-full"
            >
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          {selected.length > 0 && (
            <div className="flex gap-4">
              <Button onClick={publishAI}>Publish AI Post</Button>
              <Button onClick={publishManual} variant="secondary">
                Publish Manual Post
              </Button>
            </div>
          )}
        </Tabs>
      </Wrapper>
    </div>
  );
}
