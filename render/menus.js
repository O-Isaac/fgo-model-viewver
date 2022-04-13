const updateMaterial = (object, THREE, texture) =>
  object.traverse(function (child) {
    if (child.isMesh) {
      child.material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
      });
    }
  });

export function Ascension(object, gui, children, THREE, texture) {
  const ascensionsFolder = gui.addFolder("Ascension");

  const ascension = {
    1: () => {
      console.log("[MODEL] Ascension 1 selected");

      const childrens = children.get("all");

      object.children = childrens.filter(
        (child) =>
          child.name.includes("joint_all_Base") || child.name.includes("1")
      );

      updateMaterial(object, THREE, texture);
    },
    2: () => {
      console.log("[MODEL] Ascension 2 selected");

      const childrens = children.get("all");

      object.children = childrens.filter(
        (child) =>
          child.name.includes("joint_all_Base") || child.name.includes("2")
      );

      updateMaterial(object, THREE, texture);
    },
    3: () => {
      console.log("[MODEL] Ascension 3 selected");

      const childrens = children.get("all");

      object.children = childrens.filter(
        (child) => child.name.includes("all") || child.name.includes("3")
      );

      updateMaterial(object, THREE, texture);
    },
  };

  ascensionsFolder.add(ascension, "1");
  ascensionsFolder.add(ascension, "2");
  ascensionsFolder.add(ascension, "3");
}

export function Camera(camera, gui) {
  const cameraFolder = gui.addFolder("Camera");

  cameraFolder.add(camera.position, "x", -500, 500);
  cameraFolder.add(camera.position, "y", -500, 500);
  cameraFolder.add(camera.position, "z", -500, 500);
}
