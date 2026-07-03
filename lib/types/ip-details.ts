interface IpDetails {
  ip: string;
  // i dont think we need this but fuck it
  isp: {
    asn: string;
    org: string;
    isp: string;
  };
  // ... not adding more bullshittt..... bleh
  location: {
    country: string;
    country_code: string;
  };
  // i wish this was just one thing
  risk: {
    is_vpn: boolean;
    is_tor: boolean;
    is_proxy: boolean;
    is_datacenter: boolean;
  };
}

export type { IpDetails };
