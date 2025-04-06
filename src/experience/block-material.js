import Experience from '@experience'
import { RepeatWrapping, Uniform } from 'three'
import blockBeginVertexChunk from '../shaders/block/chunks/begin-vertex.glsl'
import blockBeginNormalVertexChunk from '../shaders/block/chunks/beginnormal-vertex.glsl'
import blockCommonChunk from '../shaders/block/chunks/common.glsl'
import blockOpaqueChunk from '../shaders/block/chunks/opaque.glsl'
import blockWorkdposVertexChunk from '../shaders/block/chunks/worldpos_vertex.glsl'

export default class BlockMaterial {
  /** @type {BlockMaterial} */
  static instance

  static init() {
    return new BlockMaterial()
  }

  constructor() {
    // Singleton
    if (BlockMaterial.instance) {
      return BlockMaterial.instance
    }

    BlockMaterial.instance = this

    this.experience = Experience.instance
    this.resources = this.experience.resources

    this.resources.items.perlin.wrapT = RepeatWrapping
    this.resources.items.perlin.wrapS = RepeatWrapping

    // Options
    this.uniforms = {
      uTime: new Uniform(0),
      uPerlinTexture: new Uniform(this.resources.items.perlin),
    }

    // Setup
    this.time = Experience.instance.time
  }

  inject = shader => {
    // defines
    shader.defines.USE_UV = true

    // uniforms
    shader.uniforms.uTime = this.uniforms.uTime
    shader.uniforms.uPerlinTexture = this.uniforms.uPerlinTexture

    // common
    shader.vertexShader = shader.vertexShader.replace('#include <common>', blockCommonChunk)
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', blockCommonChunk)

    // vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      blockBeginNormalVertexChunk,
    )
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      blockBeginVertexChunk,
    )
    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      blockWorkdposVertexChunk,
    )

    // fragment shader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      blockOpaqueChunk,
    )
  }

  update = () => {
    this.uniforms.uTime.value = this.time.elapsed
  }
}
