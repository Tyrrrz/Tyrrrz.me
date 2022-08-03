import fs from 'fs/promises';
import path from 'path';

export type SpeakingEngagement = {
  title: string;
  kind: 'Talk' | 'Workshop' | 'Podcast';
  event: string;
  date: string;
  language: string;
  eventUrl?: string;
  presentationUrl?: string;
  recordingUrl?: string;
};

export const loadSpeakingEngagements = async function* () {
  const dirPath = path.resolve(process.cwd(), 'data', 'speaking');
  const entries = await fs.opendir(dirPath);

  for await (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) {
      continue;
    }

    const filePath = path.join(dirPath, entry.name);
    const engagement: SpeakingEngagement = JSON.parse(await fs.readFile(filePath, 'utf8'));

    yield engagement;
  }
};
