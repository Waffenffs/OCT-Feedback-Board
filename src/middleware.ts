import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const tokenHeaders = new Headers(request.headers);
    tokenHeaders.set("x-url", request.url);

    const response = NextResponse.next({
        request: {
            headers: tokenHeaders,
        },
    });

    return response;
}

export const config = {
    matcher: "/feedback/:path*",
};
