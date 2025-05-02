import gridConfig from './grid'

export default function setConfigDebug(debug) {
  const landscapeFolder = debug.root.addFolder({ title: '🏔️ landscape', index: 7, expanded: false })
  landscapeFolder.addBinding(gridConfig.landscape.wind, 'speed', {
    label: 'wind speed',
    min: 0,
    max: 1,
    step: 0.01,
  })
  landscapeFolder.addBinding(gridConfig.landscape.ship, 'speed', {
    label: 'ship speed',
    min: 0,
    max: 1,
    step: 0.01,
  })
  landscapeFolder.addBinding(gridConfig.landscape.ship, 'maxVolume', {
    label: 'ship volume',
    min: 0,
    max: 1,
    step: 0.01,
  })

  landscapeFolder.addBinding(gridConfig.landscape.seagulls, 'speed', {
    label: 'seagulls speed',
    min: 0,
    max: 1,
    step: 0.01,
  })
  landscapeFolder.addBinding(gridConfig.landscape.seagulls, 'maxVolume', {
    label: 'seagulls volume',
    min: 0,
    max: 1,
    step: 0.01,
  })

  const oceanFolder = debug.root.addFolder({ title: '🌊 ocean', index: 8, expanded: false })
  oceanFolder.addBinding(gridConfig.ocean.roughness, 'value', {
    label: 'roughness',
    min: 0,
    max: 1,
    step: 0.01,
  })
  oceanFolder.addBinding(gridConfig.ocean.waves, 'frequencyX', {
    label: 'waves frequencyX',
    min: 0,
    max: 1,
    step: 0.01,
  })
  oceanFolder.addBinding(gridConfig.ocean.waves, 'frequencyY', {
    label: 'waves frequencyY',
    min: 0,
    max: 1,
    step: 0.01,
  })
  oceanFolder.addBinding(gridConfig.ocean.waves, 'speed', {
    label: 'waves speed',
    min: 0,
    max: 5,
    step: 0.01,
  })
  oceanFolder.addBinding(gridConfig.ocean.waves, 'scale', {
    label: 'waves scale',
    min: 0,
    max: 1,
    step: 0.01,
  })
}
