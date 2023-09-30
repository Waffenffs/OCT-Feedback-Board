import { motion } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";

export type TStatusModalProps = {
    type: "user_authentication" | "user_database_write" | undefined;
    isSuccess: boolean | undefined;
    message: string | undefined;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function StatusModal({
    type,
    isSuccess,
    message,
    setShowModal,
}: TStatusModalProps) {
    return (
        <motion.article
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className='absolute top-0 w-full flex justify-center items-center z-50'
        >
            <div
                className={` ${
                    isSuccess ? "bg-green-500" : "bg-red-500"
                } mt-3 px-6 py-3 rounded shadow-xl text-sm text-white flex flex-row max-sm:w-80 justify-between self-center `}
            >
                <div className='md:w-3/4'>
                    <h1 className='text-xl tracking-wider font-semibold'>
                        {type === "user_authentication"
                            ? "Authentication"
                            : "Database Write/Read"}
                    </h1>
                    <p>{message}</p>
                </div>

                <button onClick={() => setShowModal(false)}>
                    <AiOutlineClose className={`text-white text-2xl`} />
                </button>
            </div>
        </motion.article>
    );
}
