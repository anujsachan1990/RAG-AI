// Script to scrape and index hesta.com.au content into Upstash Vector
import { upsertDocuments, type DocumentChunk } from "../lib/vector-store"

let puppeteer: typeof import("puppeteer") | null = null
try {
  puppeteer = require("puppeteer")
} catch {
  console.log("[v0] Puppeteer not installed. Falling back to basic fetch.")
}

const HESTA_PAGES = [
  "https://www.hesta.com.au",
  "https://www.hesta.com.au/about-us",
  "https://www.hesta.com.au/members",
  "https://www.hesta.com.au/members/super-products",
  "https://www.hesta.com.au/members/grow-your-super",
  "https://www.hesta.com.au/members/insurance",
  "https://www.hesta.com.au/employers",
  "https://www.hesta.com.au/investments",
  "https://www.hesta.com.au/investments/how-we-invest",
  "https://www.hesta.com.au/investments/investment-options",
  "https://www.hesta.com.au/contact-us",
  "https://www.hesta.com.au/performance",
  "https://www.hesta.com.au/fees",
]

interface ScrapedPage {
  url: string
  title: string
  content: string
  images: Array<{ url: string; alt: string }>
}

async function fetchPageWithPuppeteer(url: string): Promise<ScrapedPage | null> {
  if (!puppeteer) {
    return fetchPageContent(url)
  }

  try {
    console.log(`[v0] Fetching ${url} with Puppeteer...`)
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    // Set user agent
    await page.setUserAgent("Mozilla/5.0 (compatible; HestaBot/1.0)")

    // Navigate and wait for content to load
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 })

    // Wait a bit more for any lazy-loaded content
    await page.waitForTimeout(2000)

    // Get the rendered HTML
    const html = await page.content()

    // Extract images using page.evaluate for better accuracy
    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"))
      return imgs
        .map((img) => ({
          url: img.src,
          alt: img.alt || "",
        }))
        .filter(
          (img) =>
            img.url &&
            !img.url.includes("pixel") &&
            !img.url.includes("tracking") &&
            !img.url.endsWith(".svg") &&
            img.url.length > 20,
        )
    })

    console.log(`[v0] Found ${images.length} images on ${url}`)

    // Extract title
    const title = await page.title()

    // Extract main content text
    const content = await page.evaluate(() => {
      // Remove unwanted elements
      const unwanted = document.querySelectorAll("script, style, nav, header, footer, iframe")
      unwanted.forEach((el) => el.remove())

      // Try to find main content
      const main = document.querySelector("main, article, [role='main'], .content, #content")
      const textContent = main ? main.textContent : document.body.textContent

      return (textContent || "")
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .trim()
    })

    await browser.close()

    if (content.length < 200) {
      console.warn(`[v0] Skipping ${url} - content too short (${content.length} chars)`)
      return null
    }

    console.log(`[v0] Successfully scraped ${url} with Puppeteer (${content.length} chars)`)
    return { url, title, content, images }
  } catch (error) {
    console.error(`[v0] Error fetching ${url} with Puppeteer:`, error)
    console.log("[v0] Falling back to basic fetch...")
    return fetchPageContent(url)
  }
}

/**
 * Extract image URLs from HTML
 */
function extractImages(html: string, baseUrl: string): Array<{ url: string; alt: string }> {
  const images: Array<{ url: string; alt: string }> = []
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi
  const imgRegex2 = /<img[^>]+alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*>/gi
  const imgRegex3 = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi

  let match

  // Try all regex patterns to catch different img tag formats
  while ((match = imgRegex.exec(html)) !== null) {
    const [, src, alt] = match
    images.push({ url: resolveUrl(src, baseUrl), alt: alt || "" })
  }

  while ((match = imgRegex2.exec(html)) !== null) {
    const [, alt, src] = match
    images.push({ url: resolveUrl(src, baseUrl), alt: alt || "" })
  }

  while ((match = imgRegex3.exec(html)) !== null) {
    const [, src] = match
    if (!images.find((img) => img.url === resolveUrl(src, baseUrl))) {
      images.push({ url: resolveUrl(src, baseUrl), alt: "" })
    }
  }

  // Remove duplicates and filter out tracking pixels/icons
  const uniqueImages = images.filter(
    (img, index, self) =>
      index === self.findIndex((i) => i.url === img.url) &&
      !img.url.includes("pixel") &&
      !img.url.includes("tracking") &&
      !img.url.endsWith(".svg") && // Often just icons
      img.url.length > 20,
  )

  return uniqueImages
}

/**
 * Resolve relative URLs to absolute URLs
 */
function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  if (url.startsWith("//")) {
    return "https:" + url
  }
  if (url.startsWith("/")) {
    const base = new URL(baseUrl)
    return `${base.protocol}//${base.host}${url}`
  }
  return new URL(url, baseUrl).href
}

