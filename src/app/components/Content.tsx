"use client";

import { useEffect, useState, useContext } from "react";
import { db } from "../firebase/firebaseConfig";
import {
    query,
    orderBy,
    collection,
    onSnapshot,
    updateDoc,
    doc,
    getDoc,
    where,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthProvider";
import { FeedbackContext } from "../context/FeedbackProvider";

import FeedbackCardLoading from "./main/FeedbackCardLoading";
import FeedbackCard from "./main/FeedbackCard";
import Loading from "./Loading";

type TContentOptions = {
    tag: "All" | "Academic" | "Extracurricular" | "Technology" | "Faculty";
};

export default function Content({ tag }: TContentOptions) {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { ...profileProps } = useContext(AuthContext);
    const contextValue = useContext(FeedbackContext);
    const { setFeedbackContext } = contextValue || {};
    const { profile } = profileProps;

    async function fetchContentInitially() {
        const postRef = collection(db, "posts");

        let q;

        if (tag === "All") {
            q = query(postRef, orderBy("upvotes", "desc"));
        } else {
            q = query(postRef, where("tag", "==", tag));
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const firestoreFeedbacks: any = [];

            querySnapshot.forEach((doc) => {
                const documentData = { ...doc.data(), id: doc.id };

                firestoreFeedbacks.push(documentData);
            });

            setFeedbacks(firestoreFeedbacks);
        });

        return () => unsubscribe();
    }

    async function upvoteFeedback(userId: string) {
        try {
            const feedbackRef = doc(db, "posts", userId);
            const feedbackSnap = await getDoc(feedbackRef);

            if (alreadyUpvoted(userId)) {
                const filteredUpvoters = feedbackSnap
                    .data()
                    ?.upvoters.filter(
                        (upvoter: any) => upvoter !== profile?.email
                    );

                await updateDoc(feedbackRef, {
                    upvotes: feedbackSnap.data()?.upvotes - 1,
                    upvoters: filteredUpvoters,
                });
            } else {
                const updatedUpvoters = feedbackSnap.data()?.upvoters;
                updatedUpvoters.push(profile?.email);

                await updateDoc(feedbackRef, {
                    upvotes: feedbackSnap.data()?.upvotes + 1,
                    upvoters: updatedUpvoters,
                });
            }
        } catch (error) {
            console.error(`Error with upvoting: ${error}`);
        }
    }

    function alreadyUpvoted(userId: string): boolean {
        const feedback = feedbacks.filter((feedback) => feedback.id === userId);
        const email = profile && profile.email;

        if (email !== undefined && email !== null) {
            if (feedback[0].upvoters.includes(email)) {
                return true;
            }
        } else {
            console.error(`Email does not seem to persist.`);
        }

        return false;
    }

    function sortFeedbacksByTag() {
        let tagUpdatedFeedbacks: any[] = [];

        feedbacks.map((feedback) => {
            if (feedback.tag !== tag) {
                tagUpdatedFeedbacks.push(feedback);
            } else {
                tagUpdatedFeedbacks.unshift(feedback);
            }
        });

        setFeedbacks(tagUpdatedFeedbacks);
    }

    useEffect(() => {
        fetchContentInitially();
        setLoading(false);
    }, [loading]);

    useEffect(() => {
        sortFeedbacksByTag();
    }, [tag]);

    useEffect(() => {
        if (setFeedbackContext) {
            setFeedbackContext(feedbacks.length);
        }
    }, [feedbacks]);

    const ContentLoading = () => {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5 }}
                className='w-full h-full flex flex-col  mt-5 max-sm:items-center gap-3 md:px-10'
            >
                <FeedbackCardLoading />
                <FeedbackCardLoading />
                <FeedbackCardLoading />
                <FeedbackCardLoading />
            </motion.div>
        );
    };

    const ContentLoaded = () => {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                className='w-full h-full flex flex-col  mt-5 max-sm:items-center gap-3 md:px-10'
            >
                {feedbacks.map((feedback, index) => {
                    const isLastFeedback = index === feedbacks.length - 1;

                    return (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, scale: 1, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{
                                delay: 0.1,
                                duration: 0.5,
                            }}
                        >
                            <FeedbackCard
                                creation_date={feedback.creation_date}
                                creator_email={feedback.creator_email}
                                id={feedback.id}
                                post_comments_length={
                                    feedback.post_comments.length
                                }
                                reason={feedback.reason}
                                tag={feedback.tag}
                                title={feedback.title}
                                upvotes_count={feedback.upvotes}
                                upvoters={feedback.upvoters}
                                post_comments={feedback.post_comments}
                                upvotes={feedback.upvotes}
                                upvoteFeedback={upvoteFeedback}
                                isLastFeedback={isLastFeedback}
                            />
                        </motion.div>
                    );
                })}
            </motion.div>
        );
    };

    return feedbacks.length === 0 ? <ContentLoading /> : <ContentLoaded />;
}
