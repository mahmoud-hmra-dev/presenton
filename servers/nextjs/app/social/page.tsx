"use client";
import { useEffect, useState } from "react";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ReactSelect from "react-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface PageInfo {
  id: string;
  name: string;
}

export default function SocialPage() {
  const [text, setText] = useState("");
  const [caption, setCaption] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const allowedPages = useSelector((state: RootState) => state.auth.pages);

  const [manualCaption, setManualCaption] = useState("");
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [manualPreview, setManualPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      const res = await fetch("/api/v1/social/pages");
      if (res.ok) {
        const data = await res.json();
        let fetched = data.pages || [];
        if (allowedPages.length > 0) {
          fetched = fetched.filter((p: PageInfo) => allowedPages.includes(p.id));
        }
        setPages(fetched);
      }
    };
    fetchPages();
  }, [allowedPages]);

  const generate = async () => {
    const form = new FormData();
    if (text) form.append("text", text);
    const res = await fetch("/api/v1/social/generate", {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      const data = await res.json();
      setCaption(data.content);
      setImageUrl(data.image_url);
      let fetched = data.pages || [];
      if (allowedPages.length > 0) {
        fetched = fetched.filter((p: PageInfo) => allowedPages.includes(p.id));
      }
      setPages(fetched);
    }
  };

  const publishAI = async () => {
    if (!caption || !imageUrl) return;
    const body = new FormData();
    body.append("caption", caption);
    body.append("image_url", imageUrl);
    selected.forEach((id) => body.append("page_ids", id));
    const res = await fetch("/api/v1/social/publish", { method: "POST", body });
    if (res.ok) alert("Published");
  };

  const regenerateImage = async () => {
    if (!caption) return;
    const form = new FormData();
    form.append("text", caption);
    const res = await fetch("/api/v1/social/generate", {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      const data = await res.json();
      setImageUrl(data.image_url);
    }
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
            <Button onClick={generate}>Generate</Button>
            {caption && (
              <div className="space-y-2">
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                {imageUrl && (
                  <img src={imageUrl} alt="generated" className="max-w-sm" />
                )}
                <Button variant="secondary" onClick={regenerateImage}>
                  Regenerate Image
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="manual" className="space-y-4">
            <Textarea
              placeholder="Caption"
              value={manualCaption}
              onChange={(e) => setManualCaption(e.target.value)}
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => onManualFileChange(e.target.files?.[0] || null)}
            />
            {manualPreview && (
              <img src={manualPreview} alt="preview" className="max-w-sm" />
            )}
          </TabsContent>
          {pages.length > 0 && (
            <ReactSelect
              isMulti
              className="basic-multi-select"
              classNamePrefix="select"
              options={pages.map((p) => ({ value: p.id, label: p.name }))}
              value={pages
                .filter((p) => selected.includes(p.id))
                .map((p) => ({ value: p.id, label: p.name }))}
              onChange={(options) =>
                setSelected(options.map((o) => o.value as string))
              }
            />
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
