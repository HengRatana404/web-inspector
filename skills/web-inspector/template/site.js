// Shared helpers: decide whether a URL belongs to the site being tested.
// "example.com" and "www.example.com" (and http/https) count as the same site, and so do
// localhost, 127.0.0.1 and [::1] (all "this computer") on the same port.

const LOOPBACK = /^(localhost|127(\.\d+){3}|\[::1\])$/;
const bareHost = (u) => {
  const url = new URL(u);
  const host = LOOPBACK.test(url.hostname) ? 'localhost' : url.hostname.replace(/^www\./, '');
  return `${host}:${url.port}`;
};

function sameSite(a, b) {
  try {
    return bareHost(a) === bareHost(b);
  } catch {
    return false;
  }
}

// Detects bot-protection / challenge pages (Cloudflare and similar) so the tests can stop and say so
// instead of reporting the challenge page as the website.
function looksLikeBotCheck(status, headers, title) {
  if (![403, 429, 503].includes(status)) return false;
  if (headers['cf-mitigated'] || headers['cf-chl-bypass']) return true;
  return /just a moment|attention required|checking your browser|access denied|verify you are human|ddos protection/i.test(title || '');
}

module.exports = { sameSite, looksLikeBotCheck };
