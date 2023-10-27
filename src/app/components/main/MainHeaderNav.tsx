"use client";

import { auth } from "@/app/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { motion } from "framer-motion";
import { FeedbackContext } from "@/app/context/FeedbackProvider";
import { HiOutlineLightBulb } from "react-icons/hi";
import { HiBars3 } from "react-icons/hi2";

type TMainHeaderNav = {
    setPostCreationToggled: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function MainHeaderNav({
    setPostCreationToggled,
}: TMainHeaderNav) {
    const contextValue = useContext(FeedbackContext);
    const router = useRouter();
    const { feedbackAmount } = contextValue || {};

    function handleSignOut() {
        signOut(auth)
            .then(() => {
                console.log("Sign out successful.");

                return router.push("/");
            })
            .catch((error) => {
                console.log(`Error with signing out: ${error}`);
            });
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
        >
            <nav className='md:hidden flex flex-col'>
                <header className='flex flex-row justify-between items-center bg-gradient-to-tr from-emerald-500 to-lime-600 py-5 px-4'>
                    <section>
                        <h1 className='text-white font-semibold tracking-wider text-lg'>
                            OCT Feedback Board
                        </h1>
                    </section>
                    <button>
                        <HiBars3 className='text-2xl text-white' />
                    </button>

                    {/* 1. Implement LeftSection in Mobile UI
                    2. Implement Sign Out Option */}
                </header>
            </nav>

            <div className='md:rounded-xl md:mx-10 lg:px-10 flex flex-row items-center px-4 py-3 bg-[#373e68] text-white text-sm tracking-wider whitespace-nowrap'>
                <div className='flex flex-row items-center gap-1 relative w-48'>
                    <div className='flex flex-row items-center gap-2 font-bold tracking-wider text-lg md:text-xl mr-10'>
                        <HiOutlineLightBulb className='text-3xl' />
                        <span>
                            {" "}
                            {feedbackAmount !== undefined &&
                                feedbackAmount.toString()}
                        </span>
                        <span>Suggestions</span>
                    </div>
                </div>
                <button
                    onClick={() => setPostCreationToggled(true)}
                    className='ml-auto bg-[#ae1feb] rounded-full py-3 px-3'
                >
                    <span className='font-bold tracking-wider'>
                        + Add Feedback
                    </span>
                </button>
            </div>
        </motion.div>
    );
}
