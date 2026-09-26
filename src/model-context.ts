import type { GameIndex } from "./navigation";

interface ModelContextDocument extends Document {
  modelContext?: {
    registerTool: (tool: object) => unknown;
  };
}

export function registerGameTools(
  selectGame: (index: GameIndex) => void,
): void {
  const modelContext = (document as ModelContextDocument).modelContext;
  if (!modelContext?.registerTool) return;
  const tools = [
    ["open_find_mengki", "Buka Cari Mengki", 0],
    ["open_catch_banana", "Buka Tangkap Pisang", 1],
  ] as const;
  tools.forEach(([name, title, index]) => {
    try {
      Promise.resolve(
        modelContext.registerTool({
          name,
          title,
          description: `Buka permainan ${title} pada halaman ini.`,
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute(input: Record<string, unknown>) {
            if (input && Object.keys(input).length)
              throw new Error("Tidak menerima parameter");
            selectGame(index);
            return { game: index === 0 ? "Cari Mengki" : "Tangkap Pisang" };
          },
        }),
      ).catch(() => undefined);
    } catch {
      // Integrasi ini opsional dan tidak boleh mengganggu permainan.
    }
  });
}
