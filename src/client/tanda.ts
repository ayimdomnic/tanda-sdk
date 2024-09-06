import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { IConfig } from "../config/client";
import { ConfigSchema } from "../validators";
import { BaseUrls } from "../config";
import axios from "axios";
import { BaseTandaException } from "../exceptions";
import type { AccessTokenResponse } from "../types/access_token";

export class TandaClient {
  private client: AxiosInstance;
  private config: IConfig;
  private baseUrl = BaseUrls;
  private accessToken: string | undefined | null;

  constructor(config: Partial<IConfig>) {
    const defaultConfig: IConfig = {
      mode: "uat",
      clientId: String(process.env.TANDA_CLIENT_ID),
      clientSecret: String(process.env.TANDA_CLIENT_SECRET),
      debug: process.env.NODE_ENV === "development",
    };

    this.config = ConfigSchema.parse({ ...config, ...defaultConfig });

    const options: AxiosRequestConfig = {
      baseURL: this.baseUrl[this.config.mode],
      validateStatus: (status) => status >= 200 && status <= 500,
    };

    this.client = axios.create(options);

    this.generateAccessToken();
  }

  /**
   * This method generates the access token from the Tanda Api
   * The aim of this is to have the client always connected and ready for requests,
   * Each api resource or operation api will need to extend this class
   * Todo::add optional caching so the user can always have the token state and reduce number of calls
   * @returns { Promise<void> } - an empty promise as the token is assigned to the class property
   * this can be extended by DI frameworks to ensure token generation and valiation for frameworks like nestjs
   */
  private async generateAccessToken(): Promise<void> {
    const option: AxiosRequestConfig = {
      auth: {
        username: this.config.clientId,
        password: this.config.clientSecret,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: new URLSearchParams({
        grant_type: "client_credentials",
      }).toString(),
    };

    const response = await this.call<AccessTokenResponse>(
      "accounts/v1/oauth/token",
      option,
      "POST"
    );

    this.accessToken = response.access_token;

    //add to cache or something
  }

/**
 * Get access token using the OAuth 2.0 Client Credentials Flow
 * 
 * @link https://docs.tanda.africa/reference/authentication-and-authorization
 * @param { string } url 
 * @param { AxiosRequestConfig } options - this contains the request options configs, here you can set additional headers as per the docs
 * @param { 'GET' | 'POST' } method - This involves the request methods for making the requests
 * @returns { Promise<T>} Promise<T> - Returns the promise with the valid response type from the call made at the point
 * this also allows for easier use of the sdk for nodejs frameworks that require very little configuration
 * @throws { BaseTandaException } - An exception to represent all statuses from the platform
 */
  private async call<T>(
    url: string,
    options: AxiosRequestConfig = {},
    method: "POST" | "GET" = "POST"
  ): Promise<T> {
    if (this.accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    try {
      const response: AxiosResponse<T> = await this.client.request<T>({
        url,
        method,
        ...options.headers,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status >= 500) {
          throw new BaseTandaException(
            `Tanda Apis Error: ${error.response.message}`,
            error.response.status
          );
        } else {
          throw new BaseTandaException(
            `Tanda Apis Error: ${error.response.message}`,
            error.response.status
          );
        }
      } else if (error.request) {
        throw new BaseTandaException("Tanda APIs: Gateway Timeout", 504);
      } else {
        throw new BaseTandaException(`Tanda APIs: ${error.message}`, 500);
      }
    }
  }
}
