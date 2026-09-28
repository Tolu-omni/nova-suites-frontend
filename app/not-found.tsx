import Link from 'next/link';
export default function NotFound(){return <main className="min-h-screen bg-[var(--nova-ivory)] px-6 pt-48 text-center"><p className="nova-eyebrow">404</p><h1 className="my-5 font-serif text-4xl">This room in our website is empty.</h1><Link className="underline" href="/rooms">Explore available rooms</Link></main>}
