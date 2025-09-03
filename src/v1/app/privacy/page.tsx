import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrivacyContent } from "@/components/privacy/privacy-content"

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <PrivacyContent />
      <Footer />
    </main>
  )
}
