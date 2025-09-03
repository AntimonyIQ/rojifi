"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function ToastExample() {
  const { toast, success, error, info, warning } = useToast()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Toast Examples</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          onClick={() => success("Success!", "Operation completed successfully")}
          className="bg-green-600 hover:bg-green-700"
        >
          Success Toast
        </Button>

        <Button onClick={() => error("Error!", "Something went wrong")} className="bg-red-600 hover:bg-red-700">
          Error Toast
        </Button>

        <Button
          onClick={() => info("Information", "Here's some useful information")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Info Toast
        </Button>

        <Button
          onClick={() => warning("Warning", "Please be careful with this action")}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Warning Toast
        </Button>

        <Button
          onClick={() =>
            toast({
              title: "Custom Toast",
              description: "This is a custom toast with an action",
              variant: "default",
              action: (
                <Button variant="outline" size="sm" onClick={() => alert("Action clicked!")}>
                  Action
                </Button>
              ),
            })
          }
          className="col-span-2 md:col-span-4"
        >
          Custom Toast with Action
        </Button>
      </div>
    </div>
  )
}
