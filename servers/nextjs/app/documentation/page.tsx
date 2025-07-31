"use client";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import React from "react";

const DocumentationPage = () => {
  return (
    <div className="min-h-screen bg-[#E9E8F8] font-inter">
      <Header />
      <Wrapper className="py-8 space-y-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Documentation</h1>

        {/* Features Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Features Overview</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <b>Flyer & Image Generation:</b> Instantly generate marketing flyers or images in multiple design styles using AI.
            </li>
            <li>
              <b>AI Content Generation:</b> Automatically write engaging captions and marketing content for posts and flyers.
            </li>
            <li>
              <b>Social Media Publishing:</b> Publish your generated content to Facebook and LinkedIn pages with one click.
            </li>
            <li>
              <b>Presentation Generation:</b> Create complete slide decks using AI, editable and exportable as PDF or PPTX.
            </li>
          </ul>
        </section>

        {/* How to generate flyer/image/content */}
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-2">How to Generate a Flyer or Image</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Go to the <b>Social</b> or <b>Flyer</b> page in your dashboard.
            </li>
            <li>
              Enter your flyer <b>title</b>, <b>topic</b>, or main points.
            </li>
            <li>
              Select a <b>design style</b> (Professional, Cartoon, Minimalist, Retro, Luxury, Handdrawn, Photorealistic, Flat).
              You’ll see a preview and description for each style.
            </li>
            <li>
              Pick a <b>dominant color</b> to match your branding.
            </li>
            <li>
              Choose <b>image size</b>, <b>quality</b>, <b>format</b>, and <b>background</b>.
            </li>
            <li>
              Click <b>Generate</b>. The AI will create the flyer content and design instantly.
            </li>
            <li>
              You can edit the generated text or regenerate the image as needed.
            </li>
            <li>
              Save, download, or publish the image directly to your connected pages.
            </li>
          </ol>
        </section>

        {/* Content Generation */}
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-2">How AI Content Generation Works</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Enter your organization, product, or campaign description.
            </li>
            <li>
              The AI generates a concise, structured marketing summary (100-150 words).
            </li>
            <li>
              The content is editable and optimized for clarity and persuasion.
            </li>
            <li>
              The summary is used to create your flyer or social post automatically.
            </li>
          </ul>
        </section>

        {/* Social Media Publishing */}
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-2">How to Publish on Social Media</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Connect your Facebook and LinkedIn pages in your settings.
            </li>
            <li>
              Generate your flyer or post as described above.
            </li>
            <li>
              Select the pages you want to publish to (multi-select supported).
            </li>
            <li>
              Click <b>Publish</b> — your image and caption will be posted directly to your pages.
            </li>
            <li>
              You can also upload your own image and use a custom caption for manual posts.
            </li>
            <li>
              All published posts are saved in your history for review and reuse.
            </li>
          </ol>
        </section>

        {/* Presentation Generation */}
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-2">How to Generate Presentations</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Go to the <b>Presentation</b> page.
            </li>
            <li>
              Enter a topic or title for your presentation.
            </li>
            <li>
              Karen Ai generates a complete, editable slide deck automatically.
            </li>
            <li>
              Edit slides as needed, then export as PDF or PPTX.
            </li>
          </ol>
        </section>

        {/* Quick Tips */}
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Quick Tips</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Try different styles and dominant colors to get the best visual for your brand.
            </li>
            <li>
              Use "High" text amount for content-rich flyers, or "Low" for minimal clean designs.
            </li>
            <li>
              All generated flyers, images, and posts are saved and can be reused or edited anytime.
            </li>
          </ul>
        </section>

        {/* Summary */}
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Summary</h2>
          <p>
            Karen Ai is your all-in-one platform for generating presentations, flyers, images, and social content with AI. 
            Enjoy instant results, flexible design options, and seamless publishing to all your channels.
          </p>
        </section>
      </Wrapper>
    </div>
  );
};

export default DocumentationPage;
