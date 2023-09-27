"use client";

import { auth } from "@/app/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FeedbackContext } from "@/app/context/FeedbackProvider";
import { HiOutlineLightBulb } from "react-icons/hi";

type TMainHeaderNav = {
    setPostCreationToggled: React.Dispatch<React.SetStateAction<boolean>>;
};

export function MainHeaderNav({ setPostCreationToggled }: TMainHeaderNav) {
    const contextValue = useContext(FeedbackContext);
    const { feedbackAmount } = contextValue || {};

    const [optionsActive, setOptionsActive] = useState(false); // hidden by default

    const options: ("Most Upvotes" | "Least Upvotes" | "Date")[] = [
        "Most Upvotes",
        "Least Upvotes",
        "Date",
    ]; // Filter through items that aren't the current optionp
    const router = useRouter();

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
            transition={{ delay: 2 }}
        >
            <nav className='md:hidden flex flex-col'>
                <header className='flex flex-row items-center bg-gradient-to-tr from-emerald-500 to-lime-600 py-6 px-4'>
                    <section>
                        <h1 className='text-white font-semibold tracking-wider text-lg'>
                            OCT Feedback Board
                        </h1>
                    </section>
                    <button
                        onClick={() => handleSignOut()}
                        className='text-white ml-auto cursor-pointer border-2 py-2 px-3'
                    >
                        <h3 className='font-semibold tracking-wider'>
                            Sign Out
                        </h3>
                    </button>
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
                    {/* <span>Sort By</span>
                    <span>:</span>
                    <button
                        onClick={() =>
                            setOptionsActive((prevState) => !prevState)
                        }
                        className='font-bold flex flex-row items-center gap-1'
                    >
                        {currentOption}{" "}
                        <BiSolidChevronDown className='text-xl' />
                    </button> */}
                    {/* <AnimatePresence>
                        {optionsActive && (
                            <motion.div
                                initial={{ opacity: 0, scale: 1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ul className='absolute z-10 bg-white rounded top-7 right-1 lg:-right-[14.5rem] border-2 shadow-xl'>
                                    {options
                                        .filter(
                                            (option) => option !== currentOption
                                        )
                                        .map(
                                            (
                                                option:
                                                    | "Most Upvotes"
                                                    | "Least Upvotes"
                                                    | "Date",
                                                index
                                            ) => {
                                                return (
                                                    <li
                                                        onClick={() =>
                                                            handleOptionSelection(
                                                                option
                                                            )
                                                        }
                                                        key={index}
                                                        className='cursor-pointer rounded hover:bg-gray-200 transition py-1 px-3 tracking-wider font-semibold text-sm text-blue-500'
                                                    >
                                                        {option}
                                                    </li>
                                                );
                                            }
                                        )}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence> */}
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
