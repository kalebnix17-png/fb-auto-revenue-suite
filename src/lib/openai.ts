import OpenAI from "openai";

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "placeholder" });
}

export async function generateFacebookPost(prompt: string): Promise<string> {
  const completion = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a social media marketing expert specializing in Facebook content.
Create engaging, conversion-focused Facebook posts that:
- Use attention-grabbing hooks
- Include relevant emojis
- Have a clear call-to-action
- Are optimized for engagement
- Stay under 500 characters for better reach
Keep the tone professional yet personable.`,
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 500,
    temperature: 0.8,
  });

  return completion.choices[0]?.message?.content ?? "";
}

export async function generateAutoReply(
  customerMessage: string,
  businessContext: string
): Promise<string> {
  const completion = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a helpful customer service representative for a business.
Context: ${businessContext}
Respond to customer inquiries in a friendly, professional manner.
Keep responses concise (under 200 characters) and helpful.
Always aim to capture lead information or move the conversation forward.`,
      },
      { role: "user", content: customerMessage },
    ],
    max_tokens: 200,
    temperature: 0.6,
  });

  return completion.choices[0]?.message?.content ?? "";
}
