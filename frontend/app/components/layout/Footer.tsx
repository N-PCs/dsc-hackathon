"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EXTERNAL_REGISTRATION_URL } from "@/data/mockData";

export const Footer: React.FC = () => {
  const router = useRouter();

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#222222] py-16 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/DSClogo.png" alt="Data Science Club Logo" className="h-10 w-auto object-contain" />
              <img src="/origin-logo.png" alt="ORIGIN Logo" className="h-16 w-auto object-contain" />
            </div>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed max-w-xs">
              The flagship 18-hour overnight hackathon organized by the
              Data Science Club at VIT Bhopal University.
            </p>
          </div>

          <div className="md:col-span-2">
            <span className="font-heading text-xs text-[#FF3B00] uppercase tracking-widest block mb-4 font-bold">
              EVENT
            </span>
            <div className="space-y-3">
              {[
                { label: "OVERVIEW", tab: "home" },
                { label: "SCHEDULE", tab: "schedule" },
                { label: "FAQ", tab: "faq" },
              ].map((link) => (
                <button
                  key={link.tab}
                  onClick={() => router.push(link.tab === "home" ? "/" : `/${link.tab}`)}
                  className="block font-heading text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <span className="font-heading text-xs text-[#FF3B00] uppercase tracking-widest block mb-4 font-bold">
              PARTICIPATE
            </span>
            <div className="space-y-3">
              {[
                { label: "REGISTER TEAM", tab: "register" },
                { label: "DIGITAL ID PASS", tab: "team" },
                { label: "SUBMIT PROJECT", tab: "submit" },
              ].map((link) => (
                <button
                  key={link.tab}
                  onClick={() => router.push(link.tab === "home" ? "/" : `/${link.tab}`)}
                  className="block font-heading text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-4">
            <span className="font-heading text-xs text-neutral-400 uppercase tracking-widest block mb-4 font-bold">
              READY TO BUILD?
            </span>
            <button
              onClick={() => window.open(EXTERNAL_REGISTRATION_URL, "_blank")}
              className="btn-primary text-xs mb-6"
            >
              REGISTER TEAM NOW &gt;
            </button>
            <div className="space-y-2 font-heading text-xs text-neutral-500 uppercase tracking-wider">
              <p>
                <button
                  onClick={() => router.push("/admin")}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  ORGANISER PORTAL ACCESS &gt;
                </button>
              </p>
              <p>
                <button
                  onClick={() => router.push("/jury")}
                  className="hover:text-[#FF3B00] cursor-pointer transition-colors"
                >
                  JURY EVALUATION PORTAL &gt;
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 font-heading text-xs text-neutral-500 uppercase tracking-wider">
          <span>© 2026 DATA SCIENCE CLUB, VIT BHOPAL UNIVERSITY</span>
          <span className="text-[#FF3B00]">18H CODE FREEZE PROTOCOL</span>
        </div>
      </div>
    </footer>
  );
};