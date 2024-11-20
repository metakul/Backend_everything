import { IloginUser, IsystemAdmin, IUser } from "../interfaces/IUser";
import { AccountStatusType, CategoryType, ErrorObject } from "../types/IUserType";


export const ErrorEnum = {

    InternalserverError: (error?: unknown): ErrorObject => ({
        statusCode: 400,
        message: `Internal Server Error`,
        details: error
    }),
    InvalidInput: (error?: unknown): ErrorObject => ({
        statusCode: 400,
        message: `Invalid Input Error`,
        details: error
    }),
    SignUpValidationError: (data: unknown): ErrorObject => ({
        statusCode: 400,
        message: `User validation Failed. Please Check the Form. Check '${data}'`,
        details: ""
    }),
    MissingEmail: (): ErrorObject => ({
        statusCode: 400,
        message: `Please add a proper email to interact.`,
        details: ""
    }),
    MissingMobile: (): ErrorObject => ({
        statusCode: 400,
        message: `Please add a proper mobile or email to interact.`,
        details: ""
    }),
    UserNotFoundwithPhone: (phoneNumber: IUser['phoneNumber'] | undefined): ErrorObject => ({
        statusCode: 404,
        message: `User with phone '${phoneNumber}' does not exist.`,
        details: ""
    }),
    UserNotFoundwithEmail: (email: IloginUser['email'] | undefined): ErrorObject => ({
        statusCode: 404,
        message: `User with email '${email}' does not exist.`,
        details: ""
    }),
    UserPasswordError: (email: IloginUser['email']): ErrorObject => ({
        statusCode: 401,
        message: `Wrong password received for '${email}' `,
        details: ""
    }),
    UserNotFoundwithStatus: (accountStatus: AccountStatusType): ErrorObject => ({
        statusCode: 404,
        message: `Error Fetching users with status '${accountStatus}'`,
        details: ""
    }),
    NoUsersFound: (accountStatus: AccountStatusType): ErrorObject => ({
        statusCode: 404,
        message: `No users Found with status '${accountStatus}'`,
        details: ""
    }),
    InvalidAccountStatus: (currentStatus: AccountStatusType): ErrorObject => ({
        statusCode: 404,
        message: `Invalid Account Status. Current Status of user is '${currentStatus}'`,
        details: ""
    }),
    Unauthorized: (): ErrorObject => ({
        statusCode: 404,
        message: "Un-Authorised User",
        details: ""
    }),
    InvalidAccountCategory: (userEmail: IUser["email"] | undefined): ErrorObject => ({
        statusCode: 404,
        message: `Invalid Account Category for user '${userEmail}'`,
        details: ""
    }),
    MissingAlias: (): ErrorObject => ({
        statusCode: 400,
        message: `Please add a proper alias to interact.`,
        details: ""
    }),
    MissingCredential: (): ErrorObject => ({
        statusCode: 400,
        message: `Please add a proper Credential in the form.`,
        details: ""
    }),
    MissingFIle: (): ErrorObject => ({
        statusCode: 400,
        message: `Please add a proper File to upload.`,
        details: ""
    }),
    PermissionDeniedError: (requiredCategory: CategoryType): ErrorObject => ({
        statusCode: 400,
        message: `Only ${requiredCategory} can call this`,
        details: ``
    }),
    MissingJwt: (): ErrorObject => ({
        statusCode: 400,
        message: `UnAuthorised User.`,
        details: `Missing JWT from the user`
    }),
    MissingAuth: (): ErrorObject => ({
        statusCode: 400,
        message: `UnAuthorised User.`,
        details: `Auth Header Is Not Present`
    }),
    InvalidJwt: (err: unknown): ErrorObject => ({
        statusCode: 400,
        message: `Invalid User JWT`,
        details: err
    }),
    InvalidJwtSecret: (): ErrorObject => ({
        statusCode: 400,
        message: `Invalid JWT SECRET`,
        details: ""
    }),
    BotNotFound: (): ErrorObject => ({
        statusCode: 400,
        message: `Bot Not Found JWT SECRET`,
        details: ""
    }),
};

export const PaymentError = {

    InternalPaymentError: (error?: unknown): ErrorObject => ({
        statusCode: 500,
        message: `Internal Payment Processing Error`,
        details: error
    }),
    PaymentNotFound: (error?: unknown): ErrorObject => ({
        statusCode: 404,
        message: ` Payment Not Found`,
        details: error
    }),
    
    PaymentMethodNotFound: (method: string): ErrorObject => ({
        statusCode: 404,
        message: `Payment method '${method}' not found.`,
        details: ""
    }),

    PaymentFailed: (reason: string): ErrorObject => ({
        statusCode: 401,
        message: `Payment failed due to: ${reason}`,
        details: ""
    }),

    PaymentTimeout: (): ErrorObject => ({
        statusCode: 401,
        message: `Payment request timed out. Please try again later.`,
        details: ""
    }),

    InvalidPaymentDetails: (): ErrorObject => ({
        statusCode: 400,
        message: `Invalid payment details provided.`,
        details: ""
    }),

    InsufficientFunds: (amount: number): ErrorObject => ({
        statusCode: 401,
        message: `Insufficient funds to complete payment of ${amount}.`,
        details: ""
    }),

    UnauthorizedPaymentAccess: (): ErrorObject => ({
        statusCode: 401,
        message: `Unauthorized access to the payment system.`,
        details: ""
    }),

    DuplicateTransaction: (transactionId: string): ErrorObject => ({
        statusCode: 401,
        message: `Duplicate transaction detected with ID '${transactionId}'.`,
        details: ""
    }),

    PaymentGatewayError: (gateway: string, error: unknown): ErrorObject => ({
        statusCode: 500,
        message: `Payment gateway '${gateway}' encountered an error.`,
        details: error
    }),

    InvalidCouponCode: (couponCode: string): ErrorObject => ({
        statusCode: 400,
        message: `Invalid coupon code '${couponCode}' provided.`,
        details: ""
    }),

    PaymentProcessingError: (): ErrorObject => ({
        statusCode: 500,
        message: `Payment processing service is unavailable at the moment.`,
        details: ""
    }),
};


export const APIKeyError = {
    NoAPIKey: (): ErrorObject => ({
        statusCode: 400,
        message: "No API Key Received",
        details: `No API KEY PROVIDED BY FRONTEND`
    }),
    ErrorValidatingAPIKey: (): ErrorObject => ({
        statusCode: 400,
        message: "Received Wrong API KEY",
        details: `API validation failed`
    }),
    NoAPIKeyFound: (): ErrorObject => ({
        statusCode: 400,
        message: "No API key Found for User in DB.",
        details: `API validation failed`
    }),
}

export const MongooseError = {
    ErrorOfMongoose: (): ErrorObject => ({
        statusCode: 400,
        message: "Check Form Data",
        details: `Oho. Error Via Prisma. Check if database is working Properly. `
    }),
    InvalidDataTypes: (ErrorInfo: unknown, path?: unknown): ErrorObject => ({
        statusCode: 400,
        message: "Check Form Data",
        details: `Invalid details provided. ${JSON.stringify(ErrorInfo)} for ${path} `
    }),
    DatabaseConnectionError: (): ErrorObject => ({
        statusCode: 400,
        message: "Prisma is not connected",
        details: ""
    }),
}

export const SuperAdminError = {
    SuperAdminInitError: (): ErrorObject => ({
        statusCode: 400,
        message: "A Super admin already exists.",
        details: ``
    }),
    ErrorCreatingUser: (): ErrorObject => ({
        statusCode: 400,
        message: "Unknown Error While creating Super Admin.",
        details: ``
    }),
    ErrorLoginSuperAdmin: (email: IsystemAdmin["email"]): ErrorObject => ({
        statusCode: 400,
        message: `System admin Not initialise with email ${email}.`,
        details: ``
    }),
}
export const PermissionError = {
    NotEnoughPermission: (permission: string): ErrorObject => ({
        statusCode: 400,
        message: "User do not Have Enough permisison.",
        details: `use should have permission ${permission}`
    }),
    UnknownUserError: (): ErrorObject => ({
        statusCode: 400,
        message: "User Info Not received to check permisison.",
        details: ``
    }),
}

export const RoleErrors = {
    RoleNotFound: (): ErrorObject => ({
        statusCode: 404,
        message: 'Role not found',
        details: ''
    }),
    InvalidPermissions: (): ErrorObject => ({
        statusCode: 400,
        message: 'Invalid permissions name specified',
        details: ''
    }),
    RoleCreationFailed: (error: unknown): ErrorObject => ({
        statusCode: 400,
        message: 'Role creation failed',
        details: error
    }),
    RoleUpdateFailed: (error: unknown): ErrorObject => ({
        statusCode: 400,
        message: 'Role update failed',
        details: error
    })
};

