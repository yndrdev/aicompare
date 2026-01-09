# Environment Variables

Copy `.env.example` to `.env.local` and fill in your values.

## Required Variables

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Get these from: Supabase Dashboard → Project Settings → API

### At Least One AI Provider
You need at least one provider configured to run extractions.

## AI Provider API Keys

### OpenAI (Required for baseline comparison)
```
OPENAI_API_KEY=sk-...
```
Get from: https://platform.openai.com/api-keys

### Anthropic (Claude)
```
ANTHROPIC_API_KEY=sk-ant-...
```
Get from: https://console.anthropic.com/settings/keys

### Google AI (Gemini)
```
GOOGLE_GENERATIVE_AI_API_KEY=...
```
Get from: https://aistudio.google.com/apikey

### Groq (Llama models - fast inference)
```
GROQ_API_KEY=gsk_...
```
Get from: https://console.groq.com/keys

### xAI (Grok)
```
XAI_API_KEY=...
```
Get from: https://console.x.ai/

### Mistral
```
MISTRAL_API_KEY=...
```
Get from: https://console.mistral.ai/api-keys/

### Together AI (Alternative for open-source models)
```
TOGETHER_API_KEY=...
```
Get from: https://api.together.xyz/settings/api-keys

### Fireworks AI (Alternative for open-source models)
```
FIREWORKS_API_KEY=...
```
Get from: https://fireworks.ai/account/api-keys

---

## Notes

- Never commit `.env.local` to git
- API keys should be kept secret
- Each provider has different rate limits and pricing
- You only need keys for providers you want to test
