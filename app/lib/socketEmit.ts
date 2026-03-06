/**
 * socketEmit.ts
 *
 * Smart socket emitter that works in BOTH environments:
 *
 * LOCAL DEV (npm run dev → server.js):
 *   server.js sets globalThis._io when it boots.
 *   We emit directly — no HTTP call, instant, zero latency.
 *
 * PRODUCTION (Vercel serverless):
 *   globalThis._io is never set (serverless = no persistent process).
 *   We POST to the Render socket server's /emit endpoint instead.
 */

export async function socketEmit(event: string, data?: unknown): Promise<void> {

    // ── LOCAL DEV ─────────────────────────────────────────────────────────────
    // server.js runs Socket.IO in the same Node process as Next.js,
    // so globalThis._io is available here. Use it directly — fastest path.
    const io = (globalThis as any)._io;
    if (io) {
        io.emit(event, data ?? null);
        console.log(`[socketEmit] local emit → event="${event}"`);
        return;
    }

    // ── PRODUCTION (Vercel) ───────────────────────────────────────────────────
    // No persistent process → globalThis._io doesn't exist.
    // Call the Render socket server via HTTP.
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    if (!socketUrl) {
        console.warn('[socketEmit] NEXT_PUBLIC_SOCKET_URL is not set. Event not emitted:', event);
        return;
    }

    const secret = process.env.SOCKET_EMIT_SECRET || '';

    try {
        const res = await fetch(`${socketUrl}/emit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, event, data: data ?? null }),
            // Short timeout — a slow socket server shouldn't block API responses
            signal: AbortSignal.timeout(4000),
        });

        if (!res.ok) {
            const text = await res.text();
            console.warn(`[socketEmit] /emit returned ${res.status}: ${text}`);
        } else {
            console.log(`[socketEmit] render emit → event="${event}"`);
        }
    } catch (err) {
        // Non-fatal: API response still goes through. Clients use polling fallback.
        console.warn('[socketEmit] Could not reach socket server:', (err as Error).message);
    }
}
