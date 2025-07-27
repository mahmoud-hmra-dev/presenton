"use client";
import { useState } from "react";

interface PageInfo { id: string; name: string }

export default function SocialPage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const generate = async () => {
    const form = new FormData();
    if (text) form.append("text", text);
    if (file) form.append("file", file);
    const res = await fetch("/api/v1/social/generate", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      setContent(data.content);
      setImageUrl(data.image_url);
      setPages(data.pages || []);
    }
  };

  const publish = async () => {
    if (!content || !imageUrl) return;
    const res = await fetch("/api/v1/social/publish", {
      method: "POST",
      body: new URLSearchParams({ caption: content, image_url: imageUrl, page_ids: selected.join() }),
    });
    if (res.ok) alert("Published");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Social Post Generator</h1>
      <textarea className="w-full border p-2" placeholder="Enter text" value={text} onChange={e => setText(e.target.value)} />
      <input type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button className="bg-blue-600 text-white px-4 py-2" onClick={generate}>Generate</button>
      {content && (
        <div className="space-y-2">
          <p>{content}</p>
          {imageUrl && <img src={imageUrl} alt="generated" className="max-w-sm" />}
          {pages.length > 0 && (
            <select multiple value={selected} onChange={e => setSelected(Array.from(e.target.selectedOptions).map(o => o.value))} className="border p-2 w-full">
              {pages.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          {pages.length > 0 && <button className="bg-green-600 text-white px-4 py-2" onClick={publish}>Publish</button>}
        </div>
      )}
    </div>
  );
}
