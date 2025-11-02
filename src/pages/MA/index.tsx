// FILE: src/pages/MA/index.tsx
import { Link } from "react-router-dom";
import HudBox from "../../components/ui/HudBox";

export default function MA() {
  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-bold">MA</h1>
      <p className="text-slate-300">
        Wähle einen Bereich:
      </p>

      <div className="w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch max-w-2xl">
          <Link to="/ma/abrechnung" className="block">
            <HudBox padding="lg" className="h-full text-center cursor-pointer">
              <span className="text-lg font-semibold tracking-wide">PKL Abrechnung</span>
            </HudBox>
          </Link>

          <Link to="/ma/aufmass" className="block">
            <HudBox padding="lg" className="h-full text-center cursor-pointer">
              <span className="text-lg font-semibold tracking-wide">Aufmaß</span>
            </HudBox>
          </Link>

          <Link to="/ma/fahrtenberichte" className="block">
            <HudBox padding="lg" className="h-full text-center cursor-pointer">
              <span className="text-lg font-semibold tracking-wide">Fahrtenberichte</span>
            </HudBox>
          </Link>

          <Link to="/ma/zeitenberichte" className="block">
            <HudBox padding="lg" className="h-full text-center cursor-pointer">
              <span className="text-lg font-semibold tracking-wide">Zeitenberichte</span>
            </HudBox>
          </Link>
        </div>
      </div>
    </section>
  );
}
