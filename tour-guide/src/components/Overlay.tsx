import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Box } from "@chakra-ui/react";

interface OverlayProps {
  targetRect: DOMRect | null;
}

export const Overlay = ({ targetRect }: OverlayProps) => {
  const [overlayRects, setOverlayRects] = useState<any[]>([]);

  const calculateOverlayRects = useCallback(() => {
    if (!targetRect) return [];

    const padding = 4;
    const paddedRect = {
      top: targetRect.top - padding,
      bottom: targetRect.bottom + padding,
      left: targetRect.left - padding,
      right: targetRect.right + padding,
      width: targetRect.width + padding * 2,
      height: targetRect.height + padding * 2,
    };

    return [
      {
        top: 0,
        left: 0,
        width: "100%",
        height: `${paddedRect.top}px`,
      },
      {
        top: `${paddedRect.bottom}px`,
        left: 0,
        width: "100%",
        height: `${Math.max(document.documentElement.clientHeight - paddedRect.bottom, 0)}px`,
      },
      {
        top: `${paddedRect.top}px`,
        left: 0,
        width: `${paddedRect.left}px`,
        height: `${paddedRect.height}px`,
      },
      {
        top: `${paddedRect.top}px`,
        left: `${paddedRect.right}px`,
        width: `${Math.max(document.documentElement.clientWidth - paddedRect.right, 0)}px`,
        height: `${paddedRect.height}px`,
      },
    ];
  }, [targetRect]);

  useEffect(() => {
    const updateOverlay = () => {
      setOverlayRects(calculateOverlayRects());
    };

    updateOverlay();
    window.addEventListener("scroll", updateOverlay, true);
    window.addEventListener("resize", updateOverlay);
    return () => {
      window.removeEventListener("scroll", updateOverlay, true);
      window.removeEventListener("resize", updateOverlay);
    };
  }, [calculateOverlayRects]);

  if (!targetRect) return null;

  return createPortal(
    <>
      {overlayRects.map((style, index) => (
        <Box
          key={index}
          position="fixed"
          bg="rgba(0, 0, 0, 0.5)"
          zIndex={30}
          style={style}
          pointerEvents="auto"
          transition="all 0.2s ease-in-out"
        />
      ))}
    </>,
    document.body
  );
};
