import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
  test: /\.(png|jpe?g|gif|svg)$/i,
  type: 'asset/resource', // Tells Webpack to emit files and export URLs
});

// 1. FILTER OUT INCOMPATIBLE LOADERS
const cleanRules = rules.filter(rule => {
  if (rule && typeof rule === 'object') {
    const ruleStr = JSON.stringify(rule);

    // Drop the vercel asset relocator loader for the frontend renderer
    if (ruleStr.includes('webpack-asset-relocator-loader')) {
      return false;
    }

    // CRITICAL: Drop ts-loader ONLY during tests so babel-loader handles TS parsing + coverage
    if (process.env.NODE_ENV === 'test' && ruleStr.includes('ts-loader')) {
      return false;
    }
  }
  return true;
});

// 2. INJECT LOADERS (Babel for tests, standard TS parsing for normal execution)
if (process.env.NODE_ENV === 'test') {
  cleanRules.push({
    test: /\.(js|ts|jsx|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          '@babel/preset-env',
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
        plugins: ['istanbul'], // Seamlessly inject coverage tracking
      },
    },
  });
} else {
  // During normal runs (npm start / npm run make), re-add ts-loader for your tsx files
  cleanRules.push({
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  });
}

export const rendererConfig: Configuration = {
  module: {
    rules: cleanRules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
  target: 'web',
};
