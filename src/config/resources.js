const resourcesConfig = [
  // sounds
  {
    name: 'splash',
    type: 'sound',
    path: 'sounds/splash.mp3',
  },
  // textures
  {
    name: 'perlin',
    type: 'texture',
    path: 'textures/perlin.png',
  },
  // blocks textures
  {
    name: 'colormap',
    type: 'texture',
    path: 'blocks/Textures/colormap.png',
  },
  {
    name: 'colormapDesert',
    type: 'texture',
    path: 'blocks/Textures/colormap-desert.png',
  },
  {
    name: 'colormapSnow',
    type: 'texture',
    path: 'blocks/Textures/colormap-snow.png',
  },
  // blocks models
  {
    name: 'buildingArchery',
    type: 'gltfModel',
    path: 'blocks/building-archery.glb',
  },
  {
    name: 'buildingCabin',
    type: 'gltfModel',
    path: 'blocks/building-cabin.glb',
  },
  {
    name: 'buildingCastle',
    type: 'gltfModel',
    path: 'blocks/building-castle.glb',
  },
  {
    name: 'buildingDock',
    type: 'gltfModel',
    path: 'blocks/building-dock.glb',
  },
  {
    name: 'buildingFarm',
    type: 'gltfModel',
    path: 'blocks/building-farm.glb',
  },
  {
    name: 'buildingHouse',
    type: 'gltfModel',
    path: 'blocks/building-house.glb',
  },
  {
    name: 'buildingMarket',
    type: 'gltfModel',
    path: 'blocks/building-market.glb',
  },
  {
    name: 'buildingMill',
    type: 'gltfModel',
    path: 'blocks/building-mill.glb',
  },
  {
    name: 'buildingMine',
    type: 'gltfModel',
    path: 'blocks/building-mine.glb',
  },
  {
    name: 'buildingPort',
    type: 'gltfModel',
    path: 'blocks/building-port.glb',
  },
  {
    name: 'buildingSheep',
    type: 'gltfModel',
    path: 'blocks/building-sheep.glb',
  },
  {
    name: 'buildingSmelter',
    type: 'gltfModel',
    path: 'blocks/building-smelter.glb',
  },
  {
    name: 'buildingTower',
    type: 'gltfModel',
    path: 'blocks/building-tower.glb',
  },
  {
    name: 'buildingVillage',
    type: 'gltfModel',
    path: 'blocks/building-village.glb',
  },
  {
    name: 'buildingWall',
    type: 'gltfModel',
    path: 'blocks/building-wall.glb',
  },
  {
    name: 'buildingWalls',
    type: 'gltfModel',
    path: 'blocks/building-walls.glb',
  },
  {
    name: 'buildingWizardTower',
    type: 'gltfModel',
    path: 'blocks/building-wizard-tower.glb',
  },
  {
    name: 'dirt',
    type: 'gltfModel',
    path: 'blocks/dirt.glb',
    skip: true,
  },
  {
    name: 'dirtLumber',
    type: 'gltfModel',
    path: 'blocks/dirt-lumber.glb',
    skip: true,
  },
  {
    name: 'grass',
    type: 'gltfModel',
    path: 'blocks/grass.glb',
  },
  {
    name: 'grassForest',
    type: 'gltfModel',
    path: 'blocks/grass-forest.glb',
  },
  {
    name: 'grassHill',
    type: 'gltfModel',
    path: 'blocks/grass-hill.glb',
  },
  {
    name: 'pathCorner',
    type: 'gltfModel',
    path: 'blocks/path-corner.glb',
    skip: true,
  },
  {
    name: 'pathCornerSharp',
    type: 'gltfModel',
    path: 'blocks/path-corner-sharp.glb',
    skip: true,
  },
  {
    name: 'pathCrossing',
    type: 'gltfModel',
    path: 'blocks/path-crossing.glb',
    skip: true,
  },
  {
    name: 'pathEnd',
    type: 'gltfModel',
    path: 'blocks/path-end.glb',
    skip: true,
  },
  {
    name: 'pathIntersectionA',
    type: 'gltfModel',
    path: 'blocks/path-intersectionA.glb',
    skip: true,
  },
  {
    name: 'pathIntersectionB',
    type: 'gltfModel',
    path: 'blocks/path-intersectionB.glb',
    skip: true,
  },
  {
    name: 'pathIntersectionC',
    type: 'gltfModel',
    path: 'blocks/path-intersectionC.glb',
    skip: true,
  },
  {
    name: 'pathIntersectionD',
    type: 'gltfModel',
    path: 'blocks/path-intersectionD.glb',
    skip: true,
  },
  {
    name: 'pathIntersectionE',
    type: 'gltfModel',
    path: 'blocks/path-intersectionE.glb',
    skip: true,
  },
  {
    name: 'pathIntersectionF',
    type: 'gltfModel',
    path: 'blocks/path-intersectionF.glb',
    skip: true,
  },
  {
    name: 'pathIntersectionG',
    type: 'gltfModel',
    path: 'blocks/path-intersectionG.glb',
    skip: true,
  },
  {
    name: 'pathIntersectionH',
    type: 'gltfModel',
    path: 'blocks/path-intersectionH.glb',
    skip: true,
  },
  {
    name: 'pathSquare',
    type: 'gltfModel',
    path: 'blocks/path-square.glb',
    skip: true,
  },
  {
    name: 'pathSquareEnd',
    type: 'gltfModel',
    path: 'blocks/path-square-end.glb',
    skip: true,
  },
  {
    name: 'pathStart',
    type: 'gltfModel',
    path: 'blocks/path-start.glb',
    skip: true,
  },
  {
    name: 'pathStraight',
    type: 'gltfModel',
    path: 'blocks/path-straight.glb',
    skip: true,
  },
  {
    name: 'riverBridge',
    type: 'gltfModel',
    path: 'blocks/bridge.glb',
  },
  {
    name: 'riverCorner',
    type: 'gltfModel',
    path: 'blocks/river-corner.glb',
  },
  {
    name: 'riverCornerSharp',
    type: 'gltfModel',
    path: 'blocks/river-corner-sharp.glb',
  },
  {
    name: 'riverCrossing',
    type: 'gltfModel',
    path: 'blocks/river-crossing.glb',
  },
  {
    name: 'riverEnd',
    type: 'gltfModel',
    path: 'blocks/river-end.glb',
  },
  {
    name: 'riverIntersectionA',
    type: 'gltfModel',
    path: 'blocks/river-intersectionA.glb',
  },
  {
    name: 'riverIntersectionB',
    type: 'gltfModel',
    path: 'blocks/river-intersectionB.glb',
  },
  {
    name: 'riverIntersectionC',
    type: 'gltfModel',
    path: 'blocks/river-intersectionC.glb',
  },
  {
    name: 'riverIntersectionD',
    type: 'gltfModel',
    path: 'blocks/river-intersectionD.glb',
  },
  {
    name: 'riverIntersectionE',
    type: 'gltfModel',
    path: 'blocks/river-intersectionE.glb',
  },
  {
    name: 'riverIntersectionF',
    type: 'gltfModel',
    path: 'blocks/river-intersectionF.glb',
  },
  {
    name: 'riverIntersectionG',
    type: 'gltfModel',
    path: 'blocks/river-intersectionG.glb',
  },
  {
    name: 'riverIntersectionH',
    type: 'gltfModel',
    path: 'blocks/river-intersectionH.glb',
  },
  {
    name: 'riverStart',
    type: 'gltfModel',
    path: 'blocks/river-start.glb',
  },
  {
    name: 'riverStraight',
    type: 'gltfModel',
    path: 'blocks/river-straight.glb',
  },
  {
    name: 'riverWatermill',
    type: 'gltfModel',
    path: 'blocks/building-watermill.glb',
  },
  {
    name: 'sand',
    type: 'gltfModel',
    path: 'blocks/sand.glb',
  },
  {
    name: 'sandDesert',
    type: 'gltfModel',
    path: 'blocks/sand-desert.glb',
    skip: true,
  },
  {
    name: 'sandRocks',
    type: 'gltfModel',
    path: 'blocks/sand-rocks.glb',
  },
  {
    name: 'stone',
    type: 'gltfModel',
    path: 'blocks/stone.glb',
    skip: true,
  },
  {
    name: 'stoneHill',
    type: 'gltfModel',
    path: 'blocks/stone-hill.glb',
  },
  {
    name: 'stoneMountain',
    type: 'gltfModel',
    path: 'blocks/stone-mountain.glb',
  },
  {
    name: 'stoneRocks',
    type: 'gltfModel',
    path: 'blocks/stone-rocks.glb',
  },
  {
    name: 'unitHouse',
    type: 'gltfModel',
    path: 'blocks/unit-house.glb',
  },
  {
    name: 'unitMill',
    type: 'gltfModel',
    path: 'blocks/unit-mill.glb',
  },
  {
    name: 'unitMansion',
    type: 'gltfModel',
    path: 'blocks/unit-mansion.glb',
  },
  {
    name: 'unitShip',
    type: 'gltfModel',
    path: 'blocks/unit-ship.glb',
  },
  {
    name: 'unitShipLarge',
    type: 'gltfModel',
    path: 'blocks/unit-ship-large.glb',
  },
  {
    name: 'unitTower',
    type: 'gltfModel',
    path: 'blocks/unit-tower.glb',
  },
  {
    name: 'unitTree',
    type: 'gltfModel',
    path: 'blocks/unit-tree.glb',
  },
  {
    name: 'unitWallTower',
    type: 'gltfModel',
    path: 'blocks/unit-wall-tower.glb',
  },
  {
    name: 'water',
    type: 'gltfModel',
    path: 'blocks/water.glb',
  },
  {
    name: 'waterIsland',
    type: 'gltfModel',
    path: 'blocks/water-island.glb',
    skip: true,
  },
  {
    name: 'waterRocks',
    type: 'gltfModel',
    path: 'blocks/water-rocks.glb',
    skip: true,
  },
]

export default resourcesConfig.filter(s => !s.skip)
