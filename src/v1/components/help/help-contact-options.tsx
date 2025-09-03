import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/v1/components/ui/card"
import { Mail } from "lucide-react"
import { Link } from "wouter"

export function HelpContactOptions() {
    return (
        <section className="pb-24">
            <div className="container">
                <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                    <Card className="border-gray-200">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="rounded-full bg-gray-100 p-2">
                                <Mail className="h-6 w-6 text-gray-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Send us a mail</CardTitle>
                                <CardDescription>Speak to us via mail</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Link
                                href="mailto:support@rojifi.com"
                                className="mt-4 block text-lg font-medium text-primary hover:underline"
                            >
                                support@rojifi.com
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
