import Experience from '@experience'
import blockBeginVertexChunk from '@shaders/block/chunks/begin-vertex.glsl'
import blockCommonChunk from '@shaders/block/chunks/common.glsl'
import blockOpaqueChunk from '@shaders/block/chunks/opaque.glsl'
import blockWorldposVertexChunk from '@shaders/block/chunks/worldpos_vertex.glsl'
import { Uniform } from 'three'

export default class BlockMaterial {
  constructor() {
    this.experience = Experience.instance
    this.resources = this.experience.resources
    this.time = this.experience.time

    this.uniforms = {
      uTime: new Uniform(0),
      uRadius: new Uniform(0),
      uHovered: new Uniform(false),
      uLinked: new Uniform(false),
    }
  }

  inject = shader => {
    // defines
    shader.defines.USE_UV = true

    // uniforms
    shader.uniforms.uTime = this.uniforms.uTime
    shader.uniforms.uRadius = this.uniforms.uRadius
    shader.uniforms.uHovered = this.uniforms.uHovered
    shader.uniforms.uLinked = this.uniforms.uLinked

    // common
    shader.vertexShader = shader.vertexShader.replace('#include <common>', blockCommonChunk)
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', blockCommonChunk)

    // vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      blockBeginVertexChunk,
    )
    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      blockWorldposVertexChunk,
    )

    // fragment shader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      blockOpaqueChunk,
    )
  }

  update() {
    this.uniforms.uTime.value = this.time.elapsed
  }
}
