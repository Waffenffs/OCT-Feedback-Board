import { db } from "@/app/firebase/firebaseConfig";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    onSnapshot,
} from "firebase/firestore";
import type { TUser } from "../context/AuthProvider";

export async function upvoteFeedback(feedbackId: string, profile: TUser) {
    try {
        const feedbackRef = doc(db, "posts", feedbackId);
        const feedbackSnap = await getDoc(feedbackRef);

        // Feedback does not exist
        if (!feedbackSnap || !feedbackSnap.exists()) {
            throw new Error("Feedback does not seem to exist!");
        }

        const feedbackData = feedbackSnap.data();

        if (feedbackData.upvoters.includes(profile?.email)) {
            // User has already upvoted

            const filteredUpvoters = feedbackData.upvoters.filter(
                (upvoter: any) => upvoter !== profile?.email
            );

            await updateDoc(feedbackRef, {
                upvotes: feedbackData.upvotes - 1,
                upvoters: filteredUpvoters,
            });
        } else {
            // User has not upvoted

            const updatedVoters = [...feedbackData.upvoters, profile?.email];

            await updateDoc(feedbackRef, {
                upvotes: feedbackData.upvotes + 1,
                upvoters: updatedVoters,
            });
        }
    } catch (error) {
        console.error(error);
    }
}

export async function getFeedbackTitle(feedbackId: string | undefined) {
    try {
        if (!feedbackId) throw new Error("Feedback ID does not seem to exist!");

        const feedbackRef = doc(db, "posts", feedbackId as string);
        const feedbackSnap = await getDoc(feedbackRef);

        if (!feedbackSnap.exists())
            throw new Error("Error fetching feedback data!");

        const feedbackData = feedbackSnap.data();
        const feedbackTitle = feedbackData.title;

        return feedbackTitle;
    } catch (error) {
        console.error(error);
    }
}

export async function getAuthorUID(uid: string) {
    try {
        const authorRef = doc(db, "users", uid);
        const authorSnap = await getDoc(authorRef);

        if (!authorSnap.exists())
            throw new Error("Author does not seem to exist!");

        const authorData = authorSnap.data();

        return authorData.user_identifier;
    } catch (error) {
        console.error(error);
    }
}

export async function getUserUID(uid: string) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) throw new Error("User does not seem to exist!");

        const userData = userSnap.data();

        return userData.user_identifier;
    } catch (error) {
        console.error(error);
    }
}

export async function getUserFeedbacks(uid: string) {
    const postsRef = collection(db, "posts");
    let q = query(postsRef, where("creator", "==", uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userFeedbacks: any[] = [];

        querySnapshot.forEach((doc) => {
            const feedbackData = doc.data();

            userFeedbacks.push(feedbackData);
        });

        return userFeedbacks;
    });

    return () => unsubscribe();
}
