"use client"

import { PlatformVariant } from "@enterprise-commerce/core/platform/types"
import { addCartItem, getItemAvailability } from "app/actions/cart.actions"
import { Button } from "components/Button/Button"
import { COOKIE_CART_ID } from "constants/index"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { useCartStore } from "stores/cartStore"
import { cn } from "utils/cn"
import { getCookie } from "utils/getCookie"
import { Combination } from "utils/productOptionsUtils"

export function AddToCartButton({ className, combination }: { className?: string; combination: Combination | PlatformVariant | undefined }) {
  const [isPending, startTransition] = useTransition()
  const [hasAnyAvailable, setHasAnyAvailable] = useState(true)
  const openCart = useCartStore((s) => s.openCart)
  const preloadSheet = useCartStore((s) => s.preloadSheet)

  const handleClick = () => {
    startTransition(async () => {
      if (!combination?.id) return

      const { ok, message } = await addCartItem(null, combination.id)

      if (!ok && message) {
        toast.warning(message)
      }

      if (ok) {
        openCart()
      }
    })
  }

  useEffect(() => {
    const checkStock = async () => {
      const cartId = getCookie(COOKIE_CART_ID)
      const itemAvailability = await getItemAvailability(cartId, combination?.id)

      itemAvailability && setHasAnyAvailable(itemAvailability.inCartQuantity < itemAvailability.inStockQuantity)
    }

    checkStock()
  }, [combination?.id])

  const unavailable = !combination?.availableForSale || !hasAnyAvailable

  const disabled = unavailable || isPending

  return (
    <Button
      onClick={handleClick}
      onMouseEnter={preloadSheet}
      variant="secondary"
      size="xl"
      isAnimated={false}
      className={cn("relative w-fit rounded-xl transition-transform hover:scale-105 hover:text-white", className)}
      isLoading={isPending}
      disabled={isPending || disabled}
    >
      {unavailable ? "Out of stock" : isPending ? "Adding to cart" : "Add to Cart"}
    </Button>
  )
}
