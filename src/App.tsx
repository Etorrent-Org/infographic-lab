import { AugmentedStudioV2 } from "./AugmentedStudio.v2";
import { GenerationPreferencesBar } from "./GenerationPreferencesBar";
import { PreviewModalEnhancement } from "./PreviewModalEnhancement";

export function App() {
  return (
    <>
      <AugmentedStudioV2 />
      <PreviewModalEnhancement />
      <GenerationPreferencesBar />
    </>
  );
}
