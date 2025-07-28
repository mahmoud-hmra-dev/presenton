"use client";
import { useState, useEffect } from "react";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReactSelect from "react-select";
import { OverlayLoader } from "@/components/ui/overlay-loader";

interface PageInfo {
  id: string;
  name: string;
}

interface LinkedinPageInfo extends PageInfo {
  account_id: string;
}

const AdminPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [linkedinPages, setLinkedinPages] = useState<LinkedinPageInfo[]>([]);
  const [selectedLinkedin, setSelectedLinkedin] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<{
    username: string;
    pages: string[];
    linkedin_pages: string[];
  }[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [editPages, setEditPages] = useState<string[]>([]);
  const [editLinkedinPages, setEditLinkedinPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
  };

  useEffect(() => {
    const fetchPages = async () => {
      const res = await fetch("/api/v1/social/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      }
    };
    fetchPages();
    const fetchLinkedinPages = async () => {
      const res = await fetch("/api/v1/social/linkedin/pages");
      if (res.ok) {
        const data = await res.json();
        const fetched = (data.pages || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          account_id: p.account_id,
        }));
        setLinkedinPages(fetched);
      }
    };
    fetchLinkedinPages();
    fetchUsers();
  }, []);

  const createUser = async () => {
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        pages: selected,
        linkedin_pages: selectedLinkedin,
      }),
    });
    if (res.ok) {
      setMessage("User created");
      setUsername("");
      setPassword("");
      setSelected([]);
      setSelectedLinkedin([]);
      fetchUsers();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed");
    }
    setLoading(false);
  };

  const updateUser = async () => {
    if (!editing) return;
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: editing,
        password: editPassword || undefined,
        pages: editPages,
        linkedin_pages: editLinkedinPages,
      }),
    });
    if (res.ok) {
      setMessage("User updated");
      setEditing(null);
      setEditPassword("");
      setEditPages([]);
      setEditLinkedinPages([]);
      fetchUsers();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#E9E8F8]">
      <OverlayLoader show={loading} text="Loading..." />
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
              onChange={(opts) => setSelected(opts.map((o) => o.value as string))}
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
              options={linkedinPages.map((p) => ({ value: `${p.account_id}:${p.id}`, label: p.name }))}
              value={linkedinPages
                .filter((p) => selectedLinkedin.includes(`${p.account_id}:${p.id}`))
                .map((p) => ({ value: `${p.account_id}:${p.id}`, label: p.name }))}
              onChange={(opts) =>
                setSelectedLinkedin(opts.map((o) => o.value as string))
              }
            />
          </div>
        )}
        <Button onClick={createUser} disabled={loading}>Create User</Button>
        {message && <p>{message}</p>}
        <hr className="my-4" />
        <h2 className="text-xl font-medium">Users</h2>
        <div className="space-y-4">
          {users.map((u) => (
            <div key={u.username} className="border p-3 rounded">
              {editing === u.username ? (
                <div className="space-y-2">
                  <p className="font-semibold">{u.username}</p>
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
                  {pages.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium">Facebook</p>
                      <ReactSelect
                        isMulti
                        classNamePrefix="select"
                        options={pages.map((p) => ({ value: p.id, label: p.name }))}
                        value={pages
                          .filter((p) => editPages.includes(p.id))
                          .map((p) => ({ value: p.id, label: p.name }))}
                        onChange={(opts) =>
                          setEditPages(opts.map((o) => o.value as string))
                        }
                      />
                    </div>
                  )}
                  {linkedinPages.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium">LinkedIn</p>
                      <ReactSelect
                        isMulti
                        classNamePrefix="select"
                        options={linkedinPages.map((p) => ({ value: `${p.account_id}:${p.id}`, label: p.name }))}
                        value={linkedinPages
                          .filter((p) => editLinkedinPages.includes(`${p.account_id}:${p.id}`))
                          .map((p) => ({ value: `${p.account_id}:${p.id}`, label: p.name }))}
                        onChange={(opts) =>
                          setEditLinkedinPages(opts.map((o) => o.value as string))
                        }
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={updateUser} disabled={loading}>Save</Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditing(null);
                        setEditPassword("");
                        setEditPages([]);
                        setEditLinkedinPages([]);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{u.username}</p>
                    <p className="text-sm text-gray-600">
                      {(u.pages.join(", ") || "All pages") +
                        (u.linkedin_pages.length > 0
                          ? ` | ${u.linkedin_pages.join(", ")}`
                          : "")}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditing(u.username);
                      setEditPages(u.pages);
                      setEditLinkedinPages(u.linkedin_pages);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Wrapper>
    </div>
  );
};

export default AdminPage;
