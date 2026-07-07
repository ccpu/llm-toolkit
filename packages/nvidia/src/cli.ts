#!/usr/bin/env tsx
import process from 'node:process';

interface NvidiaResponse {
  data: {
    id: string;
  }[];
}

const jsonSpacing = 2;

function prettify(id: string) {
  const [owner, model] = id.split('/');

  return `${owner} ${model}`
    .replace(/[-_]/gu, ' ')
    .replace(/\b\w/gu, (c) => c.toUpperCase());
}

function isVision(id: string) {
  const s = id.toLowerCase();

  return ['vision', 'vl', 'multimodal', 'fuyu', 'kosmos', 'vila', 'neva'].some((x) =>
    s.includes(x),
  );
}

function isChatModel(id: string) {
  const s = id.toLowerCase();

  return ![
    'embed',
    'embedding',
    'reward',
    'parse',
    'clip',
    'guard',
    'safety',
    'detector',
    'translate',
    'bge',
  ].some((x) => s.includes(x));
}

const response = await fetch('https://integrate.api.nvidia.com/v1/models');

if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}

const models = (await response.json()) as NvidiaResponse;

const filteredModels = models.data
  .filter((m) => isChatModel(m.id))
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((m) => ({
    id: m.id,
    name: prettify(m.id),
    url: 'https://integrate.api.nvidia.com/v1',
    toolCalling: true,
    vision: isVision(m.id),
    // maxInputTokens: 128000,
    // maxOutputTokens: 16000,
  }));

console.log(JSON.stringify(filteredModels, null, jsonSpacing));
