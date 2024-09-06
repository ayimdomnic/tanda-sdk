import { TandaClient } from "../client";
import type { IConfig } from "../config";
import type { Tanda } from "../types";
import { v4 } from 'uuid'

export class C2B extends TandaClient {
  protected endpoint: string | undefined;
  protected orgId: string | undefined;
  protected resultUrl: string | undefined;

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

  public async request(input: Tanda.Models.IB2CRequest) {
    const reference = v4();

    // record the funding request 

  }
}
