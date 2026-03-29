/**
 * Placeholder OCR adapter.
 * Swap this implementation with a real provider (e.g. AWS Textract, Google Vision, Tesseract microservice).
 */
export async function extractTextFromMedia(media) {
  if (!media) return '';

  const mediaUrl = media.url ?? media.link ?? null;
  if (!mediaUrl) {
    return '';
  }

  console.log('[OCR] Placeholder OCR called for media:', mediaUrl);

  return `OCR_PLACEHOLDER_TEXT for ${mediaUrl}`;
}
