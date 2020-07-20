const { resolve } = require("path")
const { DefinePlugin, LoaderOptionsPlugin, ProgressPlugin } = require("webpack")

const CopyWebpackPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")

const isProduction = process.env.NODE_ENV === "production"
const PATH = (...p) => resolve(__dirname, ...p)
const PKG = require(PATH("./package.json"))

const CSSPlugins = [
  require("postcss-import")(),
  ...!isProduction ? [] : [
    require("cssnano")({ preset: "default" })
  ]
]

module.exports = {
  name: PKG.name,

  mode: isProduction ? "production" : "development",
  target: "web",

  context: PATH("./src/app"),

  entry: {
    main: PATH("./src/app/main.js"),
    styles: PATH("./src/app/styles/index.css"),
  },

  resolve: {
    extensions: [".js", ".json"],
    mainFields: [ "es2015", "browser", "module", "main"],
    symlinks: true,
  },

  output: {
    path: PATH("./artifacts/app"),
    filename: `js/[name].[contenthash:10].js`,
    assetModuleFilename: "assets/[name].[contenthash:10].[ext]",
    crossOriginLoading: false,
  },

  experiments: {
    asset: true
  },

  module: {
    rules: [{
      // === HTML ===
      test: /\.html$/i,
      type: "asset/source",
      exclude: [ PATH("./src/app/index.html") ],
    },{
      // === Asset resource ===
      test: /\.(woff2|png|svg|webp|mp4|webm|mp3|ogg|wav)$/i,
      type: "asset/resource",
    },{
      // === Styles ===
      test: /\.css$/i,
      use: [{
        loader: MiniCssExtractPlugin.loader,
        options: {
          esModule: true,
          reloadAll: true,
        },
      },{
        loader: "css-loader",
        options: {
          importLoaders: 1,
          esModule: true,
        }
      },{
        loader: "postcss-loader",
        options: {
          ident: "main",
          plugins: CSSPlugins
        }
      }]
    }],
  },

  plugins: [
    new ProgressPlugin({}),

    new LoaderOptionsPlugin({
      debug: !isProduction,
      sourceMap: !isProduction,
      minimize: isProduction,
    }),

    new DefinePlugin({
      DEFINE_APP_NAME: JSON.stringify(PKG.name.trim()),
      DEFINE_APP_VERSION: JSON.stringify(PKG.version.trim()),
      DEFINE_DEBUG: JSON.stringify(!isProduction),
    }),

    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash:10].css",
      chunkFilename: "css/[name].[contenthash:10].css",
    }),

    new HtmlWebpackPlugin({
      template: PATH("./src/app/index.html"),
      inject: "head",
      chunksSortMode: "manual",
      chunks: ["runtime", "vendor", "common", "styles", "main"],
    }),

    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: "defer"
    }),

    new CopyWebpackPlugin({
      patterns: [
        { from: PATH("./src/app/assets"), to: "assets" },
      ],
    }),
  ],

  optimization: {
    noEmitOnErrors: true,
    removeEmptyChunks: true,
    splitChunks: { chunks: "all" },

    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: !isProduction,
        terserOptions: {
          ecma: 2020,
          output: {
            ascii_only: true,
            comments: false,
          },
          compress: {
            passes: 3,
          },
        }
      }),
    ]
  },

  performance: {
    hints: false,
  },

  node: false,
  profile: false,
  devtool: false,

  stats: "errors-warnings",

}