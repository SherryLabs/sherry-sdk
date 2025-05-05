/** @type {import('jest').Config} */
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFiles: ['./jest.setup.js'],
    //setupFiles: ['<rootDir>/test/setup.js'],
};

module.exports = config;
