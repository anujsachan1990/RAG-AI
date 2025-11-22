# RAG System Setup and Troubleshooting Guide

## Current Issue: Incomplete Content Extraction

### Problem
The RAG system is working correctly (querying the vector database and retrieving documents), but the **scraped content only includes navigation menus and page headers** - not the actual page content with data like:
- Member statistics
- Performance numbers
- Investment returns
- Fee tables

### Root Cause
Most modern websites (including hesta.com.au) load their main content **dynamically using JavaScript**. When using basic `fetch()` to scrape pages, you only get the initial HTML shell - not the JavaScript-rendered content.

**Real Example:**
- **What the website shows:** "Over 1.05 million members"
- **What gets scraped:** "More than million members" (number missing!)
- **What the LLM returns:** "2+ million members" (hallucination to fill the gap)

This is why accurate numbers aren't being captured - the dynamic JavaScript-rendered content is missing from the initial HTML.

**What gets captured:**
- Navigation menus
- Page headers
- Footer links
- Basic page structure

**What's missing:**
- Performance tables
- Member counts (like "1.05 million")
- Investment data
- Dynamic content loaded via React/JavaScript

### Solution: Use JavaScript-Aware Scraping

You have two options:

#### Option 1: Use Puppeteer (Recommended for Production)

Install Puppeteer and update the indexing script to use a headless browser:

\`\`\`bash
npm install puppeteer
\`\`\`

Then modify `scripts/index-hesta-content.ts` to use Puppeteer instead of fetch:

\`\`\`typescript
import puppeteer from 'puppeteer';

async function fetchPageContent(url: string): Promise<ScrapedPage | null> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Wait for content to load
    await page.waitForSelector('main, article, .content', { timeout: 5000 });
    
    // Extract text content
    const content = await page.evaluate(() => {
      // Remove unwanted elements
      document.querySelectorAll('nav, header, footer, script, style').forEach(el => el.remove());
      
      // Get main content
      const main = document.querySelector('main, article, .content') || document.body;
      return main.innerText;
    });
    
    const title = await page.title();
    
    await browser.close();
    return { url, title, content };
  } catch (error) {
    await browser.close();
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}
\`\`\`

#### Option 2: Improved HTML Parsing (Current Implementation)

I've updated the indexing script to:
- Remove nav/header/footer elements
- Extract main content areas (`<main>`, `<article>`)
- Preserve table structure (using `|` for cells, `\n` for rows)
- Skip pages with very short content (< 200 chars)
- **Better number preservation in text cleaning**

**Re-index with the improved script:**

\`\`\`bash
npm run index-hesta
\`\`\`

This will capture more content, but may still miss JavaScript-rendered data.

## Testing Your RAG System

After re-indexing, test with specific queries:

\`\`\`
✅ Good queries:
- "What is Hesta?"
- "How do I contact Hesta?"
- "What investment options does Hesta offer?"

❌ Queries that need dynamic data:
- "How many members does Hesta have?" (number loaded via JS)
- "What are the performance returns for October 2025?" (table loaded via JS)
- "What are the current fees?" (dynamic pricing table)
\`\`\`

## Debugging Retrieved Content

Enable debug logs to see what content is being retrieved:

1. Check the v0 console logs for:
   \`\`\`
   [v0] Retrieved content details: [...]
   \`\`\`

2. Look at the `text` field in each result - it should contain actual page content, not just navigation menus

3. If you see mostly navigation text, the content wasn't properly extracted during indexing

## Current Status

- ✅ RAG system is functional (querying vector DB correctly)
- ✅ Improved HTML parsing to filter navigation elements
- ✅ Better number preservation in text cleaning
- ❌ Dynamic JavaScript content still not captured (needs Puppeteer)
- ⚠️ Need to re-index with improved script

**The Hallucination Problem:**
When retrieved content has gaps like "More than million members", the LLM fills in plausible but incorrect numbers based on its training data, leading to hallucinations like "2+ million" instead of the actual "1.05 million".

## Next Steps

1. **Re-index** using the improved script: `npm run index-hesta`
2. **Test queries** to verify content quality
3. **If still missing data**: Implement Puppeteer scraping (Option 1)
4. **Monitor debug logs** to confirm proper content retrieval
