import WaterBlock from '@blocks/water-block'
import Experience from '@experience'
import Random from '@utils/random'
import { CatmullRomCurve3, Vector3 } from 'three'
import Wind from './wind'

// TODO improve
export default class Landscape {
  constructor(grid) {
    this.experience = Experience.instance
    this.resources = this.experience.resources
    this.time = this.experience.time
    this.scene = this.experience.scene
    this.grid = grid

    this.riverBlocks = this.grid.blocks.filter(b => b.name !== 'riverStart' && b.links.length)

    this.grid.deadEnds.forEach((b, i) => {
      b.name = i % 2 ? 'riverEnd' : 'riverStart'

      this.grid.addNeighbors(b, i % 2 ? 'buildingVillage' : 'stoneHill')

      b.neighbors.forEach(n =>
        this.grid.addNeighbors(
          n,
          i % 2
            ? 'buildingHouse'
            : () => Random.oneOf('stoneMountain', 'stoneHill', 'buildingCabin'),
        ),
      )
    })

    this.grid.addPerimeter(() =>
      Random.oneOf(
        'grass',
        'grassForest',
        'grassHill',
        'buildingMill',
        'buildingSheep',
        // 'buildingCastle',
        // 'buildingFarm',
      ),
    )
    this.grid.addPerimeter(() => Random.oneOf('grass', 'grassForest'))
    this.grid.addPerimeter(() => Random.oneOf('sand', 'sandRocks'))

    this.wind = new Wind()
    this.setShip()
    this.setPath()
  }

  updateLinks() {
    this.grid.blocks.forEach(b => {
      if (b.links && !b.links.length) {
        const closestRiver = this.getClosestRiver(b)
        b.linked = closestRiver.linked
      }
    })
  }

  getClosestRiver(block) {
    if (!block) return null

    let closestBlock = null
    let closestDistance = Infinity

    this.riverBlocks.forEach(riverBlock => {
      if (riverBlock.name === 'riverStart') return

      const distance = Math.abs(block.q - riverBlock.q) + Math.abs(block.r - riverBlock.r)
      if (distance < closestDistance) {
        closestDistance = distance
        closestBlock = riverBlock
      }
    })

    return closestBlock
  }

  setShip() {
    this.ship = this.resources.items.unitShipLarge.scene.children.at(0).clone()
    this.scene.add(this.ship)
  }

  setPath() {
    const pointCount = 8
    this.pathPoints = []

    for (let i = 0; i < pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2 // Loops around a full circle (0 to 2π) divided into pointCount
      const r = Random.float({ min: this.grid.radius + 6, max: this.grid.radius + 8 })
      const x = Math.cos(angle) * r
      const z = Math.sin(angle) * r
      this.pathPoints.push(new Vector3(x, 0, z))
    }

    this.pathPoints.push(this.pathPoints[0].clone())

    this.curve = new CatmullRomCurve3(this.pathPoints, true)
    this.curve.arcLengthDivisions = 200
    this.pathProgress = 0
  }

  update() {
    this.wind.update()

    const speed = 0.005
    this.pathProgress = (this.pathProgress + this.time.delta * speed) % 1

    const position = this.curve.getPointAt(this.pathProgress)
    this.ship.position.copy(position)
    this.ship.position.y = WaterBlock.getElevation(position, this.time.elapsed) + 0.05

    const tangent = this.curve.getTangentAt(this.pathProgress)
    const angle = Math.atan2(tangent.x, tangent.z)
    this.ship.rotation.y = angle + Math.PI * 0.5
  }

  dispose() {
    this.wind.dispose()
    delete this.wind

    this.ship.geometry.dispose()
    this.ship.material.dispose()
    this.scene.remove(this.ship)
    delete this.ship
    delete this.pathPoints
    delete this.curve
  }
}
