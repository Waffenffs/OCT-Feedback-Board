import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { headers } from "next/headers";
import { Metadata } from "next";

import FeedbackContent from "./FeedbackContent";

export async function generateMetadata() {
    const url = new URL(headers().get("x-url")!);
    const id = url.searchParams.get("id")?.split("/")[0];

    const title = await getFeedbackTitle();

    async function getFeedbackTitle() {
        try {
            if (!id) throw new Error("Feedback ID does not exist");

            const docRef = doc(db, "posts", id as string);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) throw new Error("Feedback does not exist!");

            const feedbackTitle = docSnap.data().title;

            return feedbackTitle;
        } catch (error) {
            console.error(error);
        }
    }

    const metadata: Metadata = {
        title: title,
    };

    return metadata;
}

export default function Page() {
    return <FeedbackContent />;
}
