import { headers } from "next/headers";
import { Metadata } from "next";
import { getFeedbackTitle } from "@/app/utils/feedbackUtils";

import FeedbackContent from "./FeedbackContent";

export async function generateMetadata() {
    const url = new URL(headers().get("x-url")!);
    const id = url.searchParams.get("id")?.split("/")[0];
    const title = await getFeedbackTitle(id);

    const metadata: Metadata = {
        title: `${title} | OlivFeedbacks`,
    };

    return metadata;
}

export default function Page() {
    return <FeedbackContent />;
}
