import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
  test: /\.png$/,
  use: 'file-loader',
});

// 1. FILTER OUT THE HIDDEN ASSET-RELOCATOR-LOADER FOR THE FRONTEND RENDERER
const cleanRules = rules.filter(rule => {
  if (rule && typeof rule === 'object' && rule.use) {
    const loaderStr = JSON.stringify(rule.use);
    // If this rule contains the vercel asset relocator loader, drop it!
    if (loaderStr.includes('webpack-asset-relocator-loader')) {
      return false;
    }
  }
  return true;
});

export const rendererConfig: Configuration = {
  module: {
    // 2. Use the filtered, clean rules list here
    rules: cleanRules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
  target: 'web',
};
