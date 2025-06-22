import { create } from 'zustand'

type UserPublicKey = string | undefined

type Store = {
  userPublicKey: UserPublicKey
  setUserPublicKey: (value: UserPublicKey) => void
}

const useKeyStore = create<Store>()((set) => ({
  userPublicKey: undefined,
  setUserPublicKey: (value: UserPublicKey) => set((state) => ({ userPublicKey: value })),
}))

export default useKeyStore