const worker = {
  async fetch(request, env) {
    let response = await env.ASSETS.fetch(request);

    if (
      response.status === 404 &&
      request.headers.get("accept")?.includes("text/html")
    ) {
      const fallbackUrl = new URL("/index.html", request.url);
      response = await env.ASSETS.fetch(new Request(fallbackUrl, request));
    }

    const headers = new Headers(response.headers);
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set(
      "Permissions-Policy",
      "camera=(), geolocation=(), payment=(), usb=()",
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

export default worker;
