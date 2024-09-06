import { TandaClient } from "../client";
import type { IConfig } from "../config";
import type { Tanda } from "../types";
import { v4 as uuidv4 } from "uuid";

export class C2B extends TandaClient {
  /**
   * Endpoint to send C2B requests to the Tanda API.
   */
  protected endpoint: string | undefined;

  /**
   * The organization ID assigned to the application on the Tanda API.
   */
  protected orgId: string | undefined;

  /**
   * The result URL for receiving transaction results from Tanda API.
   */
  protected resultUrl: string | undefined;

  /**
   * Initializes the C2B client.
   * @param config Partial configuration for the TandaClient.
   * @param organizationId The ID assigned to the organization by the Tanda API.
   * @param resultUrl The URL where the results of the C2B transaction will be sent.
   * @param endpoint The API endpoint for sending C2B requests.
   */
  constructor(
    config: Partial<IConfig>,
    organizationId: string,
    resultUrl: string,
    endpoint: string
  ) {
    super(config);
    this.orgId = organizationId;
    this.endpoint = endpoint;
    this.resultUrl = resultUrl;
  }

  /**
   * Sends a C2B payment request to the Tanda API.
   *
   * This method constructs a request to initiate a payment from a customer to a merchant using the Tanda API.
   * The response is processed and the result is stored in a `TandaFunding` object, which is then returned.
   *
   * @param input An object containing the details of the C2B request.
   * @param input.serviceProviderId The ID of the service provider (e.g., "MPESA" or "AIRTELMONEY").
   * @param input.merchantWallet The wallet ID of the merchant receiving the payment.
   * @param input.mobileNumber The mobile number of the customer making the payment.
   * @param input.amount The amount to be transferred in the payment.
   * @param [input.customFieldsKeyValue] Optional custom fields for additional parameters.
   *
   * @returns A promise that resolves to a `TandaFunding` object containing the result of the request.
   *
   * @throws `Error` if the API call fails or if an error occurs during processing.
   *
   * @link https://docs.tanda.africa/reference/get-payments
   */
  public async request(
    input: Tanda.Models.IB2CRequest
  ): Promise<Tanda.Models.TandaFunding> {
    const reference = uuidv4();

    // Prepare parameters for the API request
    const parameters: Tanda.Models.IC2BRequestPayload = {
      commandId: "CustomerPayment",
      serviceProviderId: input.serviceProviderId,
      requestParameters: [
        {
          id: "merchantWallet",
          label: "merchantWallet",
          value: input.merchantWallet,
        },
        {
          id: "accountNumber",
          label: "accountNumber",
          value: input.mobileNumber,
        },
        {
          id: "amount",
          label: "amount",
          value: input.amount,
        },
      ],
      referenceParameters: [
        {
          id: "resultUrl",
          label: "resultUrl",
          value: this.resultUrl!,
        },
      ],
      reference,
    };

    // Initialize the funding object
    const funding: Tanda.Models.TandaFunding = {
      fundReference: reference,
      serviceProvider: input.serviceProviderId,
      accountNumber: input.mobileNumber,
      amount: input.amount,
      jsonResponse: null,
      transactionId: null,
      responseMessage: null,
      responseStatus: null,
    };

    try {
      // Send request to the Tanda API
      const response = await this.call<Tanda.Models.TandaAPIResponse>(
        this.endpoint!,
        { data: parameters },
        "POST"
      );

      // Update the funding object with the response
      Object.assign(funding, {
        jsonResponse: JSON.stringify(response),
        responseStatus: response.status,
        responseMessage: response.message,
        transactionId: response.status === "000001" ? response.id : undefined,
      });
    } catch (error: any) {
      // Handle errors and update the funding object with the error details
      funding.responseStatus = error.code || "500";
      funding.responseMessage = error.message || "Unknown Error";
    }

    return funding;
  }
}
