"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthProvider";
import { useRouter } from "next/navigation";
import { MainHeaderNav } from "../components/main/MainHeaderNav";
import { PostCreation } from "../components/main/PostCreation";
import { AnimatePresence, motion } from "framer-motion";
import Content from "../components/Content";
import LeftSection from "../components/main/LeftSection";

export default function Main() {
    const router = useRouter();
    const { ...profileProps } = useContext(AuthContext);
    const { profile } = profileProps;

    const [isNotMounted, setIsNotMounted] = useState(true);
    const [postCreationToggled, setPostCreationToggled] = useState(false);
    const [currentOption, setCurrentOption] = useState<
        "Most Upvotes" | "Least Upvotes" | "Date"
    >("Most Upvotes");
    const [currentTag, setCurrentTag] = useState<
        "All" | "Academic" | "Faculty" | "Extracurricular" | "Technology"
    >("All");

    useEffect(() => {
        if (profile === undefined) return; // wait for it to load

        setIsNotMounted(false);

        if (!profile.authenticated) return router.push("/");
    }, [isNotMounted, profile, router]);

    if (isNotMounted) {
        return <div>Loading...</div>;
    }

    // TO-DO:
    // 1. Work on desktop port of main
    // Work on right section
    // 2. Work on content page of feedback

    return (
        <main className='w-screen h-screen bg-[#f7f8fd] md:flex lg:flex-row md:flex-col md:px-20 gap-10 lg:justify-center md:pt-7 overflow-y-auto relative'>
            <LeftSection
                currentTag={currentTag}
                setCurrentTag={setCurrentTag}
            />
            <section className='lg:w-3/5 '>
                <MainHeaderNav
                    currentOption={currentOption}
                    setCurrentOption={setCurrentOption}
                    setPostCreationToggled={setPostCreationToggled}
                />
                <Content option={currentOption} tag={currentTag} />
            </section>
            <AnimatePresence>
                {postCreationToggled && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <PostCreation
                            setPostCreationToggled={setPostCreationToggled}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
