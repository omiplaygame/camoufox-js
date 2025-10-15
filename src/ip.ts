import { Impit } from 'impit';

export class InvalidIP extends Error { }
export class InvalidProxy extends Error { }

export interface Proxy
{
	server: string;
	username?: string;
	password?: string;
	bypass?: string;
}

export class ProxyHelper
{
	static parseServer(server: string): { schema: string, url: string, port?: string }
	{
		const proxyMatch = server.match(/^(?:(\w+):\/\/)?(.*?)(?::(\d+))?$/);
		if (!proxyMatch)
		{
			throw new InvalidProxy(`Invalid proxy server: ${server}`);
		}
		return {
			schema: proxyMatch[1] || 'http',
			url: proxyMatch[2],
			port: proxyMatch[3]
		};
	}

	static asString(proxy: Proxy): string
	{
		const { schema, url, port } = this.parseServer(proxy.server);
		let result = `${schema}://`;
		if (proxy.username)
		{
			result += proxy.username;
			if (proxy.password)
			{
				result += `:${proxy.password}`;
			}
			result += '@';
		}
		result += url;
		if (port)
		{
			result += `:${port}`;
		}
		return result;
	}

	static asAxiosProxy(proxyString: string): { [key: string]: string }
	{
		return {
			http: proxyString,
			https: proxyString,
		};
	}
}

export function validIPv4(ip: string | false): boolean
{
	if (!ip)
	{
		return false;
	}
	return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip);
}

export function validIPv6(ip: string | false): boolean
{
	if (!ip)
	{
		return false;
	}
	return /^(([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4})$/.test(ip);
}

export function validateIP(ip: string): void
{
	if (!validIPv4(ip) && !validIPv6(ip))
	{
		throw new InvalidIP(`Invalid IP address: ${ip}`);
	}
}

export async function publicIP(proxy?: string): Promise<string>
{
	const URLS = [
		"https://api.ipify.org",
		"https://checkip.amazonaws.com",
		"https://ipinfo.io/ip",
		"https://icanhazip.com",
		"https://ifconfig.co/ip",
		"https://ipecho.net/plain",
	];

	const LIMIT_RETRIES = 2;
	const allErrors = [];
	const TIMEOUT_MS = 7_000;

	for (let attempt = 1; attempt <= LIMIT_RETRIES; attempt++)
	{
		// socks5 -> socks5h (remote DNS)
		let proxyForFetch = proxy;
		try
		{
			if (proxyForFetch && /^socks5:\/\//i.test(proxyForFetch))
			{
				proxyForFetch = proxyForFetch.replace(/^socks5:\/\//i, "socks5h://");
			}
		}
		catch
		{
			/* no-op */
		}

		// легкая рандомизация порядка, чтобы не бить один и тот же сервис
		const urls = [...URLS].sort(() => Math.random() - 0.5);
		const errorsThisAttempt = [];

		for (const baseUrl of urls) 
		{
			// анти-кеширование на всякий случай
			const url = `${baseUrl}?_=${Date.now()}`;

			try
			{
				const impit = new Impit({
					proxyUrl: proxyForFetch,
					timeout: TIMEOUT_MS,
					headers: {
						Accept: "text/plain"
					},
				});

				const res = await impit.fetch(url);
				if (!res.ok) continue;

				const ip = (await res.text()).trim();

				validateIP(ip);
				return ip;

			}
			catch (err)
			{
				errorsThisAttempt.push(err);
				if (process.env.CAMOUFOX_DEBUG) 
				{
					console.warn(
						new InvalidProxy(
							`camoufox-js(warn): Failed to fetch public proxy IP from ${baseUrl} (attempt ${attempt}), trying another URL...`, {
							cause: err
						}
						)
					);
				}
			}
		}

		allErrors.push(...errorsThisAttempt);

		// если это не последняя попытка — делаем короткий backoff
		if (attempt < LIMIT_RETRIES)
		{
			const sleep = 200 * attempt + Math.random() * 200;
			await new Promise((r) => setTimeout(r, sleep));
		}
	}

	throw new InvalidIP("Failed to get a public proxy IP address from any API endpoint.", { cause: allErrors });
}
