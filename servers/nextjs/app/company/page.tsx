"use client";

import { useState, useEffect } from "react";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Quote = { id: number; text: string; service: string; lastUsed: string };

type PlanRow = {
  contentType?: string;
  service?: string;
  category?: string;
  quote?: string;
};

type Draft = {
  text: string;
  image: string;
};

type ScheduledPost = PlanRow &
  Draft & { day: number; status: "scheduled" | "paused" | "published" };

const companies = [
  { id: "acme", name: "Acme Corp" },
  { id: "globex", name: "Globex" },
];

export default function CompanyPlanningPage() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [timeframe, setTimeframe] = useState("");
  const [timeframeDialogOpen, setTimeframeDialogOpen] = useState(false);
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [generated, setGenerated] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedCompany) {
      setTimeframeDialogOpen(true);
    }
  }, [selectedCompany]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = Array.from(e.target.files || []);
    setFiles(uploaded);
    const contents = await Promise.all(
      uploaded.map((f) => f.text().catch(() => "")),
    );
    const combined = contents.join("\n");
    extractDataFromText(combined);
  };

const extractDataFromText = (text: string) => {
  const catSet = new Set<string>();
  const serviceSet = new Set<string>();
  const quotesArr: Quote[] = [];
  let quoteId = 1;

  text.split(/\r?\n/).forEach((line) => {
    const catMatch = line.match(/^Category:\s*(.+)/i);
    if (catMatch) catSet.add(catMatch[1].trim());

    const svcMatch = line.match(/^Service:\s*(.+)/i);
    if (svcMatch) serviceSet.add(svcMatch[1].trim());

    const quoteMatch = line.match(/^Quote:\s*(.+?)\s*-\s*(.+)/i);
    if (quoteMatch) {
      quotesArr.push({
        id: quoteId++,
        text: quoteMatch[1].trim(),
        service: quoteMatch[2].trim(),
        lastUsed: "",
      });
    }
  });

  setCategories(Array.from(catSet));
  setServices(Array.from(serviceSet));
  if (quotesArr.length) setQuotes(quotesArr);
};


  const confirmTimeframe = () => {
    const weeks = parseInt(timeframe, 10);
    const days = weeks === 4 ? 28 : weeks * 7;
    setRows(Array.from({ length: days }, () => ({})));
    setTimeframeDialogOpen(false);
  };

  const handleRowChange = (
    index: number,
    field: keyof PlanRow,
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const generateContentForRow = (row: PlanRow): Draft => ({
    text: `Draft ${row.contentType || ""} for ${row.service || ""} in ${
      row.category || ""
    }. Quote: ${
      quotes.find((q) => String(q.id) === row.quote)?.text || ""
    }`,
    image: "https://via.placeholder.com/300x200.png?text=Image",
  });

  const handleGenerate = () => {
    setDrafts(rows.map(generateContentForRow));
    setGenerated(true);
  };

  const regenerate = (index: number) => {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? generateContentForRow(rows[i]) : d)),
    );
  };

  const updateDraftText = (index: number, text: string) => {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, text } : d)));
  };

  const handleConfirmSchedule = () => {
    const scheduled = drafts.map((d, i) => ({
      ...rows[i],
      ...d,
      day: i + 1,
      status: "scheduled" as const,
    }));
    setScheduledPosts(scheduled);
    setQuotes((prev) =>
      prev.map((q) =>
        scheduled.some((p) => p.quote === String(q.id))
          ? { ...q, lastUsed: new Date().toISOString().split("T")[0] }
          : q,
      ),
    );
    setConfirmDialogOpen(false);
    setGenerated(false);
  };

  const togglePause = (index: number) => {
    setScheduledPosts((prev) =>
      prev.map((p, i) =>
        i === index
          ? { ...p, status: p.status === "paused" ? "scheduled" : "paused" }
          : p,
      ),
    );
  };

  const editScheduledText = (index: number, text: string) => {
    setScheduledPosts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, text } : p)),
    );
  };

  const publishAll = () => {
    setScheduledPosts((prev) => prev.map((p) => ({ ...p, status: "published" as const })));
  };

  const exportReport = () => {
    const report = scheduledPosts
      .filter((p) => p.status === "published")
      .map((p) => ({
        day: p.day,
        contentType: p.contentType,
        service: p.service,
        category: p.category,
        quote: p.quote,
        link: p.image,
      }));
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "monthly-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#E9E8F8]">
      <Header />
      <Wrapper className="py-10 space-y-6">
        <div className="bg-white p-6 rounded space-y-4">
          <h2 className="text-xl font-bold">Company Planning</h2>
          <Select onValueChange={setSelectedCompany} value={selectedCompany}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCompany && (
            <div className="space-y-4">
              <Input type="file" multiple onChange={handleFileUpload} />
            </div>
          )}
        </div>

        {rows.length > 0 && (
          <div className="bg-white p-6 rounded space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Content Type</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quote</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>Day {i + 1}</TableCell>
                    <TableCell>
                      <Select
                        value={row.contentType}
                        onValueChange={(v) => handleRowChange(i, "contentType", v)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="story">Story</SelectItem>
                          <SelectItem value="carousel">Carousel</SelectItem>
                          <SelectItem value="flyer">Flyer</SelectItem>
                          <SelectItem value="short">Post with short text</SelectItem>
                          <SelectItem value="normal">Normal Post</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.service}
                        onValueChange={(v) => handleRowChange(i, "service", v)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.category}
                        onValueChange={(v) => handleRowChange(i, "category", v)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.quote}
                        onValueChange={(v) => handleRowChange(i, "quote", v)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Quote" />
                        </SelectTrigger>
                        <SelectContent>
                          {quotes.map((q) => (
                            <SelectItem key={q.id} value={String(q.id)}>
                              {q.text}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={handleGenerate}>Generate</Button>
          </div>
        )}

        {generated && (
          <div className="bg-white p-6 rounded space-y-4">
            {drafts.map((draft, i) => (
              <div key={i} className="border rounded p-4 space-y-2">
                <p className="font-semibold">Day {i + 1}</p>
                <img
                  src={draft.image}
                  alt="generated"
                  className="w-60 h-40 object-cover"
                />
                <Textarea
                  value={draft.text}
                  onChange={(e) => updateDraftText(i, e.target.value)}
                />
                <Button variant="secondary" onClick={() => regenerate(i)}>
                  Regenerate
                </Button>
              </div>
            ))}
            <Button onClick={() => setConfirmDialogOpen(true)}>
              Confirm & Schedule
            </Button>
          </div>
        )}

        {scheduledPosts.length > 0 && (
          <div className="bg-white p-6 rounded space-y-4">
            <h3 className="text-lg font-semibold">Scheduled Posts</h3>
            {scheduledPosts.map((p, i) => (
              <div key={i} className="border rounded p-4 space-y-2">
                <p className="font-semibold">
                  Day {p.day} - {p.contentType}
                </p>
                <img
                  src={p.image}
                  alt="post"
                  className="w-60 h-40 object-cover"
                />
                {p.status !== "published" && (
                  <Textarea
                    value={p.text}
                    onChange={(e) => editScheduledText(i, e.target.value)}
                  />
                )}
                <p>Status: {p.status}</p>
                {p.status !== "published" && (
                  <Button variant="secondary" onClick={() => togglePause(i)}>
                    {p.status === "paused" ? "Resume" : "Pause"}
                  </Button>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <Button onClick={publishAll}>Publish All</Button>
              <Button variant="secondary" onClick={exportReport}>
                Export Monthly Report
              </Button>
            </div>
          </div>
        )}

        <Dialog open={timeframeDialogOpen} onOpenChange={setTimeframeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Timeframe</DialogTitle>
            </DialogHeader>
            <Select onValueChange={setTimeframe} value={timeframe}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 week</SelectItem>
                <SelectItem value="2">2 weeks</SelectItem>
                <SelectItem value="3">3 weeks</SelectItem>
                <SelectItem value="4">1 month</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button onClick={confirmTimeframe} disabled={!timeframe}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Posts?</DialogTitle>
            </DialogHeader>
            <p>Confirm to schedule generated posts.</p>
            <DialogFooter>
              <Button onClick={handleConfirmSchedule}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Wrapper>
    </div>
  );
}
