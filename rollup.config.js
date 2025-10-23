import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'sdk/safedeploy/js/index.ts',
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    }
  ],
  external: ['ethers', 'viem'],
  plugins: [
    resolve({
      preferBuiltins: true
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json'
    })
  ]
};
