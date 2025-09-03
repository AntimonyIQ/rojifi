import { Link } from "wouter"
import { ChevronRight } from "lucide-react"

export function HelpHero() {
    return (
        <section className="py-12 md:py-16">
            <div className="container">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/help" className="text-primary hover:underline">
                        Rojifi Help
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span>Contact Us</span>
                </div>

                <div className="max-w-2xl">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        Need Assistance?
                        <br />
                        We're Here to Help
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Whether you have questions or need support with our services, our team is ready to assist you.
                    </p>
                </div>
            </div>
        </section>
    )
}
