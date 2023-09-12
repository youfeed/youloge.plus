import { defineConfig } from "vite";

export default defineConfig({
  build: {
    sourcemap:false,
    lib: {
      format: 'umd',
      entry: './lib/index.js',
      name: 'youloge.plus',
      fileName: (format) => `youloge.plus.${format}.js`,
    }
  }
})