import type { Metadata } from 'next';
import HeroSection      from '@/components/home/HeroSection';
import SearchBar        from '@/components/home/SearchBar';
import FeaturedRooms    from '@/components/home/FeaturedRooms';
import AboutSection     from '@/components/home/AboutSection';
import AmenitiesSection from '@/components/home/AmenitiesSection';
import DiningSection    from '@/components/home/DiningSection';
import GalleryPreview   from '@/components/home/GalleryPreview';
import CTASection       from '@/components/home/CTASection';

export const metadata: Metadata = {
  title: 'Nova Suites — Luxury Hotel & Suites',
  description:
    'Experience unparalleled luxury at Nova Suites. Premium rooms, world-class dining, spa, and exceptional service in the heart of Lagos.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SearchBar />
      <FeaturedRooms />
      <AboutSection />
      <AmenitiesSection />
      <DiningSection />
      <GalleryPreview />
      <CTASection />
    </>
  );
}
