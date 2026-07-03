import Footer from "./_components/footer";
import Header from "./_components/header";
import CTA from "./_components/landing-page/cta";
import Faq from "./_components/landing-page/faq";
import Features from "./_components/landing-page/features";
import Hero from "./_components/landing-page/hero";
import Pricing from "./_components/landing-page/pricing";

export default function Home() {
  return (
    <>
      <main>
        <Header />
        <Hero />
        <Features />
        <Pricing />
        <Faq />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
