import awsConfig from './aws-exports';

declare module './aws-exports' {
    const awsConfig: { [key: string]: any };
    export default awsConfig;
  }