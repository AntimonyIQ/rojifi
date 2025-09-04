import { Footer } from "@/v1/components/footer"
import { Header } from "@/v1/components/header"
import { PrivacyContent } from "@/v1/components/privacy/privacy-content"

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header isLoggedIn={false} user={null} />
      <PrivacyContent />
      <Footer />
    </main>
  )
}
