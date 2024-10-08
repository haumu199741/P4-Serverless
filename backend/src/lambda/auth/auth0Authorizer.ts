import Axios from 'axios';
import { createLogger } from '../../utils/logger';
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { JwtPayload } from '../../auth/JwtPayload';
import { verify } from 'jsonwebtoken'


const logger = createLogger('auth')
const jwksUrl = 'https://haumu199741.us.auth0.com/.well-known/jwks.json'


export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // TODO: Implement token verification
  const res = await Axios.get(jwksUrl);
  const signKeys = res['data']['keys'][0]['x5c'][0];
  if (!signKeys.length) throw new Error("error");
    const certificate = `-----BEGIN CERTIFICATE-----\n${signKeys}\n-----END CERTIFICATE-----`;
    
  return verify(token, certificate, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')
  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')
  const split = authHeader.split(' ')
  const token = split[1]
  return token
}
