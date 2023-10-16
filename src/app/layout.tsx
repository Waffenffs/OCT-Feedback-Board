import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "./context/AuthProvider";
import { FeedbackProvider } from "./context/FeedbackProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "OlivFeedbacks",
    description: "A platform of expression for Olivarians.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang='en'>
            <body
                className={`${inter.className} h-screen w-screen text-black relative`}
            >
                <AuthProvider>
                    <FeedbackProvider>{children}</FeedbackProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
