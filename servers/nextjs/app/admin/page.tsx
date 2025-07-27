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
  const [users, setUsers] = useState<{ username: string; pages: string[] }[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [editPages, setEditPages] = useState<string[]>([]);

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
    fetchUsers();
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
      fetchUsers();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed");
    }
  };

  const updateUser = async () => {
    if (!editing) return;
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: editing, password: editPassword || undefined, pages: editPages }),
    });
    if (res.ok) {
      setMessage("User updated");
      setEditing(null);
      setEditPassword("");
      setEditPages([]);
      fetchUsers();
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
                  )}
                  <div className="flex gap-2">
                    <Button onClick={updateUser}>Save</Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditing(null);
                        setEditPassword("");
                        setEditPages([]);
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
                      {u.pages.join(", ") || "All pages"}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditing(u.username);
                      setEditPages(u.pages);
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
