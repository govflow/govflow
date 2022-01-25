import axios from 'axios';
import logger from '../logging';

export interface RecaptchaV2VerificationResponse {
    success: boolean;
    challenge_ts: string,
    hostname: string,
    "error-codes"?: string[]
}

export async function verifyRecaptchaResponse(secretKey: string, responseToken: string): Promise<RecaptchaV2VerificationResponse> {
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    let responseData: RecaptchaV2VerificationResponse;
    try {
        const response = await axios({
            method: 'post',
            url: verifyUrl,
            params: {
                secret: secretKey,
                response: responseToken
            }
        })
        responseData = response.data;
    } catch(error) {
        logger.error({message: 'Failed request to reCaptcha', error: `${error}`})
        responseData = { success: false } as unknown as RecaptchaV2VerificationResponse;
    }
    return responseData;
}
