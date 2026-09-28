'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="min-h-screen px-6 pt-48 text-center"><h1 className="font-serif text-3xl">We could not load this page.</h1><p className="my-4">Your information has not been submitted. Please try again.</p><button className="min-h-11 rounded border px-6" onClick={reset}>Try again</button></main>}
