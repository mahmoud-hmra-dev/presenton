"use client";

import { useState } from "react";
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

// Placeholder data for demo purposes. In a full implementation,
// these would be fetched from the backend after importing documents
// and processing them for RAG, categories, services, and quotes.
const companies = [
  { id: "acme", name: "Acme Corp" },
  { id: "globex", name: "Globex" },
];

const categories = ["Marketing", "Sales", "Operations"];
const services = ["Consulting", "Design", "Development"];
const quotes = [
  { id: 1, text: "Excellence is a habit.", service: "Consulting", lastUsed: "" },
  {
    id: 2,
    text: "Design is intelligence made visible.",
    service: "Design",
    lastUsed: "2024-01-01 on Facebook",
  },
];

type PlanRow = {
  contentType?: string;
  service?: string;
  category?: string;
  quote?: string;
};

export default function CompanyPlanningPage() {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [timeframe, setTimeframe] = useState<string>("");
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [generated, setGenerated] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleTimeframe = (value: string) => {
    setTimeframe(value);
    const weeks = parseInt(value, 10);
    const days = weeks === 4 ? 28 : weeks * 7;
    setRows(Array.from({ length: days }, () => ({})));
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

  const handleGenerate = () => {
    // TODO: generate draft content based on plan
    setGenerated(true);
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
              {/* TODO: Use uploaded files to build RAG knowledge base */}
              <Select onValueChange={handleTimeframe} value={timeframe}>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 week</SelectItem>
                  <SelectItem value="2">2 weeks</SelectItem>
                  <SelectItem value="3">3 weeks</SelectItem>
                  <SelectItem value="4">1 month</SelectItem>
                </SelectContent>
              </Select>
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
                        onValueChange={(v) =>
                          handleRowChange(i, "contentType", v)
                        }
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
                        onValueChange={(v) =>
                          handleRowChange(i, "category", v)
                        }
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
          <div className="bg-white p-6 rounded space-y-2">
            <p className="text-sm text-muted-foreground">
              Draft content will appear here for review, editing, and scheduling.
            </p>
            {/* TODO: Implement content generation, editing, and scheduling */}
          </div>
        )}
      </Wrapper>
    </div>
  );
}

