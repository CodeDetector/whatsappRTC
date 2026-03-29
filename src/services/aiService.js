import OpenAI from 'openai';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const promptsDir = path.resolve(__dirname, '../../prompts');

const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

let openaiClient;

function getOpenAIClient() {
  if (openaiClient) return openaiClient;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for AI operations.');
  }

  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

async function loadPrompt(fileName) {
  const filePath = path.join(promptsDir, fileName);
  return readFile(filePath, 'utf8');
}

export async function cleanOcrText(rawText) {
  if (!rawText) return '';

  const systemPrompt = await loadPrompt('ocr_clean.txt');
  const completion = await getOpenAIClient().chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: rawText }
    ]
  });

  const content = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(content);
  return parsed.cleaned_text ?? rawText;
}

export async function classifyMessage(inputText) {
  const systemPrompt = await loadPrompt('classifier.txt');

  const completion = await getOpenAIClient().chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: inputText }
    ]
  });

  return JSON.parse(completion.choices[0]?.message?.content ?? '{}');
}

export async function extractPaymentData(inputText) {
  const systemPrompt = await loadPrompt('payment_extract.txt');

  const completion = await getOpenAIClient().chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: inputText }
    ]
  });

  return JSON.parse(completion.choices[0]?.message?.content ?? '{}');
}
