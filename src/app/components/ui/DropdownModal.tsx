"use client";

import { TOptions } from "@/app/feedback/[id]/FeedbackContent";
import { useState } from "react";
import { BiSolidChevronDown, BiSolidChevronUp } from "react-icons/bi";

type TDropDownModalProps = {
    options: string[];
    selectedOption: string;
    selectOptionStateSetter: React.Dispatch<React.SetStateAction<TOptions>>;
};

export default function DropdownModal({
    options,
    selectedOption,
    selectOptionStateSetter,
}: TDropDownModalProps) {
    const [showModal, setShowModal] = useState(false);

    const inactiveOptions = options
        .filter((option) => option !== selectedOption)
        .map((option, index) => (
            <li
                key={index}
                onClick={() => {
                    selectOptionStateSetter(option as TOptions);
                    setShowModal(false);
                }}
                className='py-1 w-36 px-3 flex justify-start items-center cursor-pointer hover:bg-gray-200 transition'
            >
                <h3 className='tracking-wide text-slate-800 text-sm'>
                    {option}
                </h3>
            </li>
        ));

    return (
        <div className='relative'>
            <button
                className='py-1 pl-3 pr-2 w-36 rounded bg-white border flex justify-between items-center cursor-pointer'
                onClick={() => setShowModal((prevState) => !prevState)}
            >
                <h3 className='tracking-wide text-slate-800 text-sm'>
                    {selectedOption}
                </h3>
                {showModal ? (
                    <BiSolidChevronUp className='text-blue-500 text-lg' />
                ) : (
                    <BiSolidChevronDown className='text-blue-500 text-lg' />
                )}
            </button>
            {showModal && (
                <ul className='bg-white absolute border rounded shadow-xl top-8'>
                    {inactiveOptions}
                </ul>
            )}
        </div>
    );
}
