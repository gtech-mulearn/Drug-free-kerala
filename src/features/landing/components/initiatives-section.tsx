import Image from "next/image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Container, Section } from "@/components/ui/layout";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import { initiatives } from "../content";

const number = (index: number) => String(index + 1).padStart(2, "0");

/**
 * Divi's split: sticky heading and index on the left, the four initiatives
 * on the right. Each portrait is shown near its native size (260 px) and
 * warms from a mint duotone to full colour while it is centred on screen.
 */
export function InitiativesSection() {
  return (
    <Section id="initiatives" tabIndex={-1} tone="surface" aria-labelledby="initiatives-title" className="outline-none">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div className="flex flex-col gap-5 lg:sticky lg:top-28">
            <Eyebrow data-reveal>{initiatives.eyebrow}</Eyebrow>
            <Heading id="initiatives-title" size="display" data-split>
              {initiatives.title}
            </Heading>
            <Text tone="muted" data-reveal className="max-w-sm">
              {initiatives.description}
            </Text>
            <ol aria-hidden="true" className="mt-6 hidden gap-3 lg:grid">
              {initiatives.items.map((item, index) => (
                <li
                  key={item.title}
                  data-spy={`initiative-${index}`}
                  className="flex items-baseline gap-4 text-muted-foreground transition-colors duration-500 ease-out-expo data-active:text-foreground"
                >
                  <span className="font-poster text-2xl leading-none">{number(index)}</span>
                  <span className="text-sm font-medium">{item.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <ol className="flex flex-col gap-16 lg:col-span-7 lg:col-start-6 lg:gap-24">
          {initiatives.items.map((item, index) => {
            const titleId = `initiative-${index}-title`;
            return (
              <li key={item.title} data-spy-target={`initiative-${index}`}>
                <article
                  aria-labelledby={titleId}
                  className="grid gap-6 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-10"
                >
                  <div data-warm className="relative aspect-3/5 w-full max-w-60 overflow-hidden rounded-panel sm:max-w-none">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      placeholder="blur"
                      sizes="240px"
                      className="object-cover"
                    />
                    <div data-warm-layer className="absolute inset-0">
                      <Image src={item.image} alt="" fill sizes="240px" className="object-cover grayscale" />
                      <span className="absolute inset-0 bg-brand/75 mix-blend-multiply" />
                    </div>
                  </div>

                  <div data-reveal className="flex flex-col items-start gap-4 sm:pt-3">
                    <span className="font-poster text-5xl leading-none text-highlight">{number(index)}</span>
                    <Heading as="h3" id={titleId} size="title">
                      {item.title}
                    </Heading>
                    <Tag>{item.tag}</Tag>
                    <Text tone="muted">{item.description}</Text>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
