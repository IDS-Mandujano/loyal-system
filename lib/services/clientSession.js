import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_portal_cliente';
const CLIENT_TOKEN_MAX_AGE = 60 * 60 * 8;

export function createClientToken(clientId) {
  return jwt.sign({ clientId }, JWT_SECRET, { expiresIn: CLIENT_TOKEN_MAX_AGE });
}

export async function getAuthenticatedClientId(request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('client_token')?.value;
    
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader && authHeader.split(' ')[1];

    const token = tokenCookie || bearerToken;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return typeof decoded.clientId === 'number' || typeof decoded.clientId === 'string'
      ? decoded.clientId
      : null;
  } catch (error) {
    return null;
  }
}