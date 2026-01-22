const ColorPalette = (props) => {
  const { meshes, selectedMesh, onMeshChange, setMeshColor, color } = props
  
  const handleColorChange = setMeshColor
  const currentColor = color

  const colors = [
    "#ffffff", "#000000", "#ff0000", "#00ff00",
    "#0000ff", "#ffff00", "#00ffff", "#ff00ff",
    "mirror"
  ]

  return (
    <div className="
      absolute left-4 top-1/2 -translate-y-1/2
      flex flex-col gap-3 p-3
      bg-white/80 rounded-2xl shadow-lg z-50
    ">
      {meshes && meshes.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600">Select Part</label>
          {/* <select
            className="p-1 rounded border border-gray-400 text-sm"
            value={selectedMesh ? selectedMesh.name : ""}
            onChange={(e) => onMeshChange && onMeshChange(e.target.value)}
          >
            <option value="" disabled>Select Mesh</option>
            {meshes.map(meshName => (
              <option key={meshName} value={meshName}>{meshName}</option>
            ))}
          </select> */}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {colors.map(c => (
          <div
            key={c}
            onClick={() => handleColorChange && handleColorChange(c)}
            style={{ backgroundColor: c !== "mirror" ? c : "transparent" }}
            className={`
              w-8 h-8 rounded-full cursor-pointer border-2 flex items-center justify-center
              ${(currentColor === c) ? "border-black scale-110" : "border-gray-400"}
              ${c === "mirror" ? "bg-gradient-to-br from-gray-200 via-white to-gray-300" : ""}
              transition-all
            `}
            title={c === "mirror" ? "Mirror" : c}
          >
            {c === "mirror" && <span className="text-[10px] font-bold text-gray-600">M</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ColorPalette
