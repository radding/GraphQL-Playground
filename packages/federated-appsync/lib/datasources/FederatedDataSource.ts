export interface IFederatedDataSource {
    createResolver(id: string, props: unknown): any;
}