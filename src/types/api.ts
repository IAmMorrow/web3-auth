// api/verify.ts

import { SiweMessage } from "siwe";

export type VerifyRequestParams = {
    message: SiweMessage,
    signature: string,
};

type VerifyRequestResultSuccess = {
    ok: true,
    address: string,
}

type VerifyRequestResultError = {
    ok: false,
    message: string,
}

export type VerifyRequestResult = VerifyRequestResultSuccess | VerifyRequestResultError

// api/nonce.ts

export type NonceRequestParams = {

}

export type NonceRequestResult = {
    nonce: string,
}

// api/me.ts

export type MeRequestParams = {
    
}

export type MeRequestResult = {
    address: string,
}

// api/logout.ts

export type LogoutRequestParams = {
    
}

export type LogoutRequestResult = {
    ok: boolean,
}

// api/jwt.ts

export type JWTRequestParams = {
    
}

export type JWTRequestResult = {
    jwt: string,
}
