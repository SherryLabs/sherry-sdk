// webpack.config.js
const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './src/index.ts',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        filename: 'sherry-sdk.browser.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'SherrySDK',
            type: 'umd',
        },
        globalObject: 'this',
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
            vm: require.resolve('vm-browserify'), // Añade esta línea
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            crypto: ['crypto-browserify'],
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({}),
        }),
    ],
};
