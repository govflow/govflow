import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';
import { makePublicIdForRequest } from '../core/service-requests/helpers';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn(
        'ServiceRequest',
        'publicId',
        { type: DataTypes.STRING,defaultValue: makePublicIdForRequest, allowNull: false }
    );
    await queryInterface.addIndex('ServiceRequest', ['jurisdictionId', 'publicId']);
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('ServiceRequest', 'publicId');
    await queryInterface.removeIndex('ServiceRequest', ['jurisdictionId', 'publicId'])
}
