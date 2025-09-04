import React, { ReactNode } from "react";
import { Button } from "@/v1/components/ui/button";
import { Card, CardContent } from "@/v1/components/ui/card";
import { Badge } from "@/v1/components/ui/badge";
import {
    AlertTriangle,
    Home,
    RefreshCw,
    Zap,
} from "lucide-react";

export default class NotFound extends React.Component {

    componentDidMount(): void {
        // setTitle("Oops! Something went wrong - WealthX");
    };

    reload = (): void => {
        window.location.reload();
    };

    goHome = (): void => {
        window.location.href = "/";
    };

    render(): ReactNode {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {/* Main Error Card */}
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-8 md:p-12">
                            <div className="text-center space-y-6">
                                {/* Error Icon */}
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                                            <AlertTriangle className="h-10 w-10 text-red-600" />
                                        </div>
                                        <div className="absolute -top-2 -right-2">
                                            <div className="h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                                                <Zap className="h-3 w-3 text-yellow-800" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <Badge variant="destructive" className="px-4 py-2 text-sm font-medium">
                                    PAGE LOAD ERROR
                                </Badge>

                                {/* Main Heading */}
                                <div className="space-y-3">
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                        Oops! Something went wrong
                                    </h1>
                                    <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                                        It's not you, it's us. Don't worry though, refreshing the page usually solves the problem.
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
                                    <Button
                                        onClick={this.reload}
                                        className="gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3"
                                        size="lg"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Try Again
                                    </Button>
                                    <Button
                                        onClick={this.goHome}
                                        variant="outline"
                                        className="gap-2 px-6 py-3"
                                        size="lg"
                                    >
                                        <Home className="h-4 w-4" />
                                        Go Home
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                            If the problem persists, please contact our support team
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}