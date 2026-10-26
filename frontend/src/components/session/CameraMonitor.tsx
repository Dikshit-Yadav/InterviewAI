import { useEffect, useRef, useState } from "react";

type MonitorStatus =
  | "starting"
  | "normal"
  | "absent"
  | "multiple"
  | "attention"
  | "error";

type MonitorEvent = {
  type: Exclude<MonitorStatus, "starting" | "normal" | "error">;
  message: string;
  timestamp: string;
};

type CameraMonitorProps = {
  onEvent?: (event: MonitorEvent) => void;
};

type Detection = {
  score?: number | number[];
  locationData?: {
    relativeBoundingBox?: {
      xMin: number;
      yMin: number;
      width: number;
      height: number;
    };
  };
};

type FaceDetectionResults = {
  detections: Detection[];
};

type MediaPipeFaceDetector = {
  setOptions: (options: {
    model: "short" | "full";
    minDetectionConfidence: number;
  }) => void;
  onResults: (callback: (results: FaceDetectionResults) => void) => void;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  close: () => Promise<void>;
};

declare global {
  interface Window {
    FaceDetection?: new (config: {
      locateFile: (file: string) => string;
    }) => MediaPipeFaceDetector;
  }
}

const MEDIAPIPE_VERSION = "0.4.1646425229";
const MEDIAPIPE_BASE_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@${MEDIAPIPE_VERSION}`;

const DETECTION_INTERVAL_MS = 1000;
const ABSENCE_THRESHOLD = 3;
const MULTIPLE_FACE_THRESHOLD = 2;
const ATTENTION_THRESHOLD = 3;

export default function CameraMonitor({ onEvent }: CameraMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<MediaPipeFaceDetector | null>(null);
  const onEventRef = useRef(onEvent);
  const lastEventRef = useRef<MonitorStatus>("starting");

  const absenceCountRef = useRef(0);
  const multipleCountRef = useRef(0);
  const attentionCountRef = useRef(0);

  const [status, setStatus] = useState<MonitorStatus>("starting");
  const [faceCount, setFaceCount] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    let cancelled = false;
    let detectionTimer: ReturnType<typeof setInterval> | undefined;
    let detectionInProgress = false;
    const video = videoRef.current;

    const publishStatus = (nextStatus: MonitorStatus, message?: string) => {
      if (cancelled) return;

      setStatus(nextStatus);

      if (
        nextStatus !== lastEventRef.current &&
        ["absent", "multiple", "attention"].includes(nextStatus)
      ) {
        onEventRef.current?.({
          type: nextStatus as MonitorEvent["type"],
          message: message ?? nextStatus,
          timestamp: new Date().toISOString(),
        });
      }

      lastEventRef.current = nextStatus;
    };

    const start = async () => {
      let detector: MediaPipeFaceDetector | null = null;

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Camera access is unavailable. Use HTTPS or localhost.",
          );
        }

        if (!window.FaceDetection) {
          throw new Error(
            "MediaPipe failed to load. Check your internet connection and the script in index.html.",
          );
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (!video) {
          throw new Error("Camera preview could not be initialized.");
        }

        video.srcObject = stream;
        await video.play();

        detector = new window.FaceDetection({
          locateFile: (file) => `${MEDIAPIPE_BASE_URL}/${file}`,
        });

        detector.setOptions({
          model: "short",
          minDetectionConfidence: 0.5,
        });

        detector.onResults((results) => {
          if (cancelled) return;

          const detections = results.detections ?? [];
          const count = detections.filter((face) => {
            const score = Array.isArray(face.score)
              ? face.score[0]
              : face.score;

            return (score ?? 1) >= 0.5;
          }).length;

          setFaceCount(count);

          if (count === 0) {
            absenceCountRef.current += 1;
            multipleCountRef.current = 0;
            attentionCountRef.current = 0;

            if (absenceCountRef.current >= ABSENCE_THRESHOLD) {
              publishStatus(
                "absent",
                "No face detected for approximately 3 seconds.",
              );
            }
            return;
          }

          if (count > 1) {
            multipleCountRef.current += 1;
            absenceCountRef.current = 0;
            attentionCountRef.current = 0;

            if (multipleCountRef.current >= MULTIPLE_FACE_THRESHOLD) {
              publishStatus(
                "multiple",
                "Multiple faces detected in the camera frame.",
              );
            }
            return;
          }

          absenceCountRef.current = 0;
          multipleCountRef.current = 0;

          const box = detections[0]?.locationData?.relativeBoundingBox;

          const nearHorizontalEdge =
            box !== undefined &&
            (box.xMin + box.width / 2 < 0.15 ||
              box.xMin + box.width / 2 > 0.85);

          if (nearHorizontalEdge) {
            attentionCountRef.current += 1;

            if (attentionCountRef.current >= ATTENTION_THRESHOLD) {
              publishStatus(
                "attention",
                "Face position is near the edge of the camera frame.",
              );
            }
            return;
          }

          attentionCountRef.current = 0;
          publishStatus("normal");
        });

        if (cancelled) {
          await detector.close();
          return;
        }

        detectorRef.current = detector;
        publishStatus("normal");

        detectionTimer = setInterval(async () => {
          if (
            cancelled ||
            detectionInProgress ||
            video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
          ) {
            return;
          }

          detectionInProgress = true;

          try {
            await detector!.send({ image: video });
          } catch (error) {
            if (!cancelled) {
              console.error("Face detection failed:", error);
            }
          } finally {
            detectionInProgress = false;
          }
        }, DETECTION_INTERVAL_MS);
      } catch (error) {
        if (detector && detector !== detectorRef.current) {
          await detector.close().catch(() => undefined);
        }

        if (cancelled) return;

        console.error("Camera initialization failed:", error);

        const denied =
          error instanceof DOMException &&
          (error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError");

        setCameraError(
          denied
            ? "Camera permission was denied. Allow camera access in your browser settings, then reload."
            : error instanceof Error
              ? error.message
              : "Could not start the camera.",
        );

        publishStatus("error");
      }
    };

    void start();

    return () => {
      cancelled = true;

      if (detectionTimer) clearInterval(detectionTimer);

      const detector = detectorRef.current;
      detectorRef.current = null;

      if (detector) {
        void detector.close().catch(console.error);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      if (video) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, []);

  const statusText: Record<MonitorStatus, string> = {
    starting: "Starting camera…",
    normal: "Camera active · One face detected",
    absent: "Warning: face not detected",
    multiple: "Warning: multiple faces detected",
    attention: "Notice: face near frame edge",
    error: "Camera unavailable",
  };

  const statusStyle: Record<MonitorStatus, string> = {
    starting: "text-secondary",
    normal: "text-green-600",
    absent: "text-red-500",
    multiple: "text-red-500",
    attention: "text-amber-600",
    error: "text-red-500",
  };

  return (
    <section
      aria-label="Camera and interview monitoring"
      className="fixed right-4 top-4 z-50 w-64 rounded-xl border border-border bg-surface p-2 shadow-xl"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold">Camera</h2>

        <span
          className={`text-right text-[10px] font-medium ${statusStyle[status]}`}
          role="status"
          aria-live="polite"
        >
          {statusText[status]}
        </span>
      </div>

      <div className="relative w-full overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="aspect-video w-full object-cover"
          aria-label="Live camera preview"
        />

        {(status === "starting" || status === "error") && (
          <div className="absolute inset-0 grid place-items-center p-2 text-center text-xs text-white">
            {status === "starting"
              ? "Initializing camera…"
              : "Camera preview unavailable"}
          </div>
        )}
      </div>

      {cameraError && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          {cameraError}
        </p>
      )}

      {status !== "error" && status !== "starting" && (
        <p className="mt-1 text-[10px] text-secondary">
          Faces detected: {faceCount}
        </p>
      )}
    </section>
  );
}
