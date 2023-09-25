import Link from "next/link";

type TAuthModalProps = {
    mode: "register" | "login";
    emailValue: string;
    emailHandler: React.Dispatch<React.SetStateAction<string>>;
    passwordValue: string;
    passwordHandler: React.Dispatch<React.SetStateAction<string>>;
    authHandler(email: string, password: string): void;
};

export default function AuthModal({
    mode,
    emailValue,
    emailHandler,
    passwordValue,
    passwordHandler,
    authHandler,
}: TAuthModalProps) {
    function handleSubmit(e: any) {
        e.preventDefault();
    }

    return (
        <form
            onSubmit={(e) => handleSubmit(e)}
            className='shadow-xl rounded-xl mt-8 z-10 bg-white md:w-96 md:h-[30rem]'
        >
            <header className='py-4 px-10 bg-gradient-to-tr from-emerald-500 to-lime-600 rounded-t-xl'>
                <h1 className='text-center text-white text-xl tracking-wide font-semibold'>
                    OCT Feedback Board
                </h1>
            </header>
            <h2 className='text-center mt-2 text-sm tracking-wide text-slate-600'>
                Educating the Mind. Body. Soul.
            </h2>
            {mode === "login" ? (
                <>
                    <div className='mt-7 px-5 md:mt-16'>
                        <h3 className='font-semibold text-slate-500 tracking-wide text-sm'>
                            Email
                        </h3>
                        <input
                            type='text'
                            placeholder='Your student email here...'
                            value={emailValue}
                            onChange={(e) => emailHandler(e.target.value)}
                            className='placeholder:text-sm placeholder:tracking-wide mt-1 border rounded indent-2 outline-none py-2 w-full'
                        />
                        <h3 className='font-semibold text-slate-500 tracking-wide text-sm mt-5'>
                            Password
                        </h3>
                        <input
                            type='password'
                            placeholder='Your password here...'
                            value={passwordValue}
                            onChange={(e) => passwordHandler(e.target.value)}
                            className='placeholder:text-sm placeholder:tracking-wide mt-1 border rounded indent-2 outline-none py-2 w-full'
                        />
                    </div>
                    <div className='w-full flex flex-col justify-center items-center pb-5'>
                        <button
                            onClick={() =>
                                authHandler(emailValue, passwordValue)
                            }
                            className='w-36 mt-7 md:mt-14 text-white font-semibold tracking-wide bg-gradient-to-tr from-emerald-500 to-lime-600 rounded py-2 px-10'
                        >
                            Login
                        </button>
                        <footer className='text-center mt-6 text-slate-600 text-sm max-w-[15rem]'>
                            Do&apos;t have an account yet? You can{" "}
                            <Link
                                href='/register'
                                className='cursor-pointer text-blue-500'
                            >
                                register
                            </Link>{" "}
                            now!
                        </footer>
                    </div>
                </>
            ) : (
                <>
                    <div className='mt-7 px-5 md:mt-16'>
                        <h3 className='font-semibold text-slate-500 tracking-wide text-sm'>
                            Email
                        </h3>
                        <input
                            type='text'
                            placeholder='Your student email here...'
                            value={emailValue}
                            onChange={(e) => emailHandler(e.target.value)}
                            className='placeholder:text-sm placeholder:tracking-wide mt-1 border rounded indent-2 outline-none py-2 w-full'
                        />
                        <h3 className='font-semibold text-slate-500 tracking-wide text-sm mt-5'>
                            Password
                        </h3>
                        <input
                            type='password'
                            placeholder='Your password here...'
                            value={passwordValue}
                            onChange={(e) => passwordHandler(e.target.value)}
                            className='placeholder:text-sm placeholder:tracking-wide mt-1 border rounded indent-2 outline-none py-2 w-full'
                        />
                    </div>
                    <div className='w-full flex flex-col justify-center items-center pb-5'>
                        <button
                            onClick={() =>
                                authHandler(emailValue, passwordValue)
                            }
                            className='w-36 mt-7 md:mt-14 text-white font-semibold tracking-wide bg-gradient-to-tr from-emerald-500 to-lime-600 transition hover:bg-blue-500 rounded py-2 px-10'
                        >
                            Register
                        </button>
                        <footer className='text-center mt-6 text-slate-600 text-sm max-w-[15rem]'>
                            Already have an account? You can{" "}
                            <Link
                                href='/'
                                className='cursor-pointer text-blue-500'
                            >
                                login
                            </Link>{" "}
                            now!
                        </footer>
                    </div>
                </>
            )}
        </form>
    );
}
