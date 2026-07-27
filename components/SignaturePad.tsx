"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

export interface SignaturePadHandle {
  getDataUrl: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  maxWidth?: number;
  aspectRatio?: number; // width / height
  onChange?: (hasDrawn: boolean) => void;
}

const MIN_WIDTH = 260;

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ maxWidth = 480, aspectRatio = 2, onChange }, ref) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingRef = useRef(false);
    const hasDrawnRef = useRef(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    // Sized once from the wrapper's actual rendered width — an iPad gets a
    // noticeably larger, more comfortable signing area than a phone, without
    // ever exceeding maxWidth. Deliberately measured once at mount (not on
    // every resize): resizing a <canvas> element always clears its drawing
    // buffer, so re-measuring mid-signature (e.g. an iPad orientation flip
    // while someone's partway through signing) would wipe their signature —
    // a worse trade-off than just not adapting to a rotation mid-draw.
    const [size, setSize] = useState({ width: 320, height: 160 });

    useLayoutEffect(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const available = wrapper.clientWidth || maxWidth;
      const width = Math.max(MIN_WIDTH, Math.min(available, maxWidth));
      const height = Math.round(width / aspectRatio);
      setSize({ width, height });
    }, [maxWidth, aspectRatio]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";
    }, [size]);

    function pointerPosition(canvas: HTMLCanvasElement, event: React.PointerEvent<HTMLCanvasElement>) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      canvas.setPointerCapture(event.pointerId);
      drawingRef.current = true;
      const { x, y } = pointerPosition(canvas, event);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }

    function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
      if (!drawingRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const { x, y } = pointerPosition(canvas, event);
      ctx.lineTo(x, y);
      ctx.stroke();
      if (!hasDrawnRef.current) {
        hasDrawnRef.current = true;
        setHasDrawn(true);
        onChange?.(true);
      }
    }

    function handlePointerUp() {
      drawingRef.current = false;
    }

    useImperativeHandle(ref, () => ({
      getDataUrl: () => {
        if (!hasDrawnRef.current || !canvasRef.current) return null;
        return canvasRef.current.toDataURL("image/png");
      },
      isEmpty: () => !hasDrawnRef.current,
      clear: () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawnRef.current = false;
        setHasDrawn(false);
        onChange?.(false);
      },
    }));

    return (
      <div ref={wrapperRef} style={{ width: "100%" }}>
        <div
          style={{
            position: "relative",
            width: size.width,
            height: size.height,
            maxWidth: "100%",
            border: "2px dashed var(--border)",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
          }}
        >
          <canvas
            ref={canvasRef}
            width={size.width}
            height={size.height}
            style={{ touchAction: "none", background: "#fff", display: "block" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
          {!hasDrawn && (
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--slate-600)",
                fontSize: 14,
                pointerEvents: "none",
              }}
            >
              Sign above
            </span>
          )}
        </div>
        <div style={{ marginTop: 8 }}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              const canvas = canvasRef.current;
              const ctx = canvas?.getContext("2d");
              if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
              hasDrawnRef.current = false;
              setHasDrawn(false);
              onChange?.(false);
            }}
          >
            Clear
          </Button>
        </div>
      </div>
    );
  },
);
