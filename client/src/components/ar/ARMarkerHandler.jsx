import { useEffect, useRef } from 'react';
import { useARContext } from './ARScene';

/**
 * ARMarkerHandler – thin component that bridges AR.js marker events to React
 * callbacks.  Place it as a child of <ARScene> to receive marker lifecycle events.
 *
 * Props:
 *   onMarkerFound(markerId, position) – called when a marker becomes visible
 *   onMarkerLost(markerId)            – called when a marker is lost
 *   markerId                          – identifier string (default: 'hiro')
 */
export default function ARMarkerHandler({
  onMarkerFound,
  onMarkerLost,
  markerId = 'hiro',
}) {
  const { refs, mode, isMarkerDetected } = useARContext();
  const prevDetected = useRef(false);
  const callbacksRef = useRef({ onMarkerFound, onMarkerLost });

  // Keep callback refs current without re-subscribing
  useEffect(() => {
    callbacksRef.current = { onMarkerFound, onMarkerLost };
  }, [onMarkerFound, onMarkerLost]);

  // Translate isMarkerDetected boolean changes → callbacks
  useEffect(() => {
    if (mode !== 'ar') return;

    if (isMarkerDetected && !prevDetected.current) {
      const pos = refs.current.markerRoot?.position?.clone() ?? { x: 0, y: 0, z: 0 };
      callbacksRef.current.onMarkerFound?.(markerId, pos);
    }

    if (!isMarkerDetected && prevDetected.current) {
      callbacksRef.current.onMarkerLost?.(markerId);
    }

    prevDetected.current = isMarkerDetected;
  }, [isMarkerDetected, mode, markerId, refs]);

  // In fallback mode, auto-fire "found" so content is always visible
  useEffect(() => {
    if (mode === 'fallback') {
      callbacksRef.current.onMarkerFound?.(markerId, { x: 0, y: 0, z: 0 });
    }
  }, [mode, markerId]);

  return null; // no DOM output
}
