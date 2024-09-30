import { Permissions } from "../interfaces/IUser";

export enum CreatePermissionControl {
    create_role = 'create_role',
    assign_role = 'assign_role',
    can_create_credential = 'can_create_credential',
    can_create_verifiable_presentation = 'can_create_verifiable_presentation',
    can_verify_presentation = 'can_verify_presentation',
    can_verify_credential = 'can_verify_credential',
    can_create_sdr = 'can_create_sdr',
}

export enum ReadPermissionControl {
    view_roles = 'view_roles',
    view_permission = 'view_permission',
    can_read_issued_CredCount = 'can_read_issued_CredCount',
    can_read_identifiers = 'can_read_identifiers',
    can_read_profile = 'can_read_profile',
    can_read_orgList = 'can_read_orgList',
    can_read_cred_for_sdr="can_read_cred_for_sdr"
    
}
export enum UpdatePermissionControl {
    update_role = 'update_role',
    can_update_org = 'can_update_org',
    
}

export enum DeletePermissionControl {
    
}


export const getPermissionsData = (): Permissions => {
    return {
        createPermissions: { ...CreatePermissionControl },
        readPermissions: { ...ReadPermissionControl },
        updatePermissions: { ...UpdatePermissionControl },
        deletePermissions: { ...DeletePermissionControl },
    };
}
// export enum RoleBasedControl {
//     view_permission = "view_permission",
//     create_permission = "create_permission",
//     update_permission = "update_permission",
// }
