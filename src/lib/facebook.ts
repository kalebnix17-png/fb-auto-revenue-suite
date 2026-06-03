const FB_GRAPH_URL = "https://graph.facebook.com/v21.0";

export async function getFacebookPages(accessToken: string) {
  const res = await fetch(
    `${FB_GRAPH_URL}/me/accounts?fields=id,name,access_token,category,picture&access_token=${accessToken}`
  );
  if (!res.ok) throw new Error("Failed to fetch Facebook pages");
  return res.json();
}

export async function publishPost(
  pageId: string,
  pageAccessToken: string,
  content: string,
  imageUrl?: string,
  linkUrl?: string
) {
  const params: Record<string, string> = {
    message: content,
    access_token: pageAccessToken,
  };

  if (linkUrl) params.link = linkUrl;

  let endpoint = `${FB_GRAPH_URL}/${pageId}/feed`;

  if (imageUrl) {
    endpoint = `${FB_GRAPH_URL}/${pageId}/photos`;
    params.url = imageUrl;
    params.caption = content;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Failed to publish post");
  }
  return res.json();
}

export async function schedulePost(
  pageId: string,
  pageAccessToken: string,
  content: string,
  scheduledTime: Date,
  imageUrl?: string
) {
  const unixTime = Math.floor(scheduledTime.getTime() / 1000);
  const params: Record<string, string | number> = {
    message: content,
    scheduled_publish_time: unixTime,
    published: 0,
    access_token: pageAccessToken,
  };

  if (imageUrl) params.url = imageUrl;

  const endpoint = `${FB_GRAPH_URL}/${pageId}/feed`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Failed to schedule post");
  }
  return res.json();
}

export async function getPostEngagement(
  postId: string,
  pageAccessToken: string
) {
  const fields = "likes.summary(true),comments.summary(true),shares";
  const res = await fetch(
    `${FB_GRAPH_URL}/${postId}?fields=${fields}&access_token=${pageAccessToken}`
  );
  if (!res.ok) return null;
  return res.json();
}

export async function getPageInsights(
  pageId: string,
  pageAccessToken: string,
  metric: string,
  period = "day"
) {
  const res = await fetch(
    `${FB_GRAPH_URL}/${pageId}/insights?metric=${metric}&period=${period}&access_token=${pageAccessToken}`
  );
  if (!res.ok) return null;
  return res.json();
}

export async function sendMessengerMessage(
  recipientId: string,
  message: string,
  pageAccessToken: string
) {
  const res = await fetch(`${FB_GRAPH_URL}/me/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pageAccessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text: message },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Failed to send message");
  }
  return res.json();
}

export async function subscribePage(
  pageId: string,
  pageAccessToken: string,
  fields = ["messages", "messaging_postbacks", "feed"]
) {
  const res = await fetch(
    `${FB_GRAPH_URL}/${pageId}/subscribed_apps?subscribed_fields=${fields.join(",")}&access_token=${pageAccessToken}`,
    { method: "POST" }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Failed to subscribe page");
  }
  return res.json();
}
