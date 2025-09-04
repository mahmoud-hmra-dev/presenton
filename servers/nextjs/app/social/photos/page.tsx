"use client";
import { useEffect, useState } from "react";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";

export default function PhotosPage() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch("/api/v1/social/images");
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    };
    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-[#E9E8F8]">
      <Header />
      <Wrapper className="py-10 max-w-5xl">
        <h2 className="text-xl font-bold mb-4">Saved Photos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <img key={i} src={img} alt="saved" className="rounded" />
          ))}
        </div>
      </Wrapper>
    </div>
  );
}

