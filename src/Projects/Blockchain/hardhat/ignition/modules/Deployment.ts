import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LandDeploymentModule = buildModule("RAJASTHAN_GOVT", (m) => {
  const PropertyUserManagement = m.library("PropertyUserManagement");
 
  const propertyStorage = m.contract("PropertyStorage",[],{
    libraries: {
      PropertyUserManagement: PropertyUserManagement,
    },
  });
 
  const propertyCardStorage = m.contract("PropertyCardStorage");

  
  // Deploy KYCContract with property and card storage addresses
  const kycContract = m.contract("KYCContract",[propertyStorage, propertyCardStorage]);
  
  return { propertyStorage, propertyCardStorage, kycContract };
});

export default LandDeploymentModule;
