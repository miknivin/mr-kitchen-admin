// lib/kv.js
class UpstashKV {
  constructor() {
    const url = process.env.KV_REST_API_URL?.trim();
    const token = process.env.KV_REST_API_TOKEN?.trim();

    if (!url || !token) {
      console.warn("Missing KV_REST_API_URL or KV_REST_API_TOKEN. Caching disabled.");
      this.isConnected = false;
    } else {
      this.url = url.replace(/\/$/, "");
      this.token = token;
      this.isConnected = true;
    }
  }

  async set(key, value, { ttl } = {}) {
    if (!this.isConnected) return null;
    if (!key) throw new Error("Key required");

    const payload = [
      "SET",
      key,
      typeof value === "string" ? value : JSON.stringify(value),
    ];
    if (ttl) payload.push("EX", ttl);

    const res = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("SET error →", txt);
      throw new Error(`SET failed: ${res.status} ${txt}`);
    }

    const data = await res.json();
    return data;
  }

  async get(key) {
    if (!this.isConnected) return null;
    if (!key) throw new Error("Key required");

    const getUrl = `${this.url.endsWith("/") ? this.url.slice(0, -1) : this.url
      }/get/${encodeURIComponent(key)}`;

    const res = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      const txt = await res.text();
      console.log("Full Error Response:", txt); // Debug
      throw new Error(`GET failed: ${res.status} ${txt}`);
    }

    const data = await res.json();
    return data.result ? JSON.parse(data.result) : null;
  }

  async delete(key) {
    if (!this.isConnected) return { success: true, message: "Caching disabled" };
    if (!key) throw new Error("Key required");

    // Just set the key's value to null (mark as invalidated)
    const payload = ["SET", key, JSON.stringify(null)];

    const res = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Failed to invalidate key: ${res.status} ${txt}`);
    }

    return {
      success: true,
      message: `Cache invalidated (set to null) for ${key}`,
    };
  }
}

export const kv = new UpstashKV();
