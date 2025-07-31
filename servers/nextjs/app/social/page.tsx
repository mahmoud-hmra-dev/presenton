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

interface LinkedinPageInfo extends PageInfo {
  accountId: string;
}

export default function SocialPage() {
  const [text, setText] = useState("");
  const [caption, setCaption] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [linkedinPages, setLinkedinPages] = useState<LinkedinPageInfo[]>([]);
  const [selectedLinkedin, setSelectedLinkedin] = useState<string[]>([]);

  const allowedPages = useSelector((state: RootState) => state.auth.pages);
  const allowedLinkedinPages = useSelector(
    (state: RootState) => state.auth.linkedinPages,
  );

  const [manualCaption, setManualCaption] = useState("");
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [manualPreview, setManualPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState("flyer");
  const [size, setSize] = useState("1024x1024");
  const [quality, setQuality] = useState("medium");
  const [outputFormat, setOutputFormat] = useState("png");
  const [background, setBackground] = useState("opaque");
  const [moderation, setModeration] = useState("auto");
  const [textAmount, setTextAmount] = useState("medium");
  const [style, setStyle] = useState("professional");

  useEffect(() => {
    const fetchPages = async () => {
      const res = await fetch("/api/v1/social/pages");
      if (res.ok) {
        const data = await res.json();
        let fetched = data.pages || [];
        if (allowedPages.length > 0) {
          fetched = fetched.filter((p: PageInfo) =>
            allowedPages.includes(p.id),
          );
        }
        setPages(fetched);
      }
    };
    fetchPages();
    const fetchLinkedinPages = async () => {
      const res = await fetch("/api/v1/social/linkedin/pages");
      if (res.ok) {
        const data = await res.json();
        let fetched = (data.pages || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          accountId: p.account_id,
        }));
        if (allowedLinkedinPages.length > 0) {
          fetched = fetched.filter((p: any) =>
            allowedLinkedinPages.includes(`${p.accountId}:${p.id}`),
          );
        }
        setLinkedinPages(fetched);
      }
    };
    fetchLinkedinPages();
  }, [allowedPages, allowedLinkedinPages]);

  const generate = async () => {
    setLoading(true);
    const form = new FormData();
    if (text) form.append("text", text);
    form.append("mode", mode);
    form.append("size", size);
    form.append("quality", quality);
    form.append("output_format", outputFormat);
    form.append("background", background);
    form.append("moderation", moderation);
    form.append("text_amount", textAmount);
    form.append("style", style);
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
          fetched = fetched.filter((p: PageInfo) =>
            allowedPages.includes(p.id),
          );
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
        await fetch("/api/v1/social/linkedin/publish", {
          method: "POST",
          body,
        });
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
    form.append("mode", mode);
    form.append("size", size);
    form.append("quality", quality);
    form.append("output_format", outputFormat);
    form.append("background", background);
    form.append("moderation", moderation);
    form.append("text_amount", textAmount);
    form.append("style", style);
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
        await fetch("/api/v1/social/linkedin/publish", {
          method: "POST",
          body,
        });
      }
      alert("Published");
      const saveBody = new FormData();
      saveBody.append("caption", manualCaption);
      saveBody.append("file", manualFile);
      await fetch("/api/v1/social/posts/save", {
        method: "POST",
        body: saveBody,
      });
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">Type</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="flyer">Flyer</option>
                  <option value="image">Image</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="1024x1024">1024x1024</option>
                  <option value="1792x1024">1792x1024</option>
                  <option value="1024x1792">1024x1792</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="standard">standard</option>
                  <option value="hd">hd</option>
                  <option value="medium">medium</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="png">png</option>
                  <option value="jpeg">jpeg</option>
                  <option value="webp">webp</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Background</label>
                <select
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="opaque">opaque</option>
                  <option value="transparent">transparent</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Moderation</label>
                <select
                  value={moderation}
                  onChange={(e) => setModeration(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="auto">auto</option>
                  <option value="strict">strict</option>
                  <option value="soft">soft</option>
                  <option value="none">none</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm">Text Amount</label>
                <select
                  value={textAmount}
                  onChange={(e) => setTextAmount(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="professional">Professional</option>
                  <option value="cartoon">Cartoon</option>
                </select>
              </div>
            </div>
            <Button onClick={generate} disabled={loading}>
              Generate
            </Button>
            {caption && (
              <div className="space-y-2">
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                {imageUrl && (
                  <div className="space-y-2">
                    <img src={imageUrl} alt="generated" className="max-w-sm" />
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = imageUrl;
                          a.download = `image.${outputFormat}`;
                          a.click();
                        }}
                      >
                        Download Image
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={regenerateImage}
                        disabled={loading}
                      >
                        Regenerate Image
                      </Button>
                    </div>
                  </div>
                )}
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
            <div className="space-y-2">
              <p className="font-medium">Facebook</p>
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
            </div>
          )}
          {linkedinPages.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">LinkedIn</p>
              <ReactSelect
                isMulti
                className="basic-multi-select"
                classNamePrefix="select"
                options={linkedinPages.map((p) => ({
                  value: `${p.accountId}:${p.id}`,
                  label: p.name,
                }))}
                value={linkedinPages
                  .filter((p) =>
                    selectedLinkedin.includes(`${p.accountId}:${p.id}`),
                  )
                  .map((p) => ({
                    value: `${p.accountId}:${p.id}`,
                    label: p.name,
                  }))}
                onChange={(opts) =>
                  setSelectedLinkedin(opts.map((o) => o.value as string))
                }
              />
            </div>
          )}
          {selected.length + selectedLinkedin.length > 0 && (
            <div className="flex gap-4">
              <Button onClick={publishAI} disabled={loading}>
                Publish AI Post
              </Button>
              <Button
                onClick={publishManual}
                variant="secondary"
                disabled={loading}
              >
                Publish Manual Post
              </Button>
            </div>
          )}
        </Tabs>
      </Wrapper>
    </div>
  );
}
