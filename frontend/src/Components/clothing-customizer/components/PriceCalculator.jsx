import { DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Price Calculator Component
function PriceCalculator({ basePrice, designPrice, customImagePrice, selectedDesign, hasCustomImage }) {
  const totalPrice = basePrice + designPrice + (hasCustomImage ? customImagePrice : 0)

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Price Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span>Base T-Shirt:</span>
          <span>${basePrice}</span>
        </div>

        {designPrice > 0 && (
          <div className="flex justify-between">
            <span>Designs:</span>
            <span>${designPrice}</span>
          </div>
        )}

        {hasCustomImage && (
          <div className="flex justify-between">
            <span>Custom Image:</span>
            <span>${customImagePrice}</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${totalPrice}</span>
        </div>

        <Button className="w-full mt-4" size="lg">
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  )
}

export default PriceCalculator
