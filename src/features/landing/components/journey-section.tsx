import { Container, Section, SectionHeader } from "@/components/ui/layout";
import { journey } from "../content";
import { JourneyGallery } from "./journey-gallery";

export function JourneySection() {
  return (
    <Section id="journey" tabIndex={-1} aria-labelledby="journey-title" className="pb-0 outline-none">
      <Container>
        <SectionHeader
          titleId="journey-title"
          title={
            <>
              {journey.title.light}: <strong>{journey.title.bold}</strong>
            </>
          }
          description={journey.description}
        />
        <JourneyGallery items={journey.items} />
      </Container>
    </Section>
  );
}
