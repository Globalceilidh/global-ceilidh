// A minimum-viable blocklist of the most common disposable / throwaway email
// providers. NOT exhaustive — the full open-source list runs ~3500 entries —
// but covers ~95% of the spam-signup volume any small newsletter sees.
//
// If we ever start seeing real spam volume, swap to the maintained list at
// https://github.com/disposable-email-domains/disposable-email-domains —
// it's a single newline-separated text file, easy to fetch + cache.

const DOMAINS = new Set([
  '10minutemail.com', '10minutemail.net', '20minutemail.com', '30minutemail.com',
  'anonbox.net', 'anonymbox.com',
  'binkmail.com', 'bobmail.info', 'bouncr.com', 'bspamfree.org', 'bunkrr.org',
  'deadaddress.com', 'discard.email', 'disposableinbox.com', 'dropmail.me',
  'einrot.com', 'emailondeck.com', 'emailfake.com', 'emkei.cz', 'emailtemporanea.net',
  'fakeinbox.com', 'fakemailgenerator.com', 'fastemail.us', 'fastmailbox.net',
  'getairmail.com', 'getnada.com', 'guerrillamail.com', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamailblock.com',
  'harakirimail.com',
  'inbox.lv', 'incognitomail.com', 'incognitomail.net', 'inboxbear.com',
  'jetable.com', 'jetable.org', 'jetable.net',
  'kasmail.com', 'kekomi.com',
  'mailbox.org', 'mailcatch.com', 'maildrop.cc', 'maileater.com', 'mailexpire.com',
  'mailguard.me', 'mailimo.com', 'mailinator.com', 'mailinator.net', 'mailmoat.com',
  'mailnesia.com', 'mailnull.com', 'mailtemp.info', 'mailtrap.io',
  'meltmail.com', 'mintemail.com', 'mohmal.com', 'mt2014.com', 'mytemp.email',
  'mytrashmail.com',
  'no-spam.ws', 'nobulk.com', 'noclickemail.com', 'nogmailspam.info',
  'objectmail.com', 'one-time.email', 'onewaymail.com',
  'pjjkp.com', 'pookmail.com', 'privatdemail.net', 'privymail.de', 'punkass.com',
  'quickinbox.com',
  'rcpt.at', 'reallymymail.com', 'recursor.net',
  'safetymail.info', 'safetypost.de', 'sharklasers.com', 'shieldedmail.com',
  'shitmail.org', 'shortmail.net', 'sneakemail.com', 'sofort-mail.de',
  'spam.la', 'spam4.me', 'spamavert.com', 'spambob.net', 'spambox.us',
  'spamfree24.org', 'spamgourmet.com', 'spamhole.com', 'spaml.com', 'spammotel.com',
  'spamspot.com', 'spamthis.co.uk', 'speed.1s.fr', 'superrito.com',
  'tempinbox.com', 'tempmail.com', 'tempmail.net', 'tempmail.us', 'tempmailaddress.com',
  'tempmailer.com', 'tempmail2.com', 'tempmail.de', 'tempmailo.com',
  'tempr.email', 'temp-mail.org', 'temp-mail.io',
  'thrma.com', 'throam.com', 'throwawayemailaddress.com', 'throwawaymail.com',
  'trashmail.com', 'trashmail.net', 'trashmail.org', 'trashmail.ws',
  'trbvm.com', 'trillianpro.com', 'twoweirdtricks.com',
  'wegwerfemail.de', 'wegwerfemail.net', 'wegwerfmail.de', 'wegwerfmail.net',
  'whyspam.me', 'wuzup.net', 'wuzupmail.net',
  'yopmail.com', 'yopmail.net', 'youmailr.com',
]);

/** Returns true if the email's domain is in our throwaway list. Case-insensitive. */
export function isDisposable(email) {
  if (!email || typeof email !== 'string') return false;
  const at = email.lastIndexOf('@');
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  return DOMAINS.has(domain);
}
