export namespace Tanda.Models {
  export type IB2CRequest = {
    serviceProviderId: string;
    merchantWallet: string;
    amount: string;
    [key: string]: string;
  };
}
