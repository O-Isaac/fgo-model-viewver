import Render3D from "../components/render3d";
import { Button } from "@nextui-org/react";
import Link from "next/link";

export default function Viewver() {
  return (
    <>
      <Link href={"/"}>
        <a style={{ position: "absolute", top: 10, left: 10 }}>
          <Button shadow color="primary" auto>
            Go Back
          </Button>
        </a>
      </Link>
      <Render3D />
    </>
  );
}
