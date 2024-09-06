import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { IConfig } from "../config/client";
import { ConfigSchema } from "../validators";
import { BaseUrls } from "../config";
import axios from "axios";
import { BaseTandaException } from "../exceptions";
import type { AccessTokenResponse } from "../types/access_token";
import type { BaseURL } from "../types";

/**
 * The TandaClient class is responsible for interacting with the Tanda API.
 * It handles authentication, token management, and API request logic.
 *
 * @author Dormnic Odhiambo <ayimdomnic@gmail.com>
 * @version 1.0
 * ```ts
 *  export class TransactionRequest extends TandaClient {
 *      constructor(config?: IConfig) {
 *          super(config)
 *      }
 *
 *      async makeTransaction(input: MakeTransactionInput) {
 *         await this.call('transaction/request', options, 'POST')
 *      }
 * }
 * ```
 */
export class TandaClient {
  /**
   * Axios instance used to make HTTP requests.
   * @private
   */
  private client: AxiosInstance;

  /**
   * Configuration object containing client credentials and environment details.
   * @private
   */
  private config: IConfig;

  /**
   * Object containing base URLs for different environments (UAT, Production, etc.).
   * @private
   * @type { BaseURL }
   */
  private baseUrl: BaseURL = BaseUrls;

  /**
   * Access token used for authenticating API requests.
   * This is obtained using the OAuth 2.0 Client Credentials Flow.
   * @private
   */
  private accessToken?: string | null;

  /**
   * Creates an instance of TandaClient.
   * Initializes the client with a configuration, and fetches an access token.
   *
   * @param {Partial<IConfig>} config - Partial configuration object to customize the client's behavior.
   */
  constructor(config: Partial<IConfig>) {
    const defaultConfig: IConfig = this.getDefaultConfig(config);
    this.config = ConfigSchema.parse(defaultConfig);

    // Initialize Axios client with default settings
    this.client = axios.create({
      baseURL: this.baseUrl[this.config.mode],
      validateStatus: (status) => status >= 200 && status <= 500,
    });

    // Automatically generate access token on initialization
    this.generateAccessToken();
  }

  /**
   * Generates the default configuration by merging the user-provided config with default values.
   *
   * @param {Partial<IConfig>} config - Partial user configuration.
   * @returns {IConfig} - Complete configuration with default values.
   * @private
   */
  private getDefaultConfig(config: Partial<IConfig>): IConfig {
    return {
      mode: "uat",
      clientId: String(process.env.TANDA_CLIENT_ID),
      clientSecret: String(process.env.TANDA_CLIENT_SECRET),
      debug: process.env.NODE_ENV === "development",
      ...config,
    };
  }

  /**
   * Generates an OAuth 2.0 access token using the Tanda API.
   * The generated token is stored in the `accessToken` class property for future requests.
   *
   * @remarks
   * This method should ideally be called during initialization to ensure the client is authenticated.
   * Future improvements could include caching the token to avoid unnecessary API calls.
   *
   * @returns {Promise<void>} - A promise that resolves when the token has been successfully generated.
   * @private
   */
  private async generateAccessToken(): Promise<void> {
    const requestOptions: AxiosRequestConfig = {
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
      requestOptions,
      "POST"
    );

    this.accessToken = response.access_token;
  }

  /**
   * Makes an API call to the Tanda platform.
   *
   * @template T - The expected response type.
   * @param {string} url - The URL endpoint for the API call.
   * @param {AxiosRequestConfig} [options={}] - Optional Axios request configuration settings.
   * @param {"POST" | "GET"} [method="POST"] - The HTTP method to use for the request.
   * @returns {Promise<T>} - A promise resolving with the API response data.
   *
   * @throws {BaseTandaException} - Throws an exception when the request fails.
   *
   * @remarks
   * This method automatically attaches the access token in the request headers if available.
   */
  public async call<T>(
    url: string,
    options: AxiosRequestConfig = {},
    method: "POST" | "GET" = "POST"
  ): Promise<T> {
    const requestOptions: AxiosRequestConfig = {
      ...options,
      method,
      url,
      headers: {
        ...options.headers,
        ...(this.accessToken && {
          Authorization: `Bearer ${this.accessToken}`,
        }),
      },
    };

    try {
      const response: AxiosResponse<T> = await this.client.request<T>(
        requestOptions
      );
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  /**
   * Handles errors that occur during API requests.
   *
   * @param {any} error - The error object from Axios.
   * @throws {BaseTandaException} - Throws a custom exception based on the error type.
   *
   * @private
   */
  private handleError(error: any): never {
    if (error.response) {
      throw new BaseTandaException(
        `Tanda APIs Error: ${error.response.message}`,
        error.response.status
      );
    } else if (error.request) {
      throw new BaseTandaException("Tanda APIs: Gateway Timeout", 504);
    } else {
      throw new BaseTandaException(`Tanda APIs: ${error.message}`, 500);
    }
  }
}
