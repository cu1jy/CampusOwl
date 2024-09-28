"use client";
import Navbar from "../components/Navbar";

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-100">
            <Navbar></Navbar>
            <div>
                <div className="container mx-auto py-4">
                    <h1 className="font-semibold pt-10 text-black text-3xl text-center mb-10">
                        Home
                    </h1>
                </div>
                <div>
                </div>
            </div>
        </main>
    )
}
