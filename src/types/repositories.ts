/* eslint-disable */
export interface Repository {

}
/* eslint-enable */

/* eslint-disable */
export interface IServiceRepository extends Repository {
    findOne: (clientId: string, serviceId: string) => Promise<any>;
    findAll: (clientId: string) => Promise<any[]>;
}
/* eslint-disable */
