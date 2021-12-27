module.exports = {
    'env': {
        'node': true,
        'browser': true,
        'es2021': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 12,
        'sourceType': 'module'
    },
    'plugins': [
        '@typescript-eslint'
    ],
    'rules': {
        'no-console': 0,
        'max-len': [
            2,
            120,
            4,
            {
                'ignoreComments': true,
                'ignorePattern': '^import .* |^export .*',
            }
        ],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { varsIgnorePattern: '^_',},
        ],
    }
};
