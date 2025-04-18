import Experience from '@experience'
import { RepeatWrapping, Uniform } from 'three'
import blockBeginVertexChunk from '../shaders/block/chunks/begin-vertex.glsl'
import blockBeginNormalVertexChunk from '../shaders/block/chunks/beginnormal-vertex.glsl'
import blockCommonChunk from '../shaders/block/chunks/common.glsl'
import blockOpaqueChunk from '../shaders/block/chunks/opaque.glsl'
import blockWorkdposVertexChunk from '../shaders/block/chunks/worldpos_vertex.glsl'

export default class BlockMaterial {
  constructor() {
    this.experience = Experience.instance
    this.resources = this.experience.resources
    this.time = this.experience.time

    this.resources.items.perlin.wrapT = RepeatWrapping
    this.resources.items.perlin.wrapS = RepeatWrapping

    this.uniforms = {
      uTime: new Uniform(0),
      uPerlinTexture: new Uniform(this.resources.items.perlin),
      uHovering: new Uniform(false),
    }
  }

  inject = shader => {
    // defines
    shader.defines.USE_UV = true

    // uniforms
    shader.uniforms.uTime = this.uniforms.uTime
    shader.uniforms.uPerlinTexture = this.uniforms.uPerlinTexture
    shader.uniforms.uHovering = this.uniforms.uHovering

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
