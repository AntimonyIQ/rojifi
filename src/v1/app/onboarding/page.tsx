import { OnboardingFlow } from "@/v1/components/onboarding/onboarding-flow"
import { useSEO } from '@/hooks/useSEO';

export default function OnboardingPage() {
  return (
    <>
      {useSEO({ page: 'onboarding' })}
      <div className="min-h-screen bg-gray-50">
        <OnboardingFlow />
      </div>
    </>
  )
}
