// "use client"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"

// // Preset Design Component with drag functionality
// function PresetDesign({ design, onSelect }) {
//   const handleDragStart = (event) => {
//     event.dataTransfer.setData("application/json", JSON.stringify(design))
//     event.dataTransfer.effectAllowed = "copy"
//   }

//   return (
//     <Card
//       className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
//       onClick={() => onSelect(design)}
//       draggable
//       onDragStart={handleDragStart}
//     >
//       <CardContent className="p-3">
//         <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
//           <img
//             src={design.preview || "/placeholder.svg?height=100&width=100&text=Design"}
//             alt={design.name}
//             className="w-full h-full object-cover rounded-md"
//             draggable={false}
//           />
//         </div>
//         <h4 className="font-medium text-sm">{design.name}</h4>
//         <Badge variant="secondary" className="mt-1">
//           ${design.price}
//         </Badge>
//         <p className="text-xs text-gray-500 mt-1">Drag to design area</p>
//       </CardContent>
//     </Card>
//   )
// }

// export default PresetDesign
