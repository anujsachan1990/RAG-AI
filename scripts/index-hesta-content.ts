// Script to scrape and index hesta.com.au content into Upstash Vector
import {
  upsertDocuments,
  type DocumentChunk,
  type ImageData,
} from "../lib/vector-store";
import { readFileSync } from "fs";
import { join } from "path";

let puppeteer: typeof import("puppeteer") | null = null;
try {
  puppeteer = require("puppeteer");
} catch {
  console.log("[v0] Puppeteer not installed. Falling back to basic fetch.");
}

// Load pages from JSON file
const pagesData = JSON.parse(
  readFileSync(join(__dirname, "hesta-pages.json"), "utf-8")
);
const HESTA_PAGES: string[] = pagesData.pages;

interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  images: ImageData[];
}

async function fetchPageWithPuppeteer(
  url: string
): Promise<ScrapedPage | null> {
  if (!puppeteer) {
    return fetchPageContent(url);
  }

  try {
    console.log(`[v0] Fetching ${url} with Puppeteer...`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent("Mozilla/5.0 (compatible; HestaBot/1.0)");

    // Navigate with longer timeout and different wait strategy
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      // Wait a bit for dynamic content
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.warn(`[v0] Navigation timeout for ${url}, continuing anyway...`);
    }

    // Extract title
    const title = await page.title();

    // Extract main content text and images
    const { content, images } = await page.evaluate(() => {
      // Remove only scripts and styles - keep everything else
      const bodyClone = document.body.cloneNode(true) as HTMLElement;

      // Extract images before removing elements
      const imgElements = Array.from(bodyClone.querySelectorAll("img"));
      const extractedImages = imgElements
        .map((img) => {
          const src = img.src || img.getAttribute("data-src") || "";
          const alt = img.alt || "";
          const title = img.title || "";

          // Only include images with valid src
          if (!src || src.startsWith("data:")) return null;

          // Filter out SVG images - only allow JPG/JPEG/PNG
          const srcLower = src.toLowerCase();
          if (
            srcLower.endsWith(".svg") ||
            srcLower.includes(".svg?") ||
            srcLower.includes(".svg#")
          ) {
            return null;
          }

          // Try to find caption - look for nearby figcaption or caption elements
          let caption = "";
          const figure = img.closest("figure");
          if (figure) {
            const figcaption = figure.querySelector("figcaption");
            if (figcaption) {
              caption = figcaption.textContent?.trim() || "";
            }
          }

          return {
            src,
            alt: alt || undefined,
            title: title || undefined,
            caption: caption || undefined,
          };
        })
        .filter((img) => img !== null) as Array<{
        src: string;
        alt?: string;
        title?: string;
        caption?: string;
      }>;

      // Remove only critical non-content elements
      const unwanted = bodyClone.querySelectorAll("script, style, noscript");
      unwanted.forEach((el) => el.remove());

      // Get ALL text content from body
      const textContent = bodyClone.innerText || bodyClone.textContent || "";

      // Minimal cleanup - just remove excessive whitespace
      return {
        content: textContent.trim(),
        images: extractedImages,
      };
    });

    console.log(
      `[v0] Extracted ${content.length} chars and ${images.length} images from ${url} via Puppeteer`
    );
    console.log(`[v0] First 500 chars: ${content.substring(0, 500)}...`);
    if (images.length > 0) {
      console.log(`[v0] Images found:`, images.slice(0, 3));
    }

    await browser.close();

    // Do NOT do aggressive cleanup - just minimal whitespace normalization
    let cleanedContent = content
      // Only normalize excessive whitespace
      .replace(/[ \t]+/g, " ") // Multiple spaces to single space
      .replace(/\n{3,}/g, "\n\n") // Multiple newlines to double newline
      .trim();

    console.log(`[v0] After cleanup: ${cleanedContent.length} chars`);
    console.log(`[v0] Sample: ${cleanedContent.substring(0, 500)}...`);

    // If content is too short, fall back to basic fetch which might work better
    if (cleanedContent.length < 500) {
      console.warn(
        `[v0] Content too short (${cleanedContent.length} chars), trying fallback fetch...`
      );
      // Fall back to basic fetch
      return fetchPageContent(url);
    }

    console.log(
      `[v0] Successfully scraped ${url} with Puppeteer (${cleanedContent.length} chars, ${images.length} images)`
    );
    return { url, title, content: cleanedContent, images };
  } catch (error) {
    console.error(`[v0] Error fetching ${url} with Puppeteer:`, error);
    console.log("[v0] Falling back to basic fetch...");
    return fetchPageContent(url);
  }
}

