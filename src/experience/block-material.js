import Experience from '@experience'
import { Uniform } from 'three'
import blockBeginVertexChunk from '../shaders/block/chunks/begin-vertex.glsl'
import blockBeginNormalVertexChunk from '../shaders/block/chunks/beginnormal-vertex.glsl'
import blockCommonChunk from '../shaders/block/chunks/common.glsl'
import blockOpaqueChunk from '../shaders/block/chunks/opaque.glsl'

export default class BlockMaterial {
  /** @type {BlockMaterial} */
  static instance

  static init(shader) {
    return new BlockMaterial(shader)
  }

  constructor(shader) {
    // Singleton
    if (BlockMaterial.instance) {
      return BlockMaterial.instance
    }

    BlockMaterial.instance = this

    // Options
    this.uniforms = {
      uTime: new Uniform(0),
    }

    // Setup
    this.time = Experience.instance.time

    this.inject(shader)
  }

  inject(shader) {
    // defines
    shader.defines.USE_UV = true

    // uniforms
    shader.uniforms.uTime = this.uniforms.uTime

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
