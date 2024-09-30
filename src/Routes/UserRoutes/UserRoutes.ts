// import express from "express";
// import * as UserPostController from "../../Controllers/Post/UserPostController.js";
// import * as UserGetController from "../../Controllers/Get/UserGetController.js";
// import CheckPermission from "../../Middleware/CheckPermission.js";
// import { ReadPermissionControl, UpdatePermissionControl } from "../../DataTypes/rbac/permission.js";
// import checkJwt from "../../Middleware/checkJwt.js";

// const router = express.Router({ mergeParams: true });

// // todo add checkJwt requirement
// // create user

// //get users
// router.get("/orgList",
//     checkJwt,
//     CheckPermission(ReadPermissionControl.can_read_orgList),
//     UserGetController.orgList);

// // get Reqest
// router.get("/getCredentialsforSDR",
//     // checkJwt,
//     // CheckPermission(ReadPermissionControl.can_read_cred_for_sdr),
//     UserGetController.getCredentialsforSDR);

// router.get("/allIdentifiers",
//     // CheckPermission(ReadPermissionControl.can_read_identifiers),
//     UserGetController.allIdentifiers);

// router.get("/issuedCredCount",
//     // CheckPermission(ReadPermissionControl.can_read_issued_CredCount),
//     UserGetController.getIssueCredentialCount);

// // post request
// // router.post("/createIdentifier", UserPostController.create_Identifier);// moved inside updateOrg approval api
// router.post("/createCredential",
//     // CheckPermission(CreatePermissionControl.can_create_credential),
//     UserPostController.create_Credential);

// router.post("/createVerifiablePresentation",
//     // CheckPermission(CreatePermissionControl.can_create_verifiable_presentation),
//     UserPostController.create_VerifiablePresentation);

// router.post("/verifyPresentation",
//     // CheckPermission(CreatePermissionControl.can_verify_presentation),
//     UserPostController.verify_Presentation);

// router.post("/verifycredential",
//     // CheckPermission(CreatePermissionControl.can_verify_credential),
//     UserPostController.verify_credential);

// router.post("/createSDR",
//     // CheckPermission(CreatePermissionControl.can_create_sdr),
//     UserPostController.create_SDR);

// // patch
// router.patch("/updateOrg",
//     checkJwt,
//     CheckPermission(UpdatePermissionControl.can_update_org),
//     UserPostController.updateUser)
// export default router;