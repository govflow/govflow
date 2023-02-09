import type { QueryInterface } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.sequelize.query(`ALTER TYPE "enum_Jurisdiction_cxDataSource" ADD VALUE 'PublicStuff'`);
}
