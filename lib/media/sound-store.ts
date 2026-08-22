"use client";

import { create } from "zustand";

type VideoSoundState = {
  isMuted: boolean;
  setMuted: (isMuted: boolean) => void;
};

// This is intentionally session-scoped rather than persisted. A browser may
// refuse audio autoplay after navigation, so restoring an unmuted preference
// from local storage would misrepresent the actual playback state on iOS.
export const useVideoSoundStore = create<VideoSoundState>((set) => ({
  isMuted: true,
  setMuted: (isMuted) => set({ isMuted })
}));
