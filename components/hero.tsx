import Image from "next/image";
import { Container } from "@/components/ui";
import { Parallax } from "@/components/motion";

type HeroProps = {
  image: string;
  /** Where the photo is anchored. On small screens the subject must stay in view. */
  position?: string;
  eyebrow: string;
  title: React.ReactNode;
  text: React.ReactNode;
  children?: React.ReactNode;     // call-to-action buttons
  footer?: React.ReactNode;       // small trust line under the buttons
  tall?: boolean;
};

/** Full-bleed cinematic hero: slow push-in, gentle parallax, left-weighted shade so text always reads. */
export function Hero({ image, position = "object-center", eyebrow, title, text, children, footer, tall = false }: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-deep text-white">
      <div className="absolute inset-0 -z-10">
        <Parallax className="absolute inset-x-0 -top-[8%] h-[118%]">
          <Image src={image} alt="" fill priority sizes="100vw" quality={72} className={`push-in object-cover ${position}`} />
        </Parallax>
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,38,44,.12)_0%,rgba(4,38,44,.3)_28%,rgba(4,38,44,.9)_60%,rgba(4,38,44,.97)_100%)] md:bg-[linear-gradient(90deg,rgba(4,38,44,.94)_0%,rgba(4,38,44,.78)_34%,rgba(4,38,44,.22)_70%,rgba(4,38,44,.05)_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-deep/60 to-transparent" />
      </div>
      <Container>
        <div className={`flex items-end pt-48 md:items-center md:py-24 ${tall ? "pb-36 md:pb-44" : "pb-12"} ${tall ? "min-h-[calc(100svh-4rem)] lg:min-h-[82svh]" : "min-h-[32rem] lg:min-h-[34rem]"}`}>
          <div className="max-w-2xl">
            <p className="rise mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-ink-deep/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-mint backdrop-blur-sm" style={{ "--d": "80ms" } as React.CSSProperties}>
              <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden="true" />{eyebrow}
            </p>
            <h1 className="rise text-[2.6rem] font-medium leading-[1.04] sm:text-6xl lg:text-7xl" style={{ "--d": "180ms" } as React.CSSProperties}>{title}</h1>
            <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl" style={{ "--d": "320ms" } as React.CSSProperties}>{text}</p>
            {children && <div className="rise mt-9 flex flex-wrap gap-3" style={{ "--d": "460ms" } as React.CSSProperties}>{children}</div>}
            {footer && <div className="rise mt-8" style={{ "--d": "600ms" } as React.CSSProperties}>{footer}</div>}
          </div>
        </div>
      </Container>
    </section>
  );
}