export const IdentifierErrorEnum = {

    createDIDError: (error: unknown): ErrorObject => ({
        statusCode: 400,
        message: "Error Creating DID",
        details: error
    }),
    createIdentifierError: (error: unknown): ErrorObject => ({
        statusCode: 400,
        message: "Error Creating Idenitfier",
        details: error
    }),
    createCredentialError: (error: unknown): ErrorObject => ({
        statusCode: 400,
        message: "Error Creating Credentials",
        details: error
    }),
    createVerifiablePresentationError: (error: unknown): ErrorObject => ({
        statusCode: 400,
        message: "Error Creating Verifiable Presentation",
        details: error
    }),
    verifyPresentationError: (error: unknown): ErrorObject => ({
        statusCode: 400,
        message: "Error verifying Presentation",
        details: error
    }),
    createSDRVerifyCredentialError: (error: unknown): ErrorObject => ({
        statusCode: 400,
        message: "Error Verifying SDR Credential",
        details: error
    }),
    createSDRError: (error: unknown): ErrorObject => ({
        statusCode: 400,
        message: "Error Creating SDR ",
        details: error
    }),
    credInfoError: (error: unknown): ErrorObject => ({
        statusCode: 400,
        message: "Invalid credential: unable to determine holder ID",
        details: error
    }),
    //get
    getVerifiableCredentialForSDRError: (error: unknown): ErrorObject => ({
        statusCode: 400,
        message: "Error fetching credentials",
        details: error
    }),
    listIdentifierError: (error: unknown): ErrorObject => ({
        statusCode: 400,
        message: "Error fetching Identifiers",
        details: error
    }),
}


export const CommonError = {
    OtpServerError: (error?: any): ErrorObject => ({
        statusCode: 500,
        message: "unknown error while calling otp server",
        details: error
    }),
    OtpApiError: (error: any): ErrorObject => ({
        statusCode: error.code,
        message: error?.error,
        details: error
    }),
    MissingPhoneNumber: (): ErrorObject => ({
        statusCode: 400,
        message: "Phone number is required",
        details: ""
    }),
    MissingDeviceId: (): ErrorObject => ({
        statusCode: 400,
        message: "Device ID is required",
        details: ""
    }),
    MissingApiKey: (): ErrorObject => ({
        statusCode: 400,
        message: "API key is required",
        details: ""
    }),
    MissingOtp: (): ErrorObject => ({
        statusCode: 400,
        message: "OTP is required",
        details: ""
    }),
    MissingTransactionId: (): ErrorObject => ({
        statusCode: 400,
        message: "Transaction ID is required",
        details: ""
    })
};


export const BlockchainError = {
    MissingPrivateKey: (): ErrorObject => ({
        statusCode: 400,
        message: "Missing Private Key",
        details: "A valid private key must be provided to execute this action."
    }),
    MissingContractNameOrPrivateKey: (): ErrorObject => ({
        statusCode: 400,
        message: "Missing Contract Name or Private Key",
        details: "Both contract name and private key must be provided."
    }),
    HardhatError: (hardhatError:any): ErrorObject => ({
        statusCode: 400,
        message: "Error interacting with blockchain",
        details: hardhatError
    }),
    MissingProviderUrl : (): ErrorObject =>({
        statusCode: 400,
        message: "Rpc Url Required",
        details: "A valid Rpc endpoint is needed to interact with blockchain."
    })
    // Add other specific blockchain-related errors as needed
};
export const BlogsError = {
    InvalidStatusProvided: (): ErrorObject => ({
        statusCode: 400,
        message: "Invalid Status Provided",
        details: "The provided status is not valid."
    }),
    InvalidBlogDetails: (blogIdValidation:any): ErrorObject => ({
        statusCode: 400,
        message: "Invalid Blog Details",
        details: blogIdValidation
    }),
    BlogNotFound: (): ErrorObject => ({
        statusCode: 404,
        message: "Blog Not Found",
        details: "The specified blog does not exist."
    }),
    ErrorAddingBlog: (): ErrorObject => ({
        statusCode: 400,
        message: "Error Adding Blog",
        details: "There was an error while adding the new blog."
    }),
    // Add other specific blog-related errors as needed
};

export const DropShipsError = {
    InvalidStatusProvided: (): ErrorObject => ({
        statusCode: 400,
        message: "Invalid Status Provided",
        details: "The provided status is not valid."
    }),
    InvalidDropShipDetails: (dropShipItemsIdValidation:any): ErrorObject => ({
        statusCode: 400,
        message: "Invalid DropShip Details",
        details: dropShipItemsIdValidation
    }),
    DropShipNotFound: (): ErrorObject => ({
        statusCode: 404,
        message: "No More DropShip Item Found",
        details: "The specified dropShip does not exist."
    }),
    ErrorAddingDropShip: (): ErrorObject => ({
        statusCode: 400,
        message: "Error Adding DropShip",
        details: "There was an error while adding the new dropShip."
    }),
    // Add other specific dropShip-related errors as needed
};