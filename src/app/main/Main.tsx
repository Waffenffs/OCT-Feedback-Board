"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthProvider";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";

import PostCreation from "../components/main/PostCreation";
import MainHeaderNav from "../components/main/MainHeaderNav";
import Content from "../components/main/Content";
import LeftSection from "../components/main/LeftSection";
import SuccessPostCreationModal from "../components/main/SuccessPostCreationModal";
import Loading from "../components/Loading";

type TTags = "All" | "Academic" | "Faculty" | "Extracurricular" | "Technology";

export default function Main() {
    const router = useRouter();
    const { ...profileProps } = useContext(AuthContext);
    const { profile } = profileProps;

    const [isNotMounted, setIsNotMounted] = useState(true);
    const [postCreationToggled, setPostCreationToggled] = useState(false);
    const [latestCreatedFeedbackId, setLatestCreatedFeedbackId] =
        useState<string>("undefined");
    const [postCreationSuccessful, setPostCreationSuccessful] =
        useState<boolean>(false);
    const [currentTag, setCurrentTag] = useState<TTags>("All");

    useEffect(() => {
        if (profile === undefined) return;

        setIsNotMounted(false);

        if (!profile.authenticated) return router.push("/");
    }, [isNotMounted, profile, router]);

    if (isNotMounted) {
        return <Loading />;
    }

    return (
        <main className='w-screen h-screen bg-[#f7f8fd] md:flex lg:flex-row lg:pt-10 md:flex-col gap-10 lg:justify-center overflow-x-hidden overflow-y-auto relative'>
            <AnimatePresence>
                {postCreationSuccessful && (
                    <SuccessPostCreationModal
                        setPostCreationSuccessful={setPostCreationSuccessful}
                        latestCreatedFeedbackId={latestCreatedFeedbackId}
                    />
                )}
            </AnimatePresence>
            <LeftSection
                currentTag={currentTag}
                setCurrentTag={setCurrentTag}
            />
            <section className='lg:w-3/5 '>
                <MainHeaderNav
                    setPostCreationToggled={setPostCreationToggled}
                    currentTag={currentTag}
                    setCurrentTag={setCurrentTag}
                />
                <Content tag={currentTag} />
            </section>
            <AnimatePresence>
                {postCreationToggled && (
                    <PostCreation
                        setPostCreationToggled={setPostCreationToggled}
                        setLatestCreatedFeedbackId={setLatestCreatedFeedbackId}
                        setPostCreationSuccessful={setPostCreationSuccessful}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}
