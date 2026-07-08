import { createMMKV } from "react-native-mmkv";
import { StateStorage } from "zustand/middleware";

export const mmkvInstance = createMMKV();

export const mmkvStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    mmkvInstance.set(name, value);
  },
  getItem: (name: string) => {
    const value = mmkvInstance.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    mmkvInstance.remove(name);
  },
};


