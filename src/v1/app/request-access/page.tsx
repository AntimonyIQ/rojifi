import { RequestAccessForm } from "@/v1/components/auth/request-access";
import { useSEO } from '@/hooks/useSEO';

export default function RequestAccessPage() {
    return (
        <>
            {useSEO({ page: 'request-access' })}
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" >
                <RequestAccessForm />
            </div>
        </>
    );
}
