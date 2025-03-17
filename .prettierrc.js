module.exports = {
    semi: true,
    trailingComma: 'all',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2, // Default para todos los archivos
    arrowParens: 'avoid',
    bracketSpacing: true,
    endOfLine: 'lf',
    useTabs: false,
    quoteProps: 'as-needed',
    // Configuración específica por tipo de archivo
    overrides: [
        {
            files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
            options: {
                tabWidth: 4, // 4 espacios sólo para archivos JavaScript y TypeScript
            },
        },
    ],
};
