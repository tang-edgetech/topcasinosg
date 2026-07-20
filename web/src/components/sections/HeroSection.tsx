import Link from "next/link";
import { field, mediaUrl, sectionClassName, buttonClassName, type PageSection } from "@/lib/pages";

export default function HeroSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const subheading = field(section.fields, 0, "subheading")?.textValue ?? "";
  const image = mediaUrl(field(section.fields, 0, "image")?.mediaUrl);
  const button = field(section.fields, 0, "button");
  const buttonStyle = field(section.fields, 0, "buttonStyle")?.textValue;

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--hero", section)}>
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-6 py-20">
        {heading && <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{heading}</h1>}
        {subheading && <p className="max-w-2xl text-lg text-primary-100">{subheading}</p>}
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={heading} className="w-full max-w-3xl rounded-xl object-cover" />
        )}
        {button?.textValue && button.urlValue && (
          <Link href={button.urlValue} className={buttonClassName(buttonStyle)}>
            {button.textValue}
          </Link>
        )}
      </div>
    </section>
  );
}
