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
import { OverlayLoader } from "@/components/ui/overlay-loader";

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
  const [linkedinPages, setLinkedinPages] = useState<PageInfo[]>([]);
  const [selectedLinkedin, setSelectedLinkedin] = useState<string[]>([]);

  const allowedPages = useSelector((state: RootState) => state.auth.pages);

  const [manualCaption, setManualCaption] = useState("");
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [manualPreview, setManualPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    const fetchLinkedinPages = async () => {
      const res = await fetch("/api/v1/social/linkedin/pages");
      if (res.ok) {
        const data = await res.json();
        setLinkedinPages(data.pages || []);
      }
    };
    fetchLinkedinPages();
  }, [allowedPages]);

  const generate = async () => {
    setLoading(true);
    const form = new FormData();
    if (text) form.append("text", text);
    try {
      const res = await fetch("/api/v1/social/generate", {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const data = await res.json();
        setCaption(data.content);
        setImageUrl(data.image_url);
        const saveBody = new FormData();
        saveBody.append("caption", data.content);
        saveBody.append("image_url", data.image_url);
        await fetch("/api/v1/social/posts/save", {
          method: "POST",
          body: saveBody,
        });
        let fetched = data.pages || [];
        if (allowedPages.length > 0) {
          fetched = fetched.filter((p: PageInfo) => allowedPages.includes(p.id));
        }
        setPages(fetched);
      }
    } finally {
      setLoading(false);
    }
  };

  const publishAI = async () => {
    if (!caption || !imageUrl) return;
    setLoading(true);
    try {
      if (selected.length > 0) {
        const body = new FormData();
        body.append("caption", caption);
        body.append("image_url", imageUrl);
        selected.forEach((id) => body.append("page_ids", id));
        await fetch("/api/v1/social/publish", { method: "POST", body });
      }
      if (selectedLinkedin.length > 0) {
        const body = new FormData();
        body.append("caption", caption);
        body.append("image_url", imageUrl);
        selectedLinkedin.forEach((id) => body.append("page_ids", id));
        await fetch("/api/v1/social/linkedin/publish", { method: "POST", body });
      }
      alert("Published");
    } finally {
      setLoading(false);
    }
  };

  const regenerateImage = async () => {
    if (!caption) return;
    const form = new FormData();
    form.append("text", caption);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/social/generate", {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.image_url);
      }
    } finally {
      setLoading(false);
    }
  };

  const publishManual = async () => {
    if (!manualCaption || !manualFile) return;
    setLoading(true);
    try {
      if (selected.length > 0) {
        const body = new FormData();
        body.append("caption", manualCaption);
        body.append("file", manualFile);
        selected.forEach((id) => body.append("page_ids", id));
        await fetch("/api/v1/social/publish", { method: "POST", body });
      }
      if (selectedLinkedin.length > 0) {
        const body = new FormData();
        body.append("caption", manualCaption);
        body.append("file", manualFile);
        selectedLinkedin.forEach((id) => body.append("page_ids", id));
        await fetch("/api/v1/social/linkedin/publish", { method: "POST", body });
      }
      alert("Published");
      const saveBody = new FormData();
      saveBody.append("caption", manualCaption);
      saveBody.append("file", manualFile);
      await fetch("/api/v1/social/posts/save", { method: "POST", body: saveBody });
    } finally {
      setLoading(false);
    }
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
      <OverlayLoader show={loading} text="Loading..." />
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
            <Button onClick={generate} disabled={loading}>Generate</Button>
            {caption && (
              <div className="space-y-2">
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                {imageUrl && (
                  <img src={imageUrl} alt="generated" className="max-w-sm" />
                )}
                <Button variant="secondary" onClick={regenerateImage} disabled={loading}>
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
          {linkedinPages.length > 0 && (
            <ReactSelect
              isMulti
              className="basic-multi-select"
              classNamePrefix="select"
              options={linkedinPages.map((p) => ({ value: p.id, label: p.name }))}
              value={linkedinPages
                .filter((p) => selectedLinkedin.includes(p.id))
                .map((p) => ({ value: p.id, label: p.name }))}
              onChange={(opts) =>
                setSelectedLinkedin(opts.map((o) => o.value as string))
              }
            />
          )}
          {selected.length + selectedLinkedin.length > 0 && (
            <div className="flex gap-4">
              <Button onClick={publishAI} disabled={loading}>Publish AI Post</Button>
              <Button onClick={publishManual} variant="secondary" disabled={loading}>
                Publish Manual Post
              </Button>
            </div>
          )}
        </Tabs>
      </Wrapper>
    </div>
  );
}
