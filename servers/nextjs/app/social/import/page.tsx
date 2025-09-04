"use client";
import { useState, useEffect } from "react";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactSelect from "react-select";
import * as XLSX from "xlsx";

interface Row {
  content: string;
  textAmount: string;
  style: string;
  dominantColor: string;
  type: string;
  size: string;
  publishDateTime: string;
  imageUrl?: string;
  selectedPages: string[];
}

export default function ImportPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [linkedinPages, setLinkedinPages] = useState<any[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      const res = await fetch("/api/v1/social/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      }
    };
    const fetchLinkedin = async () => {
      const res = await fetch("/api/v1/social/linkedin/pages");
      if (res.ok) {
        const data = await res.json();
        setLinkedinPages(data.pages || []);
      }
    };
    fetchPages();
    fetchLinkedin();
  }, []);

  const pageOptions = [
    ...pages.map((p) => ({ value: `facebook:${p.id}`, label: `Facebook: ${p.name}` })),
    ...linkedinPages.map((p) => ({ value: `linkedin:${p.id}`, label: `LinkedIn: ${p.name}` })),
  ];

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json: any[] = XLSX.utils.sheet_to_json(sheet, {
      header: [
        "content",
        "textAmount",
        "style",
        "dominantColor",
        "type",
        "size",
        "publishDateTime",
      ],
      range: 1,
      defval: "",
    });
    setRows(
      json.map((r) => ({
        ...(r as Omit<Row, "selectedPages">),
        selectedPages: [],
      })) as Row[],
    );
  };

  const generateImage = async (idx: number) => {
    const row = rows[idx];
    const form = new FormData();
    form.append("text", row.content);
    form.append("mode", row.type || "image");
    form.append("size", row.size || "1024x1024");
    form.append("text_amount", row.textAmount || "medium");
    form.append("style", row.style || "professional");
    form.append("dominant_color", row.dominantColor || "blue");
    const res = await fetch("/api/v1/social/generate", {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      const data = await res.json();
      const saveBody = new FormData();
      saveBody.append("caption", row.content);
      saveBody.append("image_url", data.image_url);
      await fetch("/api/v1/social/posts/save", { method: "POST", body: saveBody });
      setRows((prev) =>
        prev.map((r, i) => (i === idx ? { ...r, imageUrl: data.image_url } : r)),
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E8F8]">
      <Header />
      <Wrapper className="py-10 space-y-6 max-w-5xl">
        <div className="bg-white p-6 rounded space-y-4">
          <h2 className="text-xl font-bold">Import Posts</h2>
          <Input type="file" accept=".xlsx,.xls" onChange={handleFile} />
        </div>
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Content</th>
                  <th className="p-2">Text Amount</th>
                  <th className="p-2">Style</th>
                  <th className="p-2">Dominant Color</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Size</th>
                  <th className="p-2">Publish Date/Time</th>
                  <th className="p-2">Pages</th>
                  <th className="p-2">Image</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{row.content}</td>
                    <td className="p-2">{row.textAmount}</td>
                    <td className="p-2">{row.style}</td>
                    <td className="p-2">{row.dominantColor}</td>
                    <td className="p-2">{row.type}</td>
                    <td className="p-2">{row.size}</td>
                    <td className="p-2">{row.publishDateTime}</td>
                    <td className="p-2 min-w-[200px]">
                      <ReactSelect
                        isMulti
                        className="basic-multi-select"
                        classNamePrefix="select"
                        options={pageOptions}
                        value={pageOptions.filter((opt) =>
                          row.selectedPages.includes(opt.value),
                        )}
                        onChange={(opts) =>
                          setRows((prev) =>
                            prev.map((r, idx) =>
                              idx === i
                                ? {
                                    ...r,
                                    selectedPages: opts.map((o) => o.value as string),
                                  }
                                : r,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="p-2 space-y-2">
                      {row.imageUrl ? (
                        <div className="space-y-2">
                          <img
                            src={row.imageUrl}
                            alt="generated"
                            className="w-32 h-32 object-cover rounded"
                          />
                          <div className="flex gap-2">
                            <a
                              href={row.imageUrl}
                              download
                              className="text-sm underline"
                            >
                              Download Image
                            </a>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateImage(i)}
                            >
                              Regenerate
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-32 h-32 bg-gray-100 flex items-center justify-center text-xs text-gray-500 rounded">
                            No image
                          </div>
                          <Button size="sm" onClick={() => generateImage(i)}>
                            Generate Image
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Wrapper>
    </div>
  );
}

