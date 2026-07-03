import { IpDetails } from "@/lib/types/ip-details";

export default async function getIpDetails({
  ip,
}: {
  ip: string;
}): Promise<IpDetails> {
  const {
    ip: address,
    asn,
    org,
    isp,
    country,
    country_code,
    is_vpn,
    is_tor,
    is_proxy,
    is_datacenter,
  } = await fetch(`https://api.ipquery.io/${ip}`).then((res) => res.json());
  return {
    ip: address,
    isp: { asn, org, isp },
    location: { country, country_code },
    risk: { is_vpn, is_tor, is_proxy, is_datacenter },
  };
}
