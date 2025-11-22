# AI Provider Configuration Guide

## Current Issue: Billing Threshold Exceeded

If you're seeing an error about "billing threshold exceeded", your current API key has reached its usage limit. Follow the steps below to resolve this.

## Quick Fix Options

### Option 1: Update Thesys API Key (Recommended if you have Thesys access)

1. Get a new API key from [Thesys.dev](https://thesys.dev)
2. Update your environment variable in Vercel:
   - Go to your Vercel project → Settings → Environment Variables
   - Update `THESYS_API_KEY` with your new key
   - Redeploy your application

### Option 2: Switch to OpenAI (Popular Alternative)

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Update `lib/framework-config.ts`:

\`\`\`typescript
api: {
  defaultModel: "gpt-4o",  // or "gpt-4o-mini" for cheaper option
  endpoint: "https://api.openai.com/v1/chat/completions",
  apiKeyEnvVar: "OPENAI_API_KEY",
}
\`\`\`

3. Set the `OPENAI_API_KEY` environment variable in Vercel
4. Redeploy

### Option 3: Switch to Anthropic Claude

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Update `lib/framework-config.ts`:

\`\`\`typescript
api: {
  defaultModel: "claude-3-5-sonnet-20241022",
  endpoint: "https://api.anthropic.com/v1/messages",
  apiKeyEnvVar: "ANTHROPIC_API_KEY",
}
\`\`\`

3. Update `app/api/chat/route.ts` to use Anthropic's message format:

\`\`\`typescript
// Change the body format for Anthropic
body: JSON.stringify({
  model: process.env.AI_MODEL || frameworkConfig.api.defaultModel,
  max_tokens: 4096,
  messages: messages, // No system message in messages array for Anthropic
  system: systemMessage, // System message as separate parameter
  stream: true,
}),
\`\`\`

4. Set the `ANTHROPIC_API_KEY` environment variable in Vercel
5. Redeploy

### Option 4: Use OpenRouter (Multiple Models)

OpenRouter provides access to multiple AI models with one API key:

1. Get an API key from [OpenRouter](https://openrouter.ai/keys)
2. Update `lib/framework-config.ts`:

\`\`\`typescript
api: {
  defaultModel: "anthropic/claude-3.5-sonnet",  // or any OpenRouter model
  endpoint: "https://openrouter.ai/api/v1/chat/completions",
  apiKeyEnvVar: "OPENROUTER_API_KEY",
}
\`\`\`

3. Set the `OPENROUTER_API_KEY` environment variable in Vercel
4. Redeploy

## Model Recommendations

### Best for Quality
- **OpenAI GPT-4o**: Excellent reasoning and code generation
- **Anthropic Claude 3.5 Sonnet**: Great for long context and analysis

### Best for Cost
- **OpenAI GPT-4o-mini**: Good balance of quality and price
- **Anthropic Claude 3 Haiku**: Fast and economical

### Best for Flexibility
- **OpenRouter**: Access multiple models with one API key

## Environment Variable Setup in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add your new API key variable
5. Select all environments (Production, Preview, Development)
6. Redeploy your project

## Testing Locally

Create a `.env.local` file in your project root:

\`\`\`env
# Choose one provider:
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
# or
OPENROUTER_API_KEY=sk-or-...
# or
THESYS_API_KEY=...

# Optional: Override the default model
AI_MODEL=gpt-4o-mini
\`\`\`

Then run `npm run dev` to test locally.

## Need Help?

- Check the provider's documentation for API limits and pricing
- Ensure your API key has sufficient credits
- Verify environment variables are correctly set in Vercel
- Check Vercel deployment logs for any errors
