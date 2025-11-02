// FILE: src/pages/home/Home.tsx
import { Link } from "react-router-dom";
import HudBox from "../../components/ui/HudBox";

export default function Home() {
  return (
    <section className="w-full flex justify-center py-10">
      {/* Zentrale Button-Zone: mobil untereinander, Desktop nebeneinander */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch max-w-xl w-full">
        <Link to="/ma" className="block">
          <HudBox title=" " padding="lg" className="h-full text-center cursor-pointer">
            <span className="text-xl font-semibold tracking-wide">MA</span>
          </HudBox>
        </Link>

        <Link to="/pkl" className="block">
          <HudBox title=" " padding="lg" className="h-full text-center cursor-pointer">
            <span className="text-xl font-semibold tracking-wide">PKL</span>
          </HudBox>
        </Link>
      </div>
    </section>
  );
}
