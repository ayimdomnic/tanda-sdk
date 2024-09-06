export namespace Tanda.Models {
  export interface IB2CRequest {
    serviceProviderId: string;
    merchantWallet: string;
    mobileNumber: string;
    amount: string;
    customFieldsKeyValue?: Record<string, string>; // Optional custom fields
  }

  export interface TandaFunding {
    fundReference: string;
    serviceProvider: string;
    accountNumber: string;
    amount: string;
    jsonResponse: string | null;
    transactionId: string | null;
    responseStatus: string | null;
    responseMessage: string | null;
  }

  export interface TandaAPIResponse {
    status: string;
    message: string;
    id?: string; // Transaction ID, if available
  }

  export interface IC2BRequestPayload {
    commandId: string; // Command name, e.g., 'CustomerPayment'
    serviceProviderId: string;
    requestParameters: Array<{
      id: string;
      label: string;
      value: string;
    }>;
    referenceParameters: Array<{
      id: string;
      label: string;
      value: string;
    }>;
    reference: string; // Generated reference ID
  }
}
