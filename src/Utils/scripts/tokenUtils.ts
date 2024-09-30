import jwt from 'jsonwebtoken';
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";
import config from "../../../config.js";
import { IUserWithDid, IsystemAdmin } from "../../DataTypes/interfaces/IUser.js";
import { ErrorEnum } from '../../DataTypes/enums/Error.js';

const JWT_SECRET = config.JWT_SECRET;

export const generateToken = (user: IUserWithDid | IsystemAdmin): string => {
    if (!JWT_SECRET) {
        throw ErrorEnum.InvalidJwtSecret();
    }

    let token: string;

    if ('category' in user && user.category === UserCategory.SUPER_ADMIN) {
        token = jwt.sign(
            {
                name: user.name,
                category: user.category,
                email: user.email,
                permissions: user.permissions
            },
            JWT_SECRET as string,
            { expiresIn: "24h" }
        );
    } else if ('accountStatus' in user) {
        token = jwt.sign(
            {
                userId: user.id,
                category: user.category,
                email: user.email,
                address: user.address,
                permissions: user.permissions,
                publicKey: user.publicKey,
            },
            JWT_SECRET as string,
            { expiresIn: "30h" }
        );
    } else {
        // todo add error via error enums
        throw ErrorEnum.InvalidJwtSecret();
    }

    return token;
};
