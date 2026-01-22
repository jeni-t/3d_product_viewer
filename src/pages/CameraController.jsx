import { useState } from "react"
import * as BABYLON from "@babylonjs/core"

const CameraController = ({ cameraRef }) => {
  const [outsideMode, setOutsideMode] = useState(false)
  const [insideMode, setInsideMode] = useState(false)

  const resetCamera = cam => {
    cam.radius = 12
    cam.lowerRadiusLimit = 4
    cam.upperRadiusLimit = 20

    cam.lowerBetaLimit = 0.1
    cam.upperBetaLimit = Math.PI - 0.1

    cam.wheelPrecision = 40
    cam.panningSensibility = 1000
  }

  const toggleOutside = () => {
    const cam = cameraRef.current
    if (!cam) return

    if (!outsideMode) {
      cam.radius = 13 // ~50cm feel
      cam.lowerRadiusLimit = 13
      cam.upperRadiusLimit = 13

      cam.lowerBetaLimit = Math.PI / 2.3
      cam.upperBetaLimit = Math.PI / 2.1

      cam.setTarget(new BABYLON.Vector3(0, 1.5, 0))

      cam.wheelPrecision = Infinity
      cam.panningSensibility = 0

      setInsideMode(false)
    } else {
      // RESET
    cam.setTarget(new BABYLON.Vector3(0, 0.8, 0))
    cam.radius = 12
    cam.lowerRadiusLimit = 4
    cam.upperRadiusLimit = 20

    cam.lowerBetaLimit = 0.1
    cam.upperBetaLimit = Math.PI - 0.1
    }

    setOutsideMode(!outsideMode)
  }

  const toggleInside = () => {
    const cam = cameraRef.current
    if (!cam) return

    if (!insideMode) {
      cam.setTarget(new BABYLON.Vector3(0, 4, 0)) // seat area
      cam.radius = 2.8

      cam.lowerRadiusLimit = 2
      cam.upperRadiusLimit = 4

      cam.lowerBetaLimit = 0.5
      cam.upperBetaLimit = Math.PI - 0.05
      cam.panningSensibility = 800
      cam.wheelPrecision = 50
      cam.panningSensibility = 0

      setOutsideMode(false)
    } else {
      cam.setTarget(BABYLON.Vector3.Zero())
      resetCamera(cam)
    }

    setInsideMode(!insideMode)
  }

  return (
    <div className="absolute bottom-6 right-6 flex gap-3 z-50">
      <button
        onClick={toggleOutside}
        className="px-4 py-2 bg-black text-white rounded-lg"
      >
        {outsideMode ? "Normal View" : "Rotate Outside"}
      </button>

      <button
        onClick={toggleInside}
        className="px-4 py-2 bg-black text-white rounded-lg"
      >
        {insideMode ? "Normal View" : "Inside View"}
      </button>
    </div>
  )
}

export default CameraController
