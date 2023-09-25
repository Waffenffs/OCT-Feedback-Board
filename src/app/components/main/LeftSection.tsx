import { motion } from "framer-motion";

type TTags = "All" | "Academic" | "Faculty" | "Extracurricular" | "Technology";

type TLeftSectionProps = {
    currentTag: TTags;
    setCurrentTag: React.Dispatch<React.SetStateAction<TTags>>;
};

export default function LeftSection({
    currentTag,
    setCurrentTag,
}: TLeftSectionProps) {
    const tags: TTags[] = [
        "All",
        "Academic",
        "Faculty",
        "Extracurricular",
        "Technology",
    ];

    function handleTagClick(tag: TTags) {
        setCurrentTag(tag);
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
            className='hidden md:flex md:flex-row lg:flex-col md:gap-6 lg:gap-3 lg:w-1/4'
        >
            <div className='cursor-default bg-gradient-to-tr from-green-500 to-green-700 rounded-xl text-white pt-20 pb-4 px-7 shadow'>
                <h1 className='font-semibold tracking-wide text-xl'>
                    Olivarez College Tagaytay
                </h1>
                <h3 className='tracking-wide text-sm mt-1'>Feedback Board</h3>
            </div>

            <div className='bg-white shadow rounded px-3 py-7'>
                <h2 className='mb-5 font-bold tracking-wider text-[#373e68]'>
                    Tags
                </h2>
                <ul className='flex flex-row flex-wrap gap-4'>
                    {tags.map((tag, index) => {
                        return (
                            <li
                                onClick={() => handleTagClick(tag)}
                                className={`cursor-pointer rounded ${
                                    tag !== currentTag
                                        ? "bg-[#f2f4ff]"
                                        : "bg-blue-500"
                                } ${
                                    tag !== currentTag && "hover:bg-gray-200"
                                } transition py-1 px-3 tracking-wider font-semibold text-sm ${
                                    tag !== currentTag
                                        ? "text-blue-500"
                                        : "text-white"
                                }`}
                                key={index}
                            >
                                {tag}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </motion.div>
    );
}
