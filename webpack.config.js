const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'production', // O 'development' para depuración
    entry: './src/index.ts', // Punto de entrada de tu SDK
    output: {
        filename: 'index.esm.js', // Nombre del archivo de salida ESM
        path: path.resolve(__dirname, 'dist'), // Directorio de salida
        library: {
            type: 'module', // ¡Fundamental para generar ESM!
        },
        // Limpia el directorio de salida antes de emitir. Opcional.
        // clean: true,
    },
    // Habilita los experimentos necesarios para la salida ESM
    experiments: {
        outputModule: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    compilerOptions: {
                        module: 'esnext', // Forzar ESM incluso si tsconfig usa commonjs
                        moduleResolution: 'node',
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            // Polyfills/Fallbacks para módulos core de Node.js usados en el navegador
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'), // Necesario para ProvidePlugin de Buffer
            vm: require.resolve('vm-browserify'),
            // Añade otros si son necesarios por tu código o dependencias (ej: path, os, url, etc.)
            // 'path': require.resolve('path-browserify'),
        },
    },
    plugins: [
        // Provee Buffer globalmente (necesario para muchos paquetes crypto/web3)
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        // Provee 'process/browser' para código que espera 'process' (común en librerías)
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        // Define variables de entorno. Es mejor definir solo las necesarias.
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
            // Define otras variables de process.env que tu código use explícitamente
            // 'process.env.SOME_VAR': JSON.stringify('some_value'),
        }),
        // Nota: No necesitas ProvidePlugin para 'crypto' si usas resolve.fallback.
    ],
    // Externaliza las dependencias para que no se incluyan en el bundle.
    // El consumidor del SDK debe instalar estas dependencias.
    externals: [
        // Esta regex externaliza todo lo que esté en node_modules.
        // Es la forma más común y recomendada para librerías/SDKs.
        /node_modules/,
        /^(?!\.\/|\.\.\/|\.)/,
    ],
    // Opcional: Genera source maps para facilitar la depuración
    devtool: 'source-map', // 'source-map' para producción, 'eval-source-map' para desarrollo
    // Ignora warnings sobre dependencias críticas si estás seguro de que los fallbacks los manejan
    ignoreWarnings: [/Critical dependency: the request of a dependency is an expression/],
};