async function fetchPageContent(url: string): Promise<ScrapedPage | null> {
  try {
    console.log(`[v0] Fetching ${url}...`);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HestaBot/1.0)",
      },
    });

    if (!response.ok) {
      console.error(`[v0] Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Extract title first
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/&[^;]+;/g, "").trim()
      : "Hesta Page";

    // Extract images before cleaning HTML
    const images: Array<{
      src: string;
      alt?: string;
      title?: string;
      caption?: string;
    }> = [];
    const imgRegex = /<img[^>]*>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      const imgTag = imgMatch[0];

      // Extract src
      const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
      const dataSrcMatch = imgTag.match(/data-src=["']([^"']+)["']/i);
      const src = srcMatch?.[1] || dataSrcMatch?.[1] || "";

      // Skip data URIs and empty src
      if (!src || src.startsWith("data:")) continue;

      // Filter out SVG images - only allow JPG/JPEG/PNG
      const srcLower = src.toLowerCase();
      if (
        srcLower.endsWith(".svg") ||
        srcLower.includes(".svg?") ||
        srcLower.includes(".svg#")
      ) {
        continue;
      }

      // Extract alt
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
      const alt = altMatch?.[1] || "";

      // Extract title
      const titleMatch = imgTag.match(/title=["']([^"']*)["']/i);
      const imgTitle = titleMatch?.[1] || "";

      // Try to extract caption from nearby figcaption (look ahead in HTML)
      let caption = "";
      const figcaptionMatch = html
        .slice(imgRegex.lastIndex)
        .match(/<figcaption[^>]*>(.*?)<\/figcaption>/i);
      if (figcaptionMatch) {
        caption = figcaptionMatch[1].replace(/<[^>]+>/g, "").trim();
      }

      images.push({
        src,
        alt: alt || undefined,
        title: imgTitle || undefined,
        caption: caption || undefined,
      });
    }

    // Try to extract body content with minimal filtering
    let bodyContent = "";
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

    if (bodyMatch) {
      bodyContent = bodyMatch[1];
      console.log(
        `[v0] Extracted body tag (${bodyContent.length} chars of HTML)`
      );
    } else {
      bodyContent = html;
      console.log(`[v0] No body tag found, using full HTML`);
    }

    // Now remove unwanted elements from the body content
    // Remove script and style tags
    let cleanHtml = bodyContent.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );
    cleanHtml = cleanHtml.replace(
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      ""
    );

    // Only remove nav, header, footer if they're clearly navigation elements
    // Be less aggressive with removal
    cleanHtml = cleanHtml.replace(
      /<nav\b[^>]*class="[^"]*nav[^"]*"[^>]*>[\s\S]*?<\/nav>/gi,
      ""
    );
    cleanHtml = cleanHtml.replace(
      /<header\b[^>]*class="[^"]*header[^"]*"[^>]*>[\s\S]*?<\/header>/gi,
      ""
    );
    cleanHtml = cleanHtml.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "");

    bodyContent = cleanHtml;

    const content = bodyContent
      // Replace table cells with spaces to preserve data separation
      .replace(/<\/td>/gi, " | ")
      .replace(/<\/tr>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      // Remove remaining HTML tags
      .replace(/<[^>]+>/g, " ")
      // Clean up entities - PRESERVE NUMBERS
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)) // Convert numeric entities
      // Only remove non-numeric HTML entities carefully
      .replace(/&([a-z]+);/gi, (match, entity) => {
        if (entity === "nbsp") return " ";
        return " "; // Replace other entities with space
      })
      // Clean up excessive whitespace while preserving paragraph breaks
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();

    console.log(
      `[v0] Extracted ${content.length} chars and ${images.length} images from ${url} via basic fetch`
    );
    console.log(`[v0] First 300 chars: ${content.substring(0, 300)}...`);
    if (images.length > 0) {
      console.log(`[v0] Images found:`, images.slice(0, 3));
    }

    if (content.length < 200) {
      console.warn(
        `[v0] Content too short after extraction (${content.length} chars). First 200 chars:`
      );
      console.warn(content.substring(0, 200));
      return null;
    }

    console.log(
      `[v0] Successfully scraped ${url} (${content.length} chars, ${images.length} images)`
    );
    console.log(`[v0] First 200 chars: ${content.substring(0, 200)}...`);
    return { url, title, content, images };
  } catch (error) {
    console.error(`[v0] Error fetching ${url}:`, error);
    return null;
  }
}

/**
 * Split content into chunks for better retrieval
 */
function chunkContent(
  page: ScrapedPage,
  chunkSize = 3000, // Increased from 1000 to 2000
  overlap = 300 // Increased from 200 to 300
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const words = page.content.split(/\s+/);

  console.log(`[v0] Chunking ${words.length} words from ${page.url}`);

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunkWords = words.slice(i, i + chunkSize);
    const chunkText = chunkWords.join(" ");

    if (chunkText.trim().length > 100) {
      // Only include chunks with at least 100 chars

      // Include image alt text and captions in the chunk text for better searchability
      let enrichedText = chunkText;
      if (page.images.length > 0) {
        const imageDescriptions = page.images
          .map((img) => {
            const parts = [];
            if (img.alt) parts.push(img.alt);
            if (img.caption) parts.push(img.caption);
            return parts.join(" - ");
          })
          .filter(Boolean)
          .join(". ");

        if (imageDescriptions) {
          enrichedText = `${chunkText}\n\nImages: ${imageDescriptions}`;
        }
      }

      chunks.push({
        id: `${page.url}-chunk-${chunks.length}`,
        text: enrichedText,
        metadata: {
          url: page.url,
          title: page.title,
          timestamp: Date.now(),
          images: page.images.length > 0 ? page.images : undefined,
        },
      });
      console.log(
        `[v0] Chunk ${chunks.length}: ${chunkText.substring(0, 100)}... (${
          page.images.length
        } images)`
      );
    }
  }

  return chunks;
}

/**
 * Main indexing function
 */
async function indexHestaContent() {
  console.log("[v0] Starting Hesta content indexing...");
  console.log(`[v0] Fetching ${HESTA_PAGES.length} pages...`);

  if (puppeteer) {
    console.log("[v0] Using Puppeteer for JavaScript-rendered content");
  } else {
    console.log(
      "[v0] Using basic fetch (install puppeteer for better results)"
    );
  }

  // Fetch all pages
  const fetchPromises = HESTA_PAGES.map((url) =>
    puppeteer ? fetchPageWithPuppeteer(url) : fetchPageContent(url)
  );
  const pages = await Promise.all(fetchPromises);
  const validPages = pages.filter((page): page is ScrapedPage => page !== null);

  console.log(`[v0] Successfully fetched ${validPages.length} pages`);

  // Chunk all pages
  const allChunks: DocumentChunk[] = [];
  for (const page of validPages) {
    const chunks = chunkContent(page);
    allChunks.push(...chunks);
    console.log(`[v0] Created ${chunks.length} chunks from ${page.url}`);
  }

  console.log(`[v0] Total chunks: ${allChunks.length}`);

  // Upsert to vector store in batches
  const batchSize = 100;
  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    await upsertDocuments(batch);
    console.log(
      `[v0] Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        allChunks.length / batchSize
      )}`
    );
  }

  console.log("[v0] ✅ Indexing complete!");
  console.log(
    `[v0] Indexed ${validPages.length} pages with ${allChunks.length} chunks`
  );
}

// Run the indexing
indexHestaContent().catch((error) => {
  console.error("[v0] Indexing failed:", error);
  process.exit(1);
});
