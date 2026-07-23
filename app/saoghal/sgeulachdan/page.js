// app/saoghal/sgeulachdan/page.js
// Renamed to the Archives (Tasglann). This path is kept only so older
// links and the previous Duilleag nav item don't 404 — it redirects to the
// canonical index at /saoghal/archives.

import { redirect } from 'next/navigation';

export default function SgeulachdanRedirect() {
  redirect('/saoghal/archives');
}
