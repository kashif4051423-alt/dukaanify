import { Navigation } from '@/components/landing/Navigation'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { TechStackSection } from '@/components/landing/TechStackSection'
import { ReviewsSection } from '@/components/landing/ReviewsSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { Founder3DSection } from '@/components/landing/Founder3DSection'
import { CTASection } from '@/components/landing/CTASection'
import { ContactSection } from '@/components/landing/ContactSection'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TechStackSection />
      <ReviewsSection />
      <PricingSection />
      <Founder3DSection />
      <CTASection />
      <div id="contact">
        <ContactSection />
      </div>
      <Footer />
    </main>
  )
}
