export default function SignUp() {
    return (
        <div className="flex justify-center items-center w-full h-auto text-gray-800 font-sans overflow-hidden sm:h-[56rem]">
            <div className="w-1/2 flex flex-col items-center justify-center p-6 relative">
                <div className="w-full py-6">
                    <div className="flex justify-center items-center text-lg leading-none mx-auto w-36">
                        <h1 className="font-bold sm:text-xl flex flex-wrap flex-shrink-0 ">
                            <span
                                className="text-slate-500 text-3xl"
                                style={{ marginRight: "0.25rem" }}
                            >
                                Welcome
                            </span>
                            <span className="text-slate-700 text-3xl">to</span>
                        </h1>
                    </div>
                </div>

                <div className="w-[352px] flex-shrink-0 my-6 h-min">
                    <h1 className="text-2xl mb-6 text-center font-semibold ">
                        Sign Up
                    </h1>

                    <form className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Username"
                            className="border p-3 rounded-lg"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="border p-3 rounded-lg"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="border p-3 rounded-lg"
                        />

                        <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disable:opacity-80">
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>

            <div className="w-1/2 p-6 hidden  sm:block max-lg:h-1/2">
                <img
                    className="block object-cover w-full pt-3 h-full lg:h-[56rem]"
                    src="https://codetheworld.io/wp-content/uploads/2024/03/tokyo.jpg"
                />
            </div>
        </div>
    );
}
