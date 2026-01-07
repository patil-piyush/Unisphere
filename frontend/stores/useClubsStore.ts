// stores/useClubsStore.ts
import { create } from "zustand"

type Club = {
  id: string
  name: string
  description: string
  image: string
  members: number
  events: number
  category: string
  founded?: string
  president?: { name: string; avatar: string }
}

type ClubsState = {
  clubs: Club[]
  setClubs: (clubs: Club[]) => void
}

export const useClubsStore = create<ClubsState>((set) => ({
  clubs: [],
  setClubs: (clubs) => set({ clubs }),
}))
