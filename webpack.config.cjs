const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const BundleAnalyzerPlugin =
    require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
    mode: 'development',
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    devtool: 'source-map',
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist'),
        },
        port: 3000,
        open: true,
        hot: true,
        compress: true,
        historyApiFallback: true,
    },
    module: {
        rules: [
            // Extracts the compiled CSS from the SASS files defined in the entry
            {
                test: /\.scss$/,
                use: [
                    {
                        // Interprets CSS
                        loader: "css-loader",
                        options: {
                            importLoaders: 2
                        }
                    },
                    {
                        loader: 'sass-loader' // 将 Sass 编译成 CSS
                    }
                ]
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'svg-sprite-loader',
                        options: {
                            extract: true,
                            spriteFilename:`svg-sprite.svg`,
                            outputPath: './',
                            publicPath: './icons/',
                            symbolId: filePath => "svg-icon-" + path.basename(filePath).slice(0, -4)
                        }
                    },
                    'svgo-loader'
                ],
            },
            {
                test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                type: 'asset'
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Webpack App',
            filename: 'index.html',
            template: 'page/index-webpack.html',
        }),
   /*     new BundleAnalyzerPlugin(),*/
        new SpriteLoaderPlugin(),
    ],
}