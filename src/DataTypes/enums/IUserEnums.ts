export enum accountStatus {
    Approved = 'approved',
    Rejected = 'rejected',
    Pending = 'pending',
    Blocked='blocked'
}

export enum UserCategory {
    Verifier = 'verifier',
    Holder = 'holder',
    User = 'user',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum otpPurpose {
    LOGIN = 'authorisation',
    RESET_PASSWORD = 'RESET_PASSWORD',
}

export enum BlogsStatusInfo {
    APPROVED = 'approved',
    PENDING = 'pending',
    REJECTED = 'rejected'
  }