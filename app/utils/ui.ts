export function calculateElementsPerColumn(
  totalImages: number,
  columns = 4,
): number[] {
  const baseCountPerColumn = Math.floor(totalImages / columns)
  const remainingImages = totalImages % columns
  const imagesDistribution = new Array<number>(columns).fill(baseCountPerColumn)

  for (let i = 0; i < remainingImages; i++) {
    imagesDistribution[i]++
  }

  return imagesDistribution
}

export function distributeElementsIntoColumns<T>(
  images: T[],
  distribution: number[],
): T[][] {
  let imageIndex = 0

  const columns = distribution.map((count) => {
    const column: T[] = []

    for (let i = 0; i < count; i++) {
      if (imageIndex >= images.length) continue

      const image = images[imageIndex++]

      if (!image) continue

      column.push(image)
    }
    return column
  })

  return columns
}
