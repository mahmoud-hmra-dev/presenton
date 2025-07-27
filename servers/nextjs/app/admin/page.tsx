"use client";
import { useState, useEffect } from "react";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReactSelect from "react-select";

interface PageInfo {
  id: string;
  name: string;
}

const AdminPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");

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

  const createUser = async () => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, pages: selected }),
    });
    if (res.ok) {
      setMessage("User created");
      setUsername("");
      setPassword("");
      setSelected([]);
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E8F8]">
      <Header />
      <Wrapper className="py-10 max-w-xl space-y-4">
        <h2 className="text-xl font-medium">Create User</h2>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {pages.length > 0 && (
          <ReactSelect
            isMulti
            className="basic-multi-select"
            classNamePrefix="select"
            options={pages.map((p) => ({ value: p.id, label: p.name }))}
            value={pages
              .filter((p) => selected.includes(p.id))
              .map((p) => ({ value: p.id, label: p.name }))}
            onChange={(opts) => setSelected(opts.map((o) => o.value as string))}
          />
        )}
        <Button onClick={createUser}>Create User</Button>
        {message && <p>{message}</p>}
      </Wrapper>
    </div>
  );
};

export default AdminPage;
