import type { QueryInterface } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.sequelize.query(`ALTER TYPE "enum_ServiceRequest_status" ADD VALUE 'junk'`);
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {

}
