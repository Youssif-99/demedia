import { NextRequest, NextResponse } from "next/server";

// Proxy all /api/* requests from Next to the real backend,
// so the frontend can always call same-origin "/api/...".
// In production, set BACKEND_URL to the backend base (e.g., https://your-backend.railway.app).
// In development, it defaults to http://localhost:5000.

const getBackendBase = () => {
	const isProd = process.env.NODE_ENV === "production";
	const envUrl = process.env.BACKEND_URL?.trim();
	if (isProd) return envUrl || ""; // if empty in prod, platform routing must handle /api
	return envUrl || "http://localhost:5000";
};

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
	return proxy(req, params);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
	return proxy(req, params);
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
	return proxy(req, params);
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
	return proxy(req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
	return proxy(req, params);
}

async function proxy(req: NextRequest, { path }: { path: string[] }) {
	const backendBase = getBackendBase();
	if (!backendBase) {
		// In production without BACKEND_URL, we expect platform ingress to route /api directly to backend
		// Return 502 to make the misconfiguration obvious (and avoid HTML 404 from Next)
		return NextResponse.json({ error: "Backend URL not configured" }, { status: 502 });
	}

	const targetUrl = joinUrl(backendBase, "/api/" + (path?.join("/") || ""));

	const headers = new Headers(req.headers);
	// Ensure host header is set to backend host, and forward auth
	headers.set("host", new URL(backendBase).host);

	const init: RequestInit = {
		method: req.method,
		headers,
		redirect: "manual",
	};

	if (req.method !== "GET" && req.method !== "HEAD") {
		const body = await req.arrayBuffer();
		(init as any).body = body;
	}

	try {
		const res = await fetch(targetUrl, init);
		const resHeaders = new Headers(res.headers);
		// Strip hop-by-hop headers
		resHeaders.delete("transfer-encoding");
		resHeaders.delete("connection");
		return new NextResponse(res.body, { status: res.status, headers: resHeaders });
	} catch (err: any) {
		return NextResponse.json({ error: "Upstream fetch failed", details: err?.message || "" }, { status: 502 });
	}
}

function joinUrl(base: string, path: string) {
	if (base.endsWith("/")) base = base.slice(0, -1);
	return base + path;
}


