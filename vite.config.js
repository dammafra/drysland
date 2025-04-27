import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import glsl from 'vite-plugin-glsl'
import restart from 'vite-plugin-restart'

export default {
  root: 'src/',
  publicDir: '../static/',
  base: './',
  server: {
    host: true, // Open to local network and display URL
  },
  build: {
    outDir: '../dist', // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
  },
  plugins: [
    tailwindcss(),
    restart({ restart: ['../static/**'] }), // Restart server on static file change
    glsl(),
  ],
  resolve: {
    alias: {
      '@blocks': path.resolve(__dirname, 'src/experience/blocks'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@experience': path.resolve(__dirname, 'src/experience/experience.js'),
      '@grid': path.resolve(__dirname, 'src/experience/grid'),
      '@shaders': path.resolve(__dirname, 'src/shaders'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
}
