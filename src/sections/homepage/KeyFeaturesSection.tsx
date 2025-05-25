import { Code2, Wand2, Layout, Palette, Sliders } from "lucide-react"
import { cn } from "@/lib/utils"
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid"
import { Marquee } from "@/components/magicui/marquee"
import { AnimatedBeamMultipleOutput } from "@/components/AnimatedBeamMultipleOutput"
import { TextAnimate } from "@/components/magicui/text-animate"
import { Safari } from "@/components/magicui/safari"

// Import your editor preview images
// If you don't have these images, you can use placeholders
const editorpreviewlight = "/editor-preview-light-mode.png"

// Sample CSS snippets for the CSS editor feature
const cssSnippets = [
    {
        name: "button.css",
        body: `.btn-primary {
  background: linear-gradient(45deg, #4f46e5, #7c3aed);
  color: white;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
}`,
    },
    {
        name: "card.css",
        body: `.card {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: white;
}`,
    },
    {
        name: "layout.css",
        body: `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}`,
    },
]

const imgsrc = editorpreviewlight

const features = [
    {
        Icon: Code2,
        name: "Advanced CSS Editor",
        description: "Powerful CSS editing with syntax highlighting, auto-completion, and real-time preview.",
        href: "#css-editor",
        cta: "Explore Editor",
        className: "col-span-3 lg:col-span-2",
        background: (
            <Marquee
                pauseOnHover
                className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
            >
                {cssSnippets.map((snippet, idx) => (
                    <figure
                        key={idx}
                        className={cn(
                            "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4 mx-2",
                            "border-neutral-950/[.1] bg-neutral-950/[.01] hover:bg-neutral-950/[.05]",
                            "dark:border-neutral-50/[.1] dark:bg-neutral-50/[.10] dark:hover:bg-neutral-50/[.15]",
                            "transform-gpu transition-all duration-300 ease-out hover:blur-none",
                        )}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <div className="flex flex-col">
                                <figcaption className="text-sm font-medium dark:text-white">{snippet.name}</figcaption>
                            </div>
                        </div>
                        <blockquote className="mt-2 text-xs font-mono overflow-hidden">{snippet.body}</blockquote>
                    </figure>
                ))}
            </Marquee>
        ),
    },
    {
        Icon: Wand2,
        name: "AI Style Assistant",
        description: "Get intelligent style suggestions. Ask AI to help you style elements.",
        href: "#ai-assist",
        cta: "Try AI Assistant",
        className: "col-span-3 lg:col-span-1",
        background: (
            <div className="absolute inset-0 flex items-start p-4 justify-center">
                <div className="w-full max-w-xs rounded-lg backdrop-blur-sm transition-all duration-500 ease-out group-hover:scale-[1.0]">
                    <div className="flex items-center gap-2 mb-3">
                        <Wand2 className="w-4 h-4 text-purple-500" />
                        <div className="text-sm font-medium">AI Style Assistant</div>
                    </div>
                    <div className="h-16 group-hover:h-24 rounded-md border border-neutral-200 dark:border-neutral-700 p-2 text-xs text-neutral-500 mb-2 overflow-hidden relative duration-500 ease-out">
                        <div className="absolute inset-0 p-2 hidden group-hover:block">
                            <TextAnimate duration={1.5} animation="blurIn" className="text-xs text-neutral-600 dark:text-neutral-300">
                                Make this button gradient purple with rounded corners and a subtle hover effect...
                            </TextAnimate>
                        </div>
                        <span className="group-hover:opacity-0 transition-opacity duration-200">
              Ask AI to help you style this element...
            </span>
                    </div>
                    <button className="w-full py-1.5 rounded-md bg-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-white text-xs font-medium duration-300">
                        Apply AI Styling
                    </button>
                </div>
            </div>
        ),
    },
    {
        Icon: Sliders,
        name: "Visual Style Controls",
        description: "Comprehensive style controls without writing code.",
        href: "#style-controls",
        cta: "See How It Works",
        className: "col-span-3 lg:col-span-1",
        background: (
            <AnimatedBeamMultipleOutput className="absolute right-2 -top-6 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
        ),
    },
    {
        Icon: Layout,
        name: "Prebuilt Templates",
        description: "Start with professionally designed templates. Customize them to match your brand and needs.",
        className: "col-span-3 lg:col-span-2",
        href: "#templates",
        cta: "Browse Templates",
        background: (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative top-16 group-hover:scale-[1.05] p-8 opacity-80 w-full duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:opacity-100">
                    <Safari
                        imageSrc={imgsrc}
                        url="ecomnex.ma.editor"
                        className="size-full [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] "
                    />
                </div>
            </div>
        ),
    },
]

export function KeyFeaturesSection() {
    return (
        <section className="py-20 bg-gradient-to-b from-white to-neutral-50 dark:from-[#050505] dark:to-neutral-900">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-950 dark:text-neutral-50">
                        Powerful Website{" "}
                        <span className="bg-gradient-to-t from-orange-500 to-fuchsia-600 bg-clip-text text-transparent">
              Building
            </span>{" "}
                        Tools
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
                        Our CMS provides everything you need to create stunning websites with ease, from advanced CSS editing to
                        AI-powered design assistance.
                    </p>
                </div>

                <BentoGrid>
                    {features.map((feature, idx) => (
                        <BentoCard key={idx} {...feature} />
                    ))}
                </BentoGrid>

                <div className="mt-16 text-center">
                    <a
                        href="demo"
                        className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                    >
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0A7B7B_0%,#0A7B7B/70_50%,#0A7B7B_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-4 px-6 rounded-full bg-neutral-100/90 hover:bg-neutral-100/80 dark:bg-neutral-950/90 dark:hover:bg-neutral-950/80 py-1 font-bold text-neutral-800 dark:text-white backdrop-blur-3xl text-md duration-300">
              <Palette className="w-5 h-5" />
              Try Our Editor Now
            </span>
                    </a>
                </div>
            </div>
        </section>
    )
}