async function fetchPageContent(url: string): Promise<ScrapedPage | null> {
  try {
    console.log(`[v0] Fetching ${url}...`)
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HestaBot/1.0)",
      },
    })

    if (!response.ok) {
      console.error(`[v0] Failed to fetch ${url}: ${response.status}`)
      return null
    }

    const html = await response.text()

    const images = extractImages(html, url)
    console.log(`[v0] Found ${images.length} images on ${url}`)

    // Remove script and style tags
    let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    cleanHtml = cleanHtml.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
    cleanHtml = cleanHtml.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
    cleanHtml = cleanHtml.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")

    // Extract title
    const titleMatch = cleanHtml.match(/<title[^>]*>(.*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1].replace(/&[^;]+;/g, "").trim() : "Hesta Page"

    let bodyContent = ""
    const mainMatch = cleanHtml.match(/<main[^>]*>(.*?)<\/main>/is)
    const articleMatch = cleanHtml.match(/<article[^>]*>(.*?)<\/article>/is)
    const contentMatch = cleanHtml.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/is)

    if (mainMatch) {
      bodyContent = mainMatch[1]
    } else if (articleMatch) {
      bodyContent = articleMatch[1]
    } else if (contentMatch) {
      bodyContent = contentMatch[1]
    } else {
      const bodyMatch = cleanHtml.match(/<body[^>]*>(.*?)<\/body>/is)
      bodyContent = bodyMatch ? bodyMatch[1] : cleanHtml
    }

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
        if (entity === "nbsp") return " "
        return " " // Replace other entities with space
      })
      // Clean up excessive whitespace while preserving paragraph breaks
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim()

    if (content.length < 200) {
      console.warn(`[v0] Skipping ${url} - content too short (${content.length} chars)`)
      return null
    }

    console.log(`[v0] Successfully scraped ${url} (${content.length} chars)`)
    return { url, title, content, images }
  } catch (error) {
    console.error(`[v0] Error fetching ${url}:`, error)
    return null
  }
}

/**
 * Split content into chunks for better retrieval
 */
function chunkContent(page: ScrapedPage, chunkSize = 1000, overlap = 200): DocumentChunk[] {
  const chunks: DocumentChunk[] = []
  const words = page.content.split(/\s+/)

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunkWords = words.slice(i, i + chunkSize)
    const chunkText = chunkWords.join(" ")

    if (chunkText.trim().length > 0) {
      const imageInfo =
        page.images.length > 0
          ? `\n\n[Images available: ${page.images.map((img) => `${img.alt || "Image"} (${img.url})`).join(", ")}]`
          : ""

      chunks.push({
        id: `${page.url}-chunk-${chunks.length}`,
        text: chunkText + imageInfo,
        metadata: {
          url: page.url,
          title: page.title,
          timestamp: Date.now(),
          images: page.images,
        },
      })
    }
  }

  return chunks
}

/**
 * Main indexing function
 */
async function indexHestaContent() {
  console.log("[v0] Starting Hesta content indexing...")
  console.log(`[v0] Fetching ${HESTA_PAGES.length} pages...`)

  if (puppeteer) {
    console.log("[v0] ✅ Using Puppeteer for JavaScript-rendered content")
  } else {
    console.log("[v0] ⚠️  Using basic fetch (install puppeteer with 'npm install puppeteer' for better results)")
  }

  // Fetch all pages
  const fetchPromises = HESTA_PAGES.map((url) => (puppeteer ? fetchPageWithPuppeteer(url) : fetchPageContent(url)))
  const pages = await Promise.all(fetchPromises)
  const validPages = pages.filter((page): page is ScrapedPage => page !== null)

  console.log(`[v0] Successfully fetched ${validPages.length}/${HESTA_PAGES.length} pages`)

  if (validPages.length === 0) {
    console.error("[v0] ❌ No pages were successfully scraped!")
    console.error("[v0] This usually means:")
    console.error("[v0]   - Network issues or CORS blocking")
    console.error("[v0]   - Pages returned content < 200 characters")
    console.error("[v0]   - Scraping failed to extract text")
    process.exit(1)
  }

  // Show sample of extracted content
  console.log("\n[v0] Sample of extracted content:")
  validPages.slice(0, 2).forEach((page) => {
    console.log(`\n  📄 ${page.url}`)
    console.log(`     Title: ${page.title}`)
    console.log(`     Content length: ${page.content.length} chars`)
    console.log(`     Images: ${page.images.length}`)
    console.log(`     First 200 chars: ${page.content.substring(0, 200)}...`)
  })
  console.log("")

  // Chunk all pages
  const allChunks: DocumentChunk[] = []
  for (const page of validPages) {
    const chunks = chunkContent(page)
    allChunks.push(...chunks)
    console.log(`[v0] Created ${chunks.length} chunks from ${page.url}`)
  }

  console.log(`[v0] Total chunks to upload: ${allChunks.length}`)

  if (allChunks.length === 0) {
    console.error("[v0] ❌ No chunks were created! Check if pages have enough content.")
    process.exit(1)
  }

  // Upsert to vector store in batches
  const batchSize = 100
  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize)
    await upsertDocuments(batch)
    console.log(`[v0] Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allChunks.length / batchSize)}`)
  }

  console.log("\n[v0] ✅ Indexing complete!")
  console.log(`[v0] Indexed ${validPages.length} pages with ${allChunks.length} chunks`)
  console.log("[v0] You can now query your RAG system for Hesta information!")
}

// Run the indexing
indexHestaContent().catch((error) => {
  console.error("[v0] Indexing failed:", error)
  process.exit(1)
})
