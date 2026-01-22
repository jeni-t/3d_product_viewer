import Product3D from "./Product3D"

const Home = () => {
  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      
      {/* Header */}
      <div className="p-4 text-center text-xl font-bold">
        3D Product Viewer
      </div>

      {/* 3D View */}
      <div className="flex-1 overflow-hidden">
        <Product3D />
      </div>

    </div>
  )
}

export default Home
