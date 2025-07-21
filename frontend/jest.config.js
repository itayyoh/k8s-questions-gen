module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootdir>/src/setupTests.js'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    transformIgnorePatterns: [
        'node_modules/(?!(axios)/'
    ],
    extensionsToTreatAsEsm: ['.jsx'],
    globals: {
        'ts-jest': {
            useESM: true
        }
    }
}