const crypto = require('crypto');
const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  GetTokensFromRefreshTokenCommand,
  RevokeTokenCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
  GlobalSignOutCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const { getRuntimeConfig } = require('../config/runtimeConfig');

let cognitoClient = null;

function getClient(region) {
  if (!cognitoClient) {
    cognitoClient = new CognitoIdentityProviderClient({ region });
  }

  return cognitoClient;
}

function buildSecretHash(username, clientId, clientSecret) {
  return crypto
    .createHmac('sha256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

async function getCognitoContext(username) {
  const config = await getRuntimeConfig();

  if (!config.cognitoClientSecret) {
    throw new Error('Cognito client secret is not configured');
  }

  return {
    config,
    client: getClient(config.awsRegion),
    secretHash: username
      ? buildSecretHash(username.toLowerCase(), config.cognitoClientId, config.cognitoClientSecret)
      : null
  };
}

function mapCognitoError(error) {
  const name = error.name || error.Code || 'CognitoError';
  console.warn('Cognito request failed:', {
    name,
    message: error.message,
    httpStatusCode: error.$metadata?.httpStatusCode
  });

  const messages = {
    UsernameExistsException: 'Email này đã được đăng ký.',
    UserNotConfirmedException: 'Tài khoản chưa xác nhận email.',
    NotAuthorizedException: 'Email hoặc mật khẩu không đúng.',
    CodeMismatchException: 'Mã xác nhận không đúng.',
    ExpiredCodeException: 'Mã xác nhận đã hết hạn.',
    LimitExceededException: 'Bạn thao tác quá nhiều lần. Vui lòng thử lại sau.',
    TooManyRequestsException: 'Bạn thao tác quá nhiều lần. Vui lòng thử lại sau.',
    InvalidPasswordException: 'Mật khẩu không đúng chính sách bảo mật.',
    InvalidParameterException: 'Dữ liệu không hợp lệ.'
  };

  const mapped = new Error(messages[name] || error.message || 'Cognito request failed');
  mapped.name = name;
  mapped.statusCode = name === 'NotAuthorizedException' ? 401 : 400;
  return mapped;
}

async function registerUser({ email, password, firstName, lastName, fullName }) {
  try {
    const username = email.toLowerCase();
    const { config, client, secretHash } = await getCognitoContext(username);

    const attributes = [
      { Name: 'email', Value: username }
    ];

    const displayName = fullName || [lastName, firstName].filter(Boolean).join(' ').trim();
    if (displayName) {
      attributes.push({ Name: 'name', Value: displayName });
    }

    const response = await client.send(new SignUpCommand({
      ClientId: config.cognitoClientId,
      Username: username,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: attributes
    }));

    return {
      userSub: response.UserSub,
      userConfirmed: response.UserConfirmed,
      codeDeliveryDetails: response.CodeDeliveryDetails
    };
  } catch (error) {
    throw mapCognitoError(error);
  }
}

async function confirmSignUp({ email, code }) {
  try {
    const username = email.toLowerCase();
    const { config, client, secretHash } = await getCognitoContext(username);

    await client.send(new ConfirmSignUpCommand({
      ClientId: config.cognitoClientId,
      Username: username,
      ConfirmationCode: code,
      SecretHash: secretHash
    }));

    return { confirmed: true };
  } catch (error) {
    throw mapCognitoError(error);
  }
}

async function resendConfirmationCode({ email }) {
  try {
    const username = email.toLowerCase();
    const { config, client, secretHash } = await getCognitoContext(username);

    const response = await client.send(new ResendConfirmationCodeCommand({
      ClientId: config.cognitoClientId,
      Username: username,
      SecretHash: secretHash
    }));

    return {
      codeDeliveryDetails: response.CodeDeliveryDetails
    };
  } catch (error) {
    throw mapCognitoError(error);
  }
}

async function loginUser({ email, password }) {
  try {
    const username = email.toLowerCase();
    const { config, client, secretHash } = await getCognitoContext(username);

    const response = await client.send(new InitiateAuthCommand({
      ClientId: config.cognitoClientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash
      }
    }));

    return response.AuthenticationResult;
  } catch (error) {
    throw mapCognitoError(error);
  }
}

async function refreshTokens({ refreshToken, email }) {
  try {
    const { config, client } = await getCognitoContext();

    if (GetTokensFromRefreshTokenCommand) {
      const response = await client.send(new GetTokensFromRefreshTokenCommand({
        ClientId: config.cognitoClientId,
        RefreshToken: refreshToken,
        ClientSecret: config.cognitoClientSecret
      }));

      return response.AuthenticationResult;
    }

    const username = email.toLowerCase();
    const secretHash = buildSecretHash(username, config.cognitoClientId, config.cognitoClientSecret);
    const response = await client.send(new InitiateAuthCommand({
      ClientId: config.cognitoClientId,
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        SECRET_HASH: secretHash
      }
    }));

    return response.AuthenticationResult;
  } catch (error) {
    throw mapCognitoError(error);
  }
}

async function logoutUser({ accessToken, refreshToken, email }) {
  try {
    const username = email ? email.toLowerCase() : null;
    const { config, client, secretHash } = await getCognitoContext(username);

    if (refreshToken && secretHash) {
      await client.send(new RevokeTokenCommand({
        ClientId: config.cognitoClientId,
        ClientSecret: config.cognitoClientSecret,
        Token: refreshToken
      }));
    }

    if (accessToken) {
      await client.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
    }

    return { loggedOut: true };
  } catch (error) {
    throw mapCognitoError(error);
  }
}

async function forgotPassword({ email }) {
  try {
    const username = email.toLowerCase();
    const { config, client, secretHash } = await getCognitoContext(username);

    const response = await client.send(new ForgotPasswordCommand({
      ClientId: config.cognitoClientId,
      Username: username,
      SecretHash: secretHash
    }));

    return {
      codeDeliveryDetails: response.CodeDeliveryDetails
    };
  } catch (error) {
    throw mapCognitoError(error);
  }
}

async function confirmForgotPassword({ email, code, newPassword }) {
  try {
    const username = email.toLowerCase();
    const { config, client, secretHash } = await getCognitoContext(username);

    await client.send(new ConfirmForgotPasswordCommand({
      ClientId: config.cognitoClientId,
      Username: username,
      ConfirmationCode: code,
      Password: newPassword,
      SecretHash: secretHash
    }));

    return { passwordChanged: true };
  } catch (error) {
    throw mapCognitoError(error);
  }
}

async function changePassword({ accessToken, previousPassword, proposedPassword }) {
  try {
    const { client } = await getCognitoContext();

    await client.send(new ChangePasswordCommand({
      AccessToken: accessToken,
      PreviousPassword: previousPassword,
      ProposedPassword: proposedPassword
    }));

    return { passwordChanged: true };
  } catch (error) {
    throw mapCognitoError(error);
  }
}

module.exports = {
  registerUser,
  confirmSignUp,
  resendConfirmationCode,
  loginUser,
  refreshTokens,
  logoutUser,
  forgotPassword,
  confirmForgotPassword,
  changePassword,
  buildSecretHash
};
