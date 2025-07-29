"use client";
import { useState } from "react";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import ReactSelect from "react-select";

// Flyer types with tooltips and descriptions
const flyerTypes = [
  {
    value: "educational",
    label: "📘 Educational",
    description: "Cartoon-style flyer with 5 colorful sections. Great for tutorials or guides.",
  },
  {
    value: "healthcare",
    label: "🏥 Healthcare",
    description: "Modern infographic with medical tips, ideal for clinics or awareness campaigns.",
  },
  {
    value: "company",
    label: "💼 Company Profile",
    description: "Professional flyer presenting company services and brand.",
  },
  {
    value: "steps",
    label: "🎯 Step-by-Step Guide",
    description: "5-step visual process flyer, ideal for tutorials or how-tos.",
  },
  {
    value: "stats",
    label: "📊 Statistics",
    description: "Flyer showing key metrics using numbers and icons. Great for dashboards.",
  },
  {
    value: "kids",
    label: "🧒 Kids Learning",
    description: "Fun, colorful educational flyer for children with friendly cartoon icons.",
  },
];

// Custom tooltip-enabled option for ReactSelect
const CustomOption = (props: any) => {
  const { data, innerRef, innerProps } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      title={data.description}
      className="p-2 hover:bg-gray-100 cursor-pointer"
    >
      {data.label}
    </div>
  );
};

export default function FlyerPage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [contact, setContact] = useState("");
  const [design, setDesign] = useState("cartoon");
  const [flyerType, setFlyerType] = useState("educational");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedType = flyerTypes.find((f) => f.value === flyerType);

  const buildPrompt = () => {
    const commonHeader = `Vertical A4 flyer in high-resolution, clear and print-ready layout.\nTitle: ${title}\nSubtitle: ${subtitle}`;
    const contactBlock = `Bottom section includes contact details: ${contact}`;

    const types: Record<string, string> = {
      educational: `
${commonHeader}
Colorful cartoon-style educational flyer with a hand-drawn title in a yellow thought bubble, subtitle below, and 5 numbered color-coded sections.
Each section has a bold number, short title, 1–3 sentence paragraph, and a cartoon-style icon. Use pastel sky-blue background, bold black outlines (2–4px), vector flat shading, and rounded sans-serif fonts.
Accent colors: coral, mint, yellow, red, navy.
${contactBlock}
`,
      healthcare: `
${commonHeader}
Modern healthcare infographic flyer with 5 clean sections for facts or tips. Use icons like doctor, shield, heart, pill, thermometer.
Colors: white background, mint, light blue, and peach accents. Fonts: clean sans-serif. Icons outlined.
${contactBlock}
`,
      company: `
${commonHeader}
Corporate-style flyer presenting a company or services. Top banner for title, followed by 4 neatly arranged sections with icons and descriptions.
Color palette: white background with blue, gold, and gray. Flat clean layout. Footer with logo, website, and QR code.
${contactBlock}
`,
      steps: `
${commonHeader}
Infographic flyer displaying a 5-step process with arrows connecting numbered blocks.
Each block has a short bold title and 2-line explanation. Colors: orange, green, blue, red, purple. End with a call-to-action.
${contactBlock}
`,
      stats: `
${commonHeader}
Data-driven flyer showing key statistics in 5 visual blocks. Each has a large bold number, short explanation, and icon (e.g. users, growth, performance).
Dark navy background with bright accents: yellow, teal, coral. Clear grid layout.
${contactBlock}
`,
      kids: `
${commonHeader}
Fun cartoon-style educational flyer for children. Use colorful blocks, bold rounded fonts, and playful icons like books, stars, rockets, faces.
Sky blue background with bold outlines and friendly tone. Suitable for schools and young audiences.
${contactBlock}
`,
    };

    return types[flyerType] || types["educational"];
  };

  const generate = async () => {
    setLoading(true);
    const prompt = buildPrompt();
    const form = new FormData();
    form.append("text", prompt);

    try {
      const res = await fetch("/api/v1/social/generate", {
        method: "POST",
        body: form,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.image_url);

        await fetch("/api/v1/social/flyers/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            title,
            topic: subtitle,
            design,
            flyer_type: flyerType,
            image_url: data.image_url,
          }),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E8F8]">
      <OverlayLoader show={loading} text="Loading..." />
      <Header />
      <Wrapper className="py-10 max-w-3xl space-y-4">
        <div className="space-y-4 bg-white rounded p-4">
          <label className="font-medium">Select Flyer Type</label>
          <ReactSelect
            classNamePrefix="select"
            options={flyerTypes}
            value={selectedType}
            onChange={(opt) => setFlyerType(opt!.value)}
            components={{ Option: CustomOption }}
          />
          <p className="text-sm text-gray-500 mt-1">{selectedType?.description}</p>

          <Input
            placeholder="Flyer Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Subtitle / Theme"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
          <Textarea
            placeholder="Contact Info (email, website, etc.)"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />

          <Button onClick={generate} disabled={loading}>
            Generate Flyer
          </Button>

          {imageUrl && (
            <div className="flex flex-col items-center pt-4 space-y-4">
              <img
                src={imageUrl}
                alt="flyer"
                className="max-w-sm w-full rounded shadow"
              />
              <Button
                variant="secondary"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = imageUrl;
                  link.download = `${title || "flyer"}.png`;
                  link.click();
                }}
              >
                Download Flyer
              </Button>
            </div>
          )}
        </div>
      </Wrapper>
    </div>
  );
}
