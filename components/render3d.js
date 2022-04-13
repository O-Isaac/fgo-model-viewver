import { useEffect, useRef, useState } from "react";
import { Loading } from "@nextui-org/react";
import render from "../render/model";

const bundleId = "704000";

export default function Render3D() {
  const canvasRef = useRef(null);
  const firstRender = useRef(true);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      render(setLoading, bundleId, canvasRef);
    }
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
