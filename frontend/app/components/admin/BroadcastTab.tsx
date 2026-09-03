"use client";

import React, { useState } from "react";
import { Radio, CheckCircle, Send, Trash2 } from "lucide-react";
import { Announcement } from "@/types";

interface BroadcastTabProps {
  announcements: Announcement[];
  onSendAnnouncement: (
    title: string,
    message: string,
    category: "urgent" | "schedule" | "food" | "mentorship" | "general"
  ) => void;
  onDeleteAnnouncement?: (announcementId: string) => void;
}

export const BroadcastTab: React.FC<BroadcastTabProps> = ({
  announcements,
  onSendAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annCategory, setAnnCategory] = useState<"urgent" | "schedule" | "food" | "mentorship" | "general">("general");
  const [annSuccess, setAnnSuccess] = useState(false);

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    onSendAnnouncement(annTitle, annMessage, annCategory);
    setAnnTitle("");
    setAnnMessage("");
    setAnnSuccess(true);
    setTimeout(() => setAnnSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-6 bg-black border border-neutral-800 p-6 sm:p-8 space-y-5">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <Radio className="w-5 h-5 text-orange-500" />
            <span>Send Real-Time Broadcast</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-1 font-mono">Dispatches immediately to the live ticker banner across all participant screens.</p>
        </div>

        {annSuccess && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Broadcast message dispatched live!</span>
          </div>
        )}

        <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Alert Category</label>
            <select
              value={annCategory}
              onChange={(e) => setAnnCategory(e.target.value as any)}
              className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:outline-none focus:border-orange-500 font-mono"
            >
              <option value="urgent">🚨 Urgent / Crucial Milestone</option>
              <option value="schedule">⏰ Schedule & Deadline Alert</option>
              <option value="food">🍕 Midnight Meals & Refreshments</option>
              <option value="mentorship">💡 Mentorship & Jury Hours</option>
              <option value="general">📢 General Announcement</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Headline</label>
            <input
              type="text"
              required
              placeholder="e.g. Code Freeze in 60 Minutes!"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Broadcast Details</label>
            <textarea
              rows={3}
              required
              placeholder="All teams must commit repository branches and finalize demo URLs..."
              value={annMessage}
              onChange={(e) => setAnnMessage(e.target.value)}
              className="w-full bg-black border border-neutral-800 p-2.5 text-white resize-none focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>

          <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold font-mono text-xs uppercase tracking-wider border border-orange-500 flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Send className="w-4 h-4" />
            <span>Publish Broadcast Alert</span>
          </button>
        </form>
      </div>

      <div className="lg:col-span-6 space-y-3">
        <h4 className="text-sm font-bold text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Live Announcement Feed
        </h4>
        {announcements.length === 0 ? (
          <div className="p-6 bg-black border border-neutral-800 text-center text-xs font-mono text-neutral-500">
            No active announcements published.
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="p-4 bg-black border border-neutral-800 space-y-1.5 relative group">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white font-mono">{ann.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-neutral-500">{ann.timestamp}</span>
                  {onDeleteAnnouncement && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete announcement "${ann.title}"?`)) {
                          onDeleteAnnouncement(ann.id);
                        }
                      }}
                      className="text-neutral-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{ann.message}</p>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                <span className="text-orange-400">Sent by: {ann.sender}</span>
                <span className="text-neutral-600 uppercase">Category: {ann.category}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};