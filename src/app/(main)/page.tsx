import Link from "next/link";
import Hero from "./_components/Hero";
import Statistics from "./_components/Statistics";
import ReportList from "./_components/ReportList";
import NewestReport from "./_components/NewestReport";
import Transparency from "./_components/Transparency";
import Maps from "./_components/Maps";
import HowItWorks from "./_components/HowItWorks";
import CTA from "./_components/CTA";

export default function HomePage() {
  return (
    <main>
      <Hero />

      <Statistics />

      <ReportList />

      <NewestReport />

      <Transparency />

      <Maps />

      <HowItWorks />

      {/* <CTA /> */}
    </main>
  );
}