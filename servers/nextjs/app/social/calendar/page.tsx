"use client";
import { useState } from "react";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Post {
  caption: string;
  imageUrl: string | null;
  date: string;
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function SocialCalendarPage() {
  const [topic, setTopic] = useState("");
  const [posts, setPosts] = useState<Post[]>(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return { caption: "", imageUrl: null, date: d.toISOString() };
    });
  });
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateWeek = async () => {
    if (!topic) return;
    const form = new FormData();
    form.append("text", topic);
    const res = await fetch("/api/v1/social/generate/week", {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      const data = await res.json();
      setPosts((prev) =>
        prev.map((p, i) => ({
          ...p,
          caption: data.posts[i]?.caption || "",
          imageUrl: data.posts[i]?.image_url || null,
        })),
      );
      setGenerated(true);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    await fetch("/api/v1/social/posts/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        posts: posts.map((p) => ({
          caption: p.caption,
          image_url: p.imageUrl,
          scheduled_for: p.date,
        })),
      }),
    });
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#E9E8F8]">
      <Header />
      <Wrapper className="py-10 max-w-4xl space-y-6">
        <div className="bg-white p-6 rounded space-y-4">
          <h2 className="text-xl font-bold">Weekly Post Planner</h2>
          <Input
            placeholder="Topic for the week"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Button onClick={generateWeek} disabled={!topic}>
            Generate Week
          </Button>
        </div>
        {generated && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post, idx) => (
              <div key={idx} className="bg-white p-4 rounded space-y-2">
                <h3 className="font-semibold">{dayNames[idx]}</h3>
                <Textarea
                  value={post.caption}
                  onChange={(e) =>
                    setPosts((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, caption: e.target.value } : p,
                      ),
                    )
                  }
                  placeholder="Caption"
                />
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="post" className="rounded" />
                )}
                <Input
                  placeholder="Image URL"
                  value={post.imageUrl || ""}
                  onChange={(e) =>
                    setPosts((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, imageUrl: e.target.value } : p,
                      ),
                    )
                  }
                />
              </div>
            ))}
          </div>
        )}
        {generated && (
          <Button onClick={saveAll} disabled={saving}>
            Save Posts
          </Button>
        )}
      </Wrapper>
    </div>
  );
}
