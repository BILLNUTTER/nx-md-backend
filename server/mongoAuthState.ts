import { proto } from "@whiskeysockets/baileys";
import { initAuthCreds, BufferJSON } from "@whiskeysockets/baileys";
import Session from "./models/Session";

export async function useMongoDBAuthState(userId: string) {
  const writeData = async (id: string, data: any) => {
    const serialized = JSON.stringify(data, BufferJSON.replacer);
    await Session.findOneAndUpdate(
      { userId, sessionId: id },
      { userId, sessionId: id, data: serialized },
      { upsert: true }
    );
  };

  const readData = async (id: string) => {
    try {
      const doc = await Session.findOne({ userId, sessionId: id });
      if (!doc) return null;
      return JSON.parse(doc.data, BufferJSON.reviver);
    } catch {
      return null;
    }
  };

  const removeData = async (id: string) => {
    await Session.deleteOne({ userId, sessionId: id });
  };

  const creds = (await readData("creds")) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: Record<string, any> = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data: Record<string, Record<string, any>>) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const sessionId = `${category}-${id}`;
              tasks.push(
                value
                  ? writeData(sessionId, value)
                  : removeData(sessionId)
              );
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => writeData("creds", creds),
    clearAll: async () => {
      await Session.deleteMany({ userId });
    },
  };
}
