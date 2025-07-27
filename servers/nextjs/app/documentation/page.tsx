"use client";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import React from "react";

const DocumentationPage = () => {
  return (
    <div className="min-h-screen bg-[#E9E8F8] font-inter">
      <Header />
      <Wrapper className="py-8 space-y-6">
        <h1 className="text-3xl font-bold mb-4">Documentation</h1>
        <p className="mb-4">
          This page explains the recent changes and how to use the main features
          of the website.
        </p>
        <h2 className="text-2xl font-semibold mb-2">Recent Updates</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            The logo has been replaced with the <strong>Karen Ai</strong> label.
          </li>
          <li>A documentation page is now linked in the navigation bar.</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-6 mb-2">Services Overview</h2>
        <h3 className="text-xl font-semibold">Presentation</h3>
        <p className="mb-4">
          Generate slide decks with AI. Provide a topic and let Karen Ai create a
          presentation that you can edit and download as PDF or PPTX.
        </p>
        <h3 className="text-xl font-semibold">Social</h3>
        <p className="mb-4">
          Craft social media posts with captions and images. Connect your pages,
          generate content, and publish directly.
        </p>
        <h3 className="text-xl font-semibold">Flyer</h3>
        <p>
          Design infographic flyers in several styles. Enter a title, topic, and
          steps, then generate a shareable image.
        </p>
      </Wrapper>
    </div>
  );
};

export default DocumentationPage;
