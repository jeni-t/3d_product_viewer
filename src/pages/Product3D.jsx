import { useEffect, useRef, useState } from "react"
import * as BABYLON from "@babylonjs/core"
import "@babylonjs/loaders"
import "@babylonjs/inspector"
import CameraController from "./CameraController"
import ColorPalette from "./ColorPalette"

const TARGET_MODEL_SIZE = 15; // Define a consistent target size for all models

const Product3D = () => {
  const modelModules = import.meta.glob("/public/models/*.{glb,stl,obj}")

  const modelOptions = Object.keys(modelModules).map(path => {
    const fileName = path.split("/").pop()
    const label = fileName
      .split(".")
      .slice(0, -1)
      .join(".")
      .replace(/_/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())
    return { value: fileName, label: `${label} (${fileName.split(".").pop().toUpperCase()})` }
  })
  const [selectedModel, setSelectedModel] = useState(modelOptions.length > 0 ? modelOptions[0].value : "")
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const [meshes, setMeshes] = useState([])
  const [allMeshes, setAllMeshes] = useState([])
  const [showInspector, setShowInspector] = useState(false)
  const [selectedMesh, setSelectedMesh] = useState(null)
  const [color, setColor] = useState("#000000")
  const reflectionProbeRef = useRef(null)
  const referenceSize = useRef(TARGET_MODEL_SIZE)

  useEffect(() => {
    const canvas = canvasRef.current
    const engine = new BABYLON.Engine(canvas, true)

    const scene = new BABYLON.Scene(engine)
    sceneRef.current = scene

    const probe = new BABYLON.ReflectionProbe("reflectionProbe", 512, scene)
    reflectionProbeRef.current = probe

    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0)

    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 2.5,
      12,
      BABYLON.Vector3.Zero(),
      scene
    )
    camera.attachControl(canvas, true)
    cameraRef.current = camera

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene)
    light.intensity = 8

    const pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 2, -5), scene)
    pointLight.intensity = 300

    
    // Model loading is now handled in a separate useEffect
    
        engine.runRenderLoop(() => scene.render())
    window.addEventListener("resize", engine.resize)

    return () => {
      engine.dispose()
    }
  }, [])

  useEffect(() => {
    if (meshes.length > 0) {
      const scene = sceneRef.current
      const carRoot = meshes[0]

      const initialBounds = carRoot.getHierarchyBoundingVectors();
      const initialMaxSize = Math.max(
        initialBounds.max.x - initialBounds.min.x,
        initialBounds.max.y - initialBounds.min.y,
        initialBounds.max.z - initialBounds.min.z
      );
      console.log(`[${selectedModel}] Initial Max Size: ${initialMaxSize}`);
      if (initialMaxSize > 0) { // Only scale if the model has a measurable size
        const scaleFactor = referenceSize.current / initialMaxSize;
        console.log(`[${selectedModel}] Scale Factor: ${scaleFactor}`);
        carRoot.scaling.scaleInPlace(scaleFactor);
      }

      if (reflectionProbeRef.current) {
        reflectionProbeRef.current.attachToMesh(carRoot);
      }

      // Re-calculate bounds after scaling for correct camera target
      const scaledBounds = carRoot.getHierarchyBoundingVectors();
      const centerY = (scaledBounds.min.y + scaledBounds.max.y) / 2
      cameraRef.current.setTarget(new BABYLON.Vector3(0, centerY - 0.4, 0))

      const meshNames = []
      const carMeshes = meshes[0].getChildMeshes()
      carMeshes.forEach(mesh => {
        if (mesh instanceof BABYLON.Mesh) {
          if (reflectionProbeRef.current) {
            reflectionProbeRef.current.renderList.push(mesh);
          }
          meshNames.push(mesh.name)
          const mat = new BABYLON.PBRMaterial(mesh.name + "_mat", scene)
          mat.albedoColor = BABYLON.Color3.Black()
          mat.metallic = 0.1
          mat.roughness = 0.5
          mesh.material = mat
        }
      })
      setAllMeshes(meshNames)

      scene.onPointerObservable.add(pointerInfo => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
          const pick = pointerInfo.pickInfo
          if (pick.hit && pick.pickedMesh) {
            setSelectedMesh(pick.pickedMesh)
          }
        }
      })
    }
  }, [meshes])

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous meshes before loading a new one
    meshes.forEach(mesh => {
      mesh.dispose();
    });
    setMeshes([]);
    setAllMeshes([]);
    setSelectedMesh(null);

    if (selectedModel) {
        BABYLON.SceneLoader.ImportMesh(
          "",
          "/models/",
          selectedModel,
          scene,
          (loadedMeshes) => {
            setMeshes(loadedMeshes);
          }
        );
    }
  }, [selectedModel]);

  const handleMeshChange = (meshName) => {
    const scene = sceneRef.current
    if (scene) {
      const mesh = scene.getMeshByName(meshName)
      setSelectedMesh(mesh)
    }
  }

  const setMeshColor = (color) => {
    if (!selectedMesh) return
    if (selectedMesh.material instanceof BABYLON.PBRMaterial) {
      if (color === "mirror") {
        selectedMesh.material.albedoColor = BABYLON.Color3.White();
        selectedMesh.material.metallic = 1.0;
        selectedMesh.material.roughness = 0;
        if (reflectionProbeRef.current) {
            selectedMesh.material.reflectionTexture = reflectionProbeRef.current.cubeTexture;
        }
      } else {
        selectedMesh.material.albedoColor = BABYLON.Color3.FromHexString(color)
        selectedMesh.material.metallic = 0.5
        selectedMesh.material.roughness = 0.3
        selectedMesh.material.reflectionTexture = null
      }
    }
    setColor(color)
  }

  // 🔍 INSPECTOR TOGGLE
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    if (showInspector) {
      scene.debugLayer.show({
        embedMode: false
      })
    } else {
      scene.debugLayer.hide()
    }
  }, [showInspector])

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />

      <div className="absolute top-4 left-4 z-50">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          {modelOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <CameraController cameraRef={cameraRef} />

      <ColorPalette
        meshes={allMeshes}
        selectedMesh={selectedMesh}
        onMeshChange={handleMeshChange}
        color={color}
        setMeshColor={setMeshColor}
      />

      {/* 🔥 INSPECTOR BUTTON */}
      <button
        onClick={() => setShowInspector(v => !v)}
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-black text-white rounded-lg"
      >
        {showInspector ? "Hide Inspector" : "Show Inspector"}
      </button>
    </div>
  )
}

export default Product3D
