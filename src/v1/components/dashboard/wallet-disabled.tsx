import { Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";

interface NotActivatedModalProps {
    currency: string;
    link?: string;
}

const NotAActivatedModal: React.FC<NotActivatedModalProps> = ({ currency, link }) => {
    const [walletActivationModal, setWalletActivationModal] = useState<boolean>(false);
    return (
        <Dialog open={walletActivationModal} onOpenChange={setWalletActivationModal}>
            <DialogContent className="max-w-md bg-white border-0 shadow-2xl">
                <div className="flex flex-col gap-6 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-center">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>

                    <div className="text-center">
                        <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                            Wallet Not Activated
                        </DialogTitle>
                        <p className="text-sm text-gray-600">
                            Your {currency} wallet needs to be activated before you can make payments with it.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setWalletActivationModal(false)}
                            className="flex-1"
                        >
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                setWalletActivationModal(false);
                                if (link) {
                                    window.location.href = link;
                                } else {

                                }
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            Activate
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default NotAActivatedModal;