import { useEffect, useRef, useState } from "react";
import { Loading } from "@nextui-org/react";
import render from "../render/model";

const bundleId = "303200";

export default function Render3D() {
  const canvasRef = useRef(null);
  const firstRender = useRef(true);

  const [loading, setLoading] = useState(true);

  const guiRef = useRef(null);
  const onWindowResizeRef = useRef(null);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;

      render(setLoading, bundleId, canvasRef).then((data) => {
        guiRef.current = data.gui;
        onWindowResizeRef.current = data.onWindowResize;
      });
    }

    return () => {
      guiRef.current && guiRef.current.destroy();
      onWindowResizeRef.current &&
        window.removeEventListener("resize", onWindowResizeRef.current);
    };
  }, []);

  return (
    <>
      {loading && (
        <div className="loading-3d">
          <Loading size="xl" />
        </div>
      )}
      <div ref={canvasRef} />
    </>
  );
}
