# AI Email Summarizer

A production-ready Next.js app that uses GPT-5 Nano to turn long emails into a concise summary, actionable checklist, and priority rating.

## Requirements

- Node.js 20 or newer
- An OpenAI API key

## Installation

```bash
npm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

Configure `.env.local`:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-nano
```

Never commit your real API key. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

### `POST /api/summarize`

Example request:

```bash
curl -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"emailContent":"Hi team, please send the final report by Friday. This is blocking the client launch."}'
```

Request body:

```json
{
  "emailContent": "Hi team, please send the final report by Friday."
}
```

Example response:

```json
{
  "summary": "The team needs to submit the final report by Friday for the client launch.",
  "actionItems": [
    "Send the final report by Friday."
  ],
  "priority": "High"
}
```

`priority` is always one of `Low`, `Medium`, `High`, or `Urgent`.

## Quality checks

```bash
npm run lint
npm run build
```
