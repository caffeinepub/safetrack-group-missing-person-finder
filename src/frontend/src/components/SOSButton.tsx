import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useTriggerSOS } from "../hooks/useQueries";

export default function SOSButton() {
  const [open, setOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const triggerSOS = useTriggerSOS();

  const handleSOS = async () => {
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
        }),
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {
      // proceed without location
    }
    try {
      await triggerSOS.mutateAsync({ lat, lng });
      toast.success("SOS alert sent! Emergency services notified.", {
        duration: 6000,
      });
      setOpen(false);
    } catch {
      toast.error(
        "Failed to send SOS alert. Please call emergency services directly.",
      );
    }
  };

  if (!identity) return null;

  return (
    <>
      <button
        type="button"
        data-ocid="sos.open_modal_button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-destructive text-destructive-foreground font-display font-bold text-xs flex flex-col items-center justify-center gap-0.5 sos-pulse cursor-pointer shadow-lg hover:scale-110 transition-transform"
        aria-label="Send SOS Alert"
      >
        <AlertTriangle className="w-6 h-6" />
        <span>SOS</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="sos.dialog" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Emergency SOS Alert
            </DialogTitle>
            <DialogDescription>
              This will send an emergency SOS alert with your current location
              to all group members and emergency contacts. Only use in genuine
              emergencies.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              data-ocid="sos.cancel_button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-ocid="sos.confirm_button"
              onClick={handleSOS}
              disabled={triggerSOS.isPending}
            >
              {triggerSOS.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                </>
              ) : (
                "Send SOS Alert"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
