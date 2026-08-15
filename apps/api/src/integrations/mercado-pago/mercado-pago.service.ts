import { createHash, randomBytes } from "node:crypto";

import { Injectable, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";

import { DatabaseService } from "../../database/database.service.js";
import { decryptSecret, encryptSecret, hashOpaqueToken } from "./secret-vault.js";

type OAuthTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user_id: number;
  public_key?: string;
};

@Injectable()
export class MercadoPagoService {
  constructor(private readonly database: DatabaseService) {}

  async createAuthorizationUrl(tenantId: string, userId: string): Promise<string> {
    const config = this.configuration();
    const state = randomBytes(32).toString("base64url");
    const verifier = randomBytes(48).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");

    await this.database.client.mercadoPagoOAuthState.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });
    await this.database.client.mercadoPagoOAuthState.create({
      data: {
        tenantId,
        userId,
        stateHash: hashOpaqueToken(state),
        codeVerifierEncrypted: encryptSecret(verifier),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const url = new URL("https://auth.mercadopago.com/authorization");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", config.redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    return url.toString();
  }

  async completeAuthorization(code: string, state: string): Promise<string> {
    const config = this.configuration();
    const oauthState = await this.database.client.mercadoPagoOAuthState.findUnique({
      where: { stateHash: hashOpaqueToken(state) },
    });
    if (!oauthState || oauthState.expiresAt <= new Date()) {
      throw new UnauthorizedException("La autorizacion vencio o no es valida");
    }
    await this.database.client.mercadoPagoOAuthState.delete({ where: { id: oauthState.id } });

    const token = await this.exchangeToken({
      grant_type: "authorization_code",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
      code_verifier: decryptSecret(oauthState.codeVerifierEncrypted),
    });
    if (!token.refresh_token) throw new ServiceUnavailableException("Mercado Pago no devolvio refresh token");

    await this.database.client.mercadoPagoConnection.upsert({
      where: { tenantId: oauthState.tenantId },
      update: this.connectionData(token),
      create: { tenantId: oauthState.tenantId, ...this.connectionData(token) },
    });
    return oauthState.tenantId;
  }

  private connectionData(token: OAuthTokenResponse) {
    return {
      mercadoPagoUserId: String(token.user_id),
      accessTokenEncrypted: encryptSecret(token.access_token),
      refreshTokenEncrypted: encryptSecret(token.refresh_token!),
      accessTokenExpiresAt: token.expires_in
        ? new Date(Date.now() + token.expires_in * 1000)
        : null,
      publicKey: token.public_key ?? null,
      liveMode: token.access_token.startsWith("APP_USR"),
      connectedAt: new Date(),
    };
  }

  private async exchangeToken(body: Record<string, string>): Promise<OAuthTokenResponse> {
    const response = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json().catch(() => null)) as OAuthTokenResponse | null;
    if (!response.ok || !result?.access_token) {
      throw new ServiceUnavailableException("No se pudo conectar la cuenta de Mercado Pago");
    }
    return result;
  }

  private configuration() {
    const clientId = process.env.MP_CLIENT_ID;
    const clientSecret = process.env.MP_CLIENT_SECRET;
    const redirectUri = process.env.MP_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) {
      throw new ServiceUnavailableException("Falta configurar OAuth de Mercado Pago");
    }
    return { clientId, clientSecret, redirectUri };
  }
}
