import { StaffUserAttributes, StaffUserDepartmentInlineAttributes, StaffUserDepartmentModel } from "../../types";

export async function getDepartmentsForStaffUser(
    staffUser: StaffUserAttributes, mapper: StaffUserDepartmentModel
): Promise<StaffUserDepartmentInlineAttributes[]> {
    const departments = await mapper.findAll(
        { where: { staffUserId: staffUser.id }, attributes: ['departmentId', 'isLead'] }
    ) as unknown as StaffUserDepartmentInlineAttributes[];
    return departments ? departments : [];
}
