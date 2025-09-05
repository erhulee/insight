import { PromotionalHero } from "@/components/developer/promotional-hero"
import { PromotionalFeatures } from "@/components/developer/promotional-features"
import { PromotionalNews } from "@/components/developer/promotional-news"
import { PromotionalOpenForms } from "@/components/developer/promotional-open-forms"

export default function PromotionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <main>
        <PromotionalHero />
        <PromotionalFeatures />
        <PromotionalNews />
        <PromotionalOpenForms />
      </main>
    </div>
  )
}
