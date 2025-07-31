// ✅ UPDATED FRONTEND
// - Adds image generation options (size, quality, format, etc.)
// - Keeps Facebook/LinkedIn publishing logic unchanged

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

const IMAGE_SIZES = [
  { value: "1024x1024", label: "1024 x 1024 (Square)" },
  { value: "1024x1536", label: "1024 x 1536 (Portrait)" },
  { value: "1536x1024", label: "1536 x 1024 (Landscape)" },
];
const IMAGE_QUALITIES = [
  { value: "standard", label: "Standard" },
  { value: "hd", label: "High Definition (HD)" },
  { value: "medium", label: "Medium" },
];
const IMAGE_FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
];
const BACKGROUND_OPTIONS = [
  { value: "opaque", label: "Opaque" },
  { value: "transparent", label: "Transparent" },
];
const MODERATION_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "strict", label: "Strict" },
  { value: "none", label: "None" },
];
const TYPE_OPTIONS = [
  { value: "flyer", label: "Flyer" },
  { value: "image", label: "General Image" },
];

export default function SocialPage() {
  const [text, setText] = useState("");
  const [caption, setCaption] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSettings, setImageSettings] = useState({
    size: "1024x1024",
    quality: "medium",
    format: "png",
    background: "opaque",
    moderation: "auto",
    type: "flyer",
  });
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [linkedinPages, setLinkedinPages] = useState<LinkedinPageInfo[]>([]);
  const [selectedLinkedin, setSelectedLinkedin] = useState<string[]>([]);

  const allowedPages = useSelector((state: RootState) => state.auth.pages);
  const allowedLinkedinPages = useSelector((state: RootState) => state.auth.linkedinPages);

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
        let fetched = (data.pages || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          accountId: p.account_id,
        }));
        if (allowedLinkedinPages.length > 0) {
          fetched = fetched.filter((p: any) => allowedLinkedinPages.includes(`${p.accountId}:${p.id}`));
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
    Object.entries(imageSettings).forEach(([key, value]) => {
      form.append(key, value);
    });
    try {
      const res = await fetch("/api/v1/social/generate", {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const data = await res.json();
        setCaption(data.content);
        setImageUrl(data.image_url);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "generated-flyer.png";
    a.click();
  };

  // ... keep publishManual, publishAI, regenerateImage, onManualFileChange unchanged

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
            <Textarea placeholder="Enter text" value={text} onChange={(e) => setText(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <ReactSelect options={IMAGE_SIZES} value={IMAGE_SIZES.find((o) => o.value === imageSettings.size)} onChange={(o) => setImageSettings((s) => ({ ...s, size: o?.value || s.size }))} />
              <ReactSelect options={IMAGE_QUALITIES} value={IMAGE_QUALITIES.find((o) => o.value === imageSettings.quality)} onChange={(o) => setImageSettings((s) => ({ ...s, quality: o?.value || s.quality }))} />
              <ReactSelect options={IMAGE_FORMATS} value={IMAGE_FORMATS.find((o) => o.value === imageSettings.format)} onChange={(o) => setImageSettings((s) => ({ ...s, format: o?.value || s.format }))} />
              <ReactSelect options={BACKGROUND_OPTIONS} value={BACKGROUND_OPTIONS.find((o) => o.value === imageSettings.background)} onChange={(o) => setImageSettings((s) => ({ ...s, background: o?.value || s.background }))} />
              <ReactSelect options={MODERATION_OPTIONS} value={MODERATION_OPTIONS.find((o) => o.value === imageSettings.moderation)} onChange={(o) => setImageSettings((s) => ({ ...s, moderation: o?.value || s.moderation }))} />
              <ReactSelect options={TYPE_OPTIONS} value={TYPE_OPTIONS.find((o) => o.value === imageSettings.type)} onChange={(o) => setImageSettings((s) => ({ ...s, type: o?.value || s.type }))} />
            </div>
            <Button onClick={generate}>Generate</Button>
            {caption && (
              <div className="space-y-2">
                <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} />
                {imageUrl && (
                  <div className="space-y-2">
                    <img src={imageUrl} alt="generated" className="max-w-sm" />
                    <Button variant="secondary" onClick={downloadImage}>Download</Button>
                    <Button onClick={regenerateImage} disabled={loading}>Regenerate Image</Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Manual, Social posting unchanged */}
        </Tabs>
      </Wrapper>
    </div>
  );
}
