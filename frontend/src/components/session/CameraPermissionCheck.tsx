import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";

type CameraState = "idle" | "requesting" | "granted" | "denied" | "unavailable";

type Props = {
  onReadyChange?: (ready: boolean) => void;
  title?: string;
  description?: string;
};

export default function CameraPermissionCheck({
  onReadyChange,
  title = "Camera Verification",
  description = "Camera permission is required for proctored interviews. Please grant camera access before starting.",
}: Props) {
  const [state, setState] = useState<CameraState>("requesting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onReadyChangeRef = useRef(onReadyChange);

  useEffect(() => {
    onReadyChangeRef.current = onReadyChange;
  }, [onReadyChange]);

  const stopCurrentStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const requestCamera = async () => {
    stopCurrentStream();
    setState("requesting");
    setErrorMessage(null);
    onReadyChangeRef.current?.(false);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera API is not supported in this browser. Please use a modern browser (Chrome, Edge, Firefox)."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setState("granted");
      onReadyChangeRef.current?.(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      stopCurrentStream();
      const isDenied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError");
      const isNotFound =
        err instanceof DOMException &&
        (err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError");

      if (isDenied) {
        setState("denied");
        setErrorMessage(
          "Camera permission was denied. Please click the camera icon in your browser's address bar to allow camera access."
        );
      } else if (isNotFound) {
        setState("unavailable");
        setErrorMessage(
          "No webcam device was detected. Please connect a working camera."
        );
      } else {
        setState("denied");
        setErrorMessage(
          err instanceof Error ? err.message : "Could not initialize camera."
        );
      }
      onReadyChangeRef.current?.(false);
    }
  };

  useEffect(() => {
    void requestCamera();
    return () => {
      stopCurrentStream();
    };
  }, []);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4 text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-brand" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {state === "granted" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Camera ready
          </span>
        )}
        {state === "requesting" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Requesting access...
          </span>
        )}
        {(state === "denied" || state === "unavailable") && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
            <CameraOff className="h-3.5 w-3.5" />
            Camera required
          </span>
        )}
      </div>

      <p className="text-xs text-secondary">{description}</p>

      <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-lg border border-border bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            state === "granted" ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Camera setup preview"
        />

        {state !== "granted" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            {state === "requesting" ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                <p className="text-xs text-gray-300">
                  Checking camera permission in your browser...
                </p>
              </>
            ) : (
              <>
                <CameraOff className="h-8 w-8 text-red-400 mb-2" />
                <p className="text-xs text-red-300">
                  {errorMessage || "Camera access not granted"}
                </p>
                <button
                  type="button"
                  onClick={() => void requestCamera()}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again / Allow
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {(state === "denied" || state === "unavailable") && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-2.5 text-xs text-red-600 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

