import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import * as THREE from "three";
import { Ascension, Camera } from "./menus";
import { useRouter } from "next/router";

export default async function Render(setLoading, bundleId, canvasRef) {
  const modelPath = "/models/" + bundleId;

  console.log("[SCENE] Initializing...");

  let mixer;
  let camera;
  let scene;
  let renderer;
  let delta;

  const children = new Map();

  const clock = new THREE.Clock();

  const { GUI } = require("dat.gui");

  const gui = new GUI({
    autoPlace: true,
    name: "Servant Control",
  });

  async function init() {
    const container = canvasRef.current;

    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );

    camera.position.set(300, 150, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(200, 200, 0);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.left = -120;
    dirLight.shadow.camera.right = 120;
    scene.add(dirLight);

    // var light = new THREE.AmbientLight(0xffffff);
    // scene.add(light);

    // scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

    // ground
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);
    const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    // model

    const loading = new THREE.LoadingManager(() => {
      setLoading(false);
    });

    const loader = new FBXLoader(loading);
    loader.load(modelPath + "/chr.fbx", function (object) {
      object.scale.set(100, 100, 100);

      object.position.y = -6;

      console.log("[SCENE] Model loaded");

      mixer = new THREE.AnimationMixer(object);

      const texture = new THREE.TextureLoader().load(
        modelPath + "/" + bundleId + ".png"
      );

      children.set("all", object.children);

      // Default Ascension is "3"
      object.children = object.children.filter(
        (child) =>
          child.name.includes("joint_all_Base") || child.name.includes("3")
      );

      let orderRender = 0;

      object.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.5,
          });
        }

        child.orderRender = orderRender++;
      });

      const waitIndex = object.animations.findIndex(
        (anim) => anim.name === "wait"
      );

      let action = mixer.clipAction(
        object.animations[waitIndex > 0 ? waitIndex : 0]
      );

      // Menu
      const record = {
        "Record Animation (WEBM)": () => {
          console.log("[SCENE] Recording...");
          const canvas = document.querySelector("canvas");
          const videoStream = canvas.captureStream();

          const recorder = new MediaRecorder(videoStream, {
            mimeType: "video/webm",
            videoBitsPerSecond: 2500000 * 2,
          });

          // Get the blob data when is available
          let allChunks = [];
          recorder.ondataavailable = function (e) {
            allChunks.push(e.data);
          };

          recorder.onstop = (e) => {
            const fullBlob = new Blob(allChunks, { type: "video/webm" });
            const downloadUrl = window.URL.createObjectURL(fullBlob);
            window.open(downloadUrl);
          };

          recorder.start();

          setTimeout(() => {
            recorder.stop();
            console.log("[SCENE] Scene recored!");
          }, 8000);
        },
        "Save Image (PNG)": () => {
          const canvas = document.querySelector("canvas");

          function dataURLtoBlob(dataurl) {
            var arr = dataurl.split(","),
              mime = arr[0].match(/:(.*?);/)[1],
              bstr = atob(arr[1]),
              n = bstr.length,
              u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
          }

          const url = canvas.toDataURL("png");
          const fullBlob = dataURLtoBlob(url);
          const blobURL = window.URL.createObjectURL(fullBlob);

          console.log(blobURL);
        },
      };

      gui.add(record, "Record Animation (WEBM)");
      gui.add(record, "Save Image (PNG)");

      // Menu for change action animation
      const actions = object.animations
        .map((anim, index) => {
          return {
            name: anim.name,
            [anim.name]: () => {
              action.stop();
              action = mixer.clipAction(object.animations[index]);
              action.play();
            },
          };
        })
        .filter((anim) => !anim.name.includes("eye_"));

      const actionFolder = gui.addFolder("Action");

      actions.forEach((action) => {
        actionFolder.add(action, action.name);
      });

      Camera(camera, gui);

      if (object.children.length > 0) {
        Ascension(object, gui, children, THREE, texture);
      }

      action.play();

      scene.add(object);
    });

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: true,
      logarithmicDepthBuffer: true,
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 0);
    renderer.shadowMap.enabled = true;

    // Post Processing FXAA
    const renderPass = new RenderPass(scene, camera);
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.uniforms["resolution"].value.set(
      1 / window.innerWidth,
      1 / window.innerHeight
    );
    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms["resolution"].value.set(
      1 / window.innerWidth,
      1 / window.innerHeight
    );
    effectFXAA.renderToScreen = true;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(fxaaPass);
    composer.addPass(effectFXAA);

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 100, 0);
    controls.enableRotate = false;
    controls.update();

    window.addEventListener("resize", onWindowResize);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  async function animate() {
    requestAnimationFrame(animate);
    delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
  }

  await init();
  await animate();

  return {
    gui,
    onWindowResize,
  };
}
