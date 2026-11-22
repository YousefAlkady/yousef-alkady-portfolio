import Act1 from "@/components/Act1";
import LaterBeats from "@/components/LaterBeats";
import Preloader from "@/components/Preloader";
import StageCanvas from "@/components/StageCanvas";

export default function Page() {
  return (
    <>
    <main>
      <StageCanvas />
      <Act1 />
      <LaterBeats />
    </main>
    <Preloader />
    </>
  );
}
