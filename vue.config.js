const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const { defineConfig } = require('@vue/cli-service')
const { merge } = require('webpack-merge')


module.exports = defineConfig({
  publicPath:"/",
  outputDir:path.resolve(__dirname, 'dist-webpack'),
  indexPath:path.resolve(__dirname, 'dist-webpack'),
  filenameHashing:false,
  chainWebpack: config => {
    config.module
      .rule('html')
      .use('html-loader')
      .loader('html-loader')
      config.module
      .rule('typescript')
      .use('ts-loader')
      .loader('ts-loader')
      .options({
        appendTsSuffixTo: ['\\.vue$']
      })
      config.module
      .rule('vue')
      .use('vue-loader')
  },
  pages:{
    index:{
      entry:path.resolve(__dirname, "src/components/index.ts")
    }
  }
});