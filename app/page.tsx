import { PenLine, Users2, LayoutGrid, Download, Sparkles } from "lucide-react";
import StartBoardButton from "@/components/landing/StartBoardButton";
import HeroSketch from "@/components/landing/HeroSketch";

const STEPS = [
  {
    n: "01",
    title: "Start a board",
    body: "Click once and you're already in a blank canvas. No account screen, no workspace setup.",
  },
  {
    n: "02",
    title: "Share the link",
    body: "Copy the invite link and send it however you talk to people. Anyone who opens it can draw.",
  },
  {
    n: "03",
    title: "Think out loud",
    body: "Sketch boxes, arrows, and notes side by side. Cursors and changes show up for everyone, instantly.",
  },
];

const FEATURES = [
  {
    icon: PenLine,
    title: "Looks like pen on paper",
    body: "Every box, line, and arrow gets sketchy, slightly imperfect edges — so a rough idea still looks like one.",
    color: "text-violet-glow",
  },
  {
    icon: Users2,
    title: "See where everyone's pointing",
    body: "Named, colored cursors move in real time, so the board feels like a shared desk, not a shared file.",
    color: "text-teal",
  },
  {
    icon: LayoutGrid,
    title: "Eight tools, nothing else",
    body: "Select, rectangle, ellipse, line, arrow, pen, text, eraser. The shapes you reach for, and nothing competing for attention.",
    color: "text-coral",
  },
  {
    icon: Download,
    title: "Take it with you",
    body: "Export the board as a PNG whenever you want. The link keeps working for whoever you shared it with.",
    color: "text-sand",
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-display text-lg font-semibold">
          <Sparkles size={18} className="text-violet-glow" />
          Inkboard
        </div>
        <StartBoardButton className="!px-4 !py-2 text-xs" />
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 px-6 pb-24 pt-10 md:grid-cols-2 md:pt-20">
        <div>
          <p className="mb-4 inline-block rounded-full border border-ink-line bg-ink-surface px-3 py-1 text-xs font-medium text-ink-muted">
            No sign-up — just a link
          </p>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Draw it.
            <br />
            Don&apos;t explain it.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted">
            Inkboard is a shared whiteboard that feels like a notebook. Open a board, send the
            link, and sketch through the idea together — out loud, in real time.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <StartBoardButton />
            <span className="text-sm text-ink-muted">Free · no email · no login</span>
          </div>
        </div>

        <div className="sketch-in flex justify-center">
          <div className="rounded-2xl border border-ink-line bg-ink-surface p-5 shadow-2xl shadow-black/40">
            <HeroSketch />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-6xl border-t border-ink-line px-6 py-20">
        <h2 className="font-display text-2xl font-semibold">How it works</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <p className="font-hand text-4xl text-violet-glow">{s.n}</p>
              <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl border-t border-ink-line px-6 py-20">
        <h2 className="font-display text-2xl font-semibold">Built for fast thinking</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body, color }) => (
            <div
              key={title}
              className="rounded-2xl border border-ink-line bg-ink-surface p-6 transition-colors hover:border-ink-muted"
            >
              <Icon size={20} className={color} />
              <h3 className="mt-4 font-display text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="relative z-10 mx-auto max-w-6xl border-t border-ink-line px-6 py-20 text-center">
        <h2 className="font-hand text-4xl text-ink-text">Got five minutes? Grab a pen.</h2>
        <div className="mt-8 flex justify-center">
          <StartBoardButton />
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-6xl items-center justify-between border-t border-ink-line px-6 py-8 text-xs text-ink-muted">
        <span>Inkboard</span>
        <span>Built with Next.js, Rough.js &amp; Liveblocks.</span>
      </footer>
    </div>
  );
}
