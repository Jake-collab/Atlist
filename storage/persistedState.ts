import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveState<T>(key: string, value: T): Promise<void> {
  try {
    const raw = JSON.stringify(value);
    await AsyncStorage.setItem(key, raw);
  } catch (e) {
    // Swallow errors to avoid crashing UI; could add logging later.
  }
}

export async function loadState<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    return null;
  }
}

export async function clearState(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    // ignore
  }
}
