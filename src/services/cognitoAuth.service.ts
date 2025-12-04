import { importSPKI, type JWTPayload, jwtVerify } from 'jose';
import jwksClient from 'jwks-rsa';
import { envConfig } from '../config/env.config.js';
import { logger } from '../utils/logger.js';

export interface CognitoTokenPayload extends JWTPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_number_verified?: boolean;
  'cognito:username'?: string;
  'cognito:groups'?: string[];
  token_use: 'id' | 'access';
  auth_time: number;
  exp: number;
  iat: number;
}

export interface CognitoUserInfo {
  userId: string;
  username: string;
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  groups?: string[];
}

export class CognitoAuthService {
  private readonly jwksClient: jwksClient.JwksClient;
  private readonly issuer: string;
  private readonly audience: string;

  constructor() {
    this.jwksClient = jwksClient({
      jwksUri: envConfig.cognito.jwksUri,
      cache: true,
      cacheMaxAge: 600000,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });

    this.issuer = envConfig.cognito.issuer;
    this.audience = envConfig.cognito.clientId || '';
  }

  private async getSigningKey(kid: string): Promise<string> {
    try {
      const key = await this.jwksClient.getSigningKey(kid);
      return key.getPublicKey();
    } catch (error) {
      logger.error('Error getting signing key from JWKS:', error);
      throw new Error('Unable to get signing key');
    }
  }

  async verifyToken(token: string): Promise<CognitoTokenPayload> {
    try {
      const [headerB64] = token.split('.');
      const header = JSON.parse(Buffer.from(headerB64, 'base64').toString());
      const kid = header.kid;

      if (!kid) {
        throw new Error('Token does not have a kid in the header');
      }

      // Obtener la clave pública en formato PEM
      const publicKeyPem = await this.getSigningKey(kid);

      // Importar la clave PEM usando jose
      const publicKey = await importSPKI(publicKeyPem, 'RS256');

      // Verificar el token
      const { payload } = await jwtVerify(token, publicKey, {
        issuer: this.issuer,
        audience: this.audience,
      });

      return payload as CognitoTokenPayload;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Token verification failed:', error.message);
        throw new Error(`Invalid token: ${error.message}`);
      }
      throw new Error('Invalid token');
    }
  }

  async getUserInfo(token: string): Promise<CognitoUserInfo> {
    const payload = await this.verifyToken(token);

    return {
      userId: payload.sub,
      username: payload['cognito:username'] || payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified,
      phoneNumber: payload.phone_number,
      phoneNumberVerified: payload.phone_number_verified,
      groups: payload['cognito:groups'] || [],
    };
  }

  getLoginUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.audience,
      response_type: 'code',
      scope: 'email openid phone profile',
      redirect_uri: envConfig.cognito.callbackUrl,
    });

    if (state) {
      params.append('state', state);
    }

    return `https://${envConfig.cognito.domain}/oauth2/authorize?${params.toString()}`;
  }

  getLogoutUrl(): string {
    const params = new URLSearchParams({
      client_id: this.audience,
      logout_uri: envConfig.cognito.logoutUrl,
    });

    return `https://${envConfig.cognito.domain}/logout?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    id_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.audience,
      client_secret: envConfig.cognito.clientSecret || '',
      code,
      redirect_uri: envConfig.cognito.callbackUrl,
    });

    const response = await fetch(`https://${envConfig.cognito.domain}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange code for tokens');
    }

    return response.json();
  }
}
