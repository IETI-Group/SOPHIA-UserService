import { createHmac } from 'node:crypto';
import {
  AdminCreateUserCommand,
  type AdminCreateUserCommandInput,
  type AuthenticationResultType,
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  type InitiateAuthCommandInput,
  ResendConfirmationCodeCommand,
  SignUpCommand,
  type SignUpCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
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
  private readonly cognitoClient: CognitoIdentityProviderClient;

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

    // Initialize AWS Cognito client
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: envConfig.cognito.region,
    });
  }

  /**
   * Calcula el SECRET_HASH requerido por Cognito cuando el cliente tiene un secret configurado
   * SECRET_HASH = Base64(HMAC_SHA256(username + clientId, clientSecret))
   */
  private calculateSecretHash(username: string): string {
    const message = username + this.audience;
    const hmac = createHmac('sha256', envConfig.cognito.clientSecret || '');
    hmac.update(message);
    return hmac.digest('base64');
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

  /**
   * Inicia sesión con email y password usando el flujo USER_PASSWORD_AUTH
   * Retorna los tokens de acceso directamente sin necesidad de OAuth2
   */
  async loginWithPassword(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }> {
    try {
      const input: InitiateAuthCommandInput = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.audience,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          SECRET_HASH: this.calculateSecretHash(email),
        },
      };

      const command = new InitiateAuthCommand(input);
      const response = await this.cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new Error('Authentication failed - no tokens returned');
      }

      const authResult: AuthenticationResultType = response.AuthenticationResult;

      logger.info(`User ${email} logged in successfully`);

      return {
        accessToken: authResult.AccessToken || '',
        idToken: authResult.IdToken || '',
        refreshToken: authResult.RefreshToken || '',
        expiresIn: authResult.ExpiresIn || 3600,
        tokenType: authResult.TokenType || 'Bearer',
      };
    } catch (error) {
      logger.error('Error logging in with password:', error);
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed');
    }
  }

  /**
   * Registra un nuevo usuario en Cognito usando SignUp
   * El usuario necesitará verificar su email antes de poder iniciar sesión
   */
  async signUp(params: {
    email: string;
    password: string;
    givenName: string;
    familyName: string;
    birthdate: string;
  }): Promise<{
    userSub: string;
    userConfirmed: boolean;
    codeDeliveryDetails?: {
      destination?: string;
      deliveryMedium?: string;
      attributeName?: string;
    };
  }> {
    try {
      const input: SignUpCommandInput = {
        ClientId: this.audience,
        Username: params.email,
        Password: params.password,
        SecretHash: this.calculateSecretHash(params.email),
        UserAttributes: [
          { Name: 'email', Value: params.email },
          { Name: 'given_name', Value: params.givenName }, // firstName
          { Name: 'middle_name', Value: params.familyName }, // lastName como middle_name (requerido)
          { Name: 'birthdate', Value: params.birthdate },
          { Name: 'name', Value: `${params.givenName} ${params.familyName}` },
        ],
      };

      const command = new SignUpCommand(input);
      const response = await this.cognitoClient.send(command);

      logger.info(`User ${params.email} signed up successfully in Cognito`);

      return {
        userSub: response.UserSub || '',
        userConfirmed: response.UserConfirmed || false,
        codeDeliveryDetails: response.CodeDeliveryDetails
          ? {
              destination: response.CodeDeliveryDetails.Destination,
              deliveryMedium: response.CodeDeliveryDetails.DeliveryMedium,
              attributeName: response.CodeDeliveryDetails.AttributeName,
            }
          : undefined,
      };
    } catch (error) {
      logger.error('Error signing up user in Cognito:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to sign up user: ${error.message}`);
      }
      throw new Error('Failed to sign up user');
    }
  }

  /**
   * Crea un usuario en Cognito como administrador
   * El usuario puede iniciar sesión inmediatamente sin verificación de email
   * (Solo funciona si el User Pool permite creación de usuarios por admin)
   */
  async adminCreateUser(params: {
    email: string;
    temporaryPassword: string;
    givenName: string;
    familyName: string;
    birthdate: string;
    suppressEmail?: boolean;
  }): Promise<{
    userSub: string;
    username: string;
  }> {
    try {
      const input: AdminCreateUserCommandInput = {
        UserPoolId: envConfig.cognito.userPoolId,
        Username: params.email,
        TemporaryPassword: params.temporaryPassword,
        UserAttributes: [
          { Name: 'email', Value: params.email },
          { Name: 'email_verified', Value: 'true' }, // Mark email as verified
          { Name: 'given_name', Value: params.givenName }, // firstName
          { Name: 'middle_name', Value: params.familyName }, // lastName como middle_name (requerido)
          { Name: 'birthdate', Value: params.birthdate },
          { Name: 'name', Value: `${params.givenName} ${params.familyName}` },
        ],
        MessageAction: params.suppressEmail ? 'SUPPRESS' : undefined,
      };

      const command = new AdminCreateUserCommand(input);
      const response = await this.cognitoClient.send(command);

      logger.info(`User ${params.email} created by admin in Cognito`);

      const userSub = response.User?.Attributes?.find((attr) => attr.Name === 'sub')?.Value || '';

      return {
        userSub,
        username: response.User?.Username || params.email,
      };
    } catch (error) {
      logger.error('Error creating user in Cognito as admin:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      throw new Error('Failed to create user');
    }
  }

  /**
   * Confirma el email de un usuario usando el código de verificación
   */
  async confirmEmail(email: string, confirmationCode: string): Promise<void> {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: this.audience,
        Username: email,
        ConfirmationCode: confirmationCode,
        SecretHash: this.calculateSecretHash(email),
      });

      await this.cognitoClient.send(command);

      logger.info(`Email confirmed successfully for user: ${email}`);
    } catch (error) {
      logger.error('Error confirming email:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to confirm email: ${error.message}`);
      }
      throw new Error('Failed to confirm email');
    }
  }

  /**
   * Reenvía el código de confirmación al email del usuario
   */
  async resendConfirmationCode(email: string): Promise<{
    destination?: string;
    deliveryMedium?: string;
  }> {
    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: this.audience,
        Username: email,
        SecretHash: this.calculateSecretHash(email),
      });

      const response = await this.cognitoClient.send(command);

      logger.info(`Confirmation code resent successfully to: ${email}`);

      return {
        destination: response.CodeDeliveryDetails?.Destination,
        deliveryMedium: response.CodeDeliveryDetails?.DeliveryMedium,
      };
    } catch (error) {
      logger.error('Error resending confirmation code:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to resend confirmation code: ${error.message}`);
      }
      throw new Error('Failed to resend confirmation code');
    }
  }
}
