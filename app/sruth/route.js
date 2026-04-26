export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>sruth. — Sign Up</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    body {
      background-image: url('/sruth_sign_up.png');
      background-size: cover;
      background-position: center top;
      background-color: #0d1b2e;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: Georgia, 'Times New Roman', serif;
    }

    .wordmark {
      position: absolute;
      top: 0;
      width: 100%;
      text-align: center;
      padding-top: 2vh;
      line-height: 1;
    }

    .wordmark span {
      font-size: clamp(64px, 11vw, 130px);
      font-style: italic;
      font-weight: 900;
      color: #111;
      border-bottom: 3px solid #111;
      padding-bottom: 4px;
      display: inline-block;
    }

    .content {
      text-align: center;
      color: #fff;
      max-width: 660px;
      width: 90%;
      margin-top: 8vh;
      text-shadow: 0 1px 6px rgba(0,0,0,0.55);
    }

    h1 {
      font-size: clamp(32px, 5vw, 52px);
      font-style: italic;
      font-weight: 400;
      margin-bottom: 18px;
    }

    .gaelic {
      font-size: clamp(13px, 1.6vw, 17px);
      font-style: italic;
      line-height: 1.75;
      margin-bottom: 16px;
    }

    .tagline {
      font-size: clamp(12px, 1.4vw, 15px);
      margin-bottom: 24px;
      opacity: 0.92;
    }

    input[type="email"] {
      display: block;
      width: 100%;
      padding: 13px 20px;
      border-radius: 6px;
      border: 1.5px solid rgba(255,255,255,0.75);
      background-color: rgba(255,255,255,0.07);
      color: #fff;
      font-size: 16px;
      font-family: Georgia, serif;
      margin-bottom: 10px;
      outline: none;
    }

    input[type="email"]::placeholder { color: rgba(255,255,255,0.6); }

    button {
      display: block;
      width: 100%;
      padding: 16px 20px;
      border-radius: 6px;
      border: none;
      background-color: #f5f0e8;
      color: #111;
      font-size: clamp(18px, 2.5vw, 26px);
      font-family: Georgia, 'Times New Roman', serif;
      cursor: pointer;
    }

    button em {
      font-weight: 900;
      text-decoration: underline;
      text-underline-offset: 4px;
    }

    .footnote {
      margin-top: 14px;
      font-size: 14px;
      opacity: 0.85;
    }

    .launch {
      margin-top: 28px;
      font-size: 13px;
      opacity: 0.65;
    }

    .thankyou {
      font-size: 18px;
      font-style: italic;
      display: none;
    }
  </style>
</head>
<body>
  <div class="wordmark"><span>sruth.</span></div>

  <div class="content">
    <h1>Sin sibh!</h1>

    <p class="gaelic">
      &lsquo;S math gu bheil sibh an seo. Cuir do chasan anns an uisge bhl&agrave;th&hellip;<br>
      gabh sn&agrave;mh beag. Tha e saor an-asgaidh &lsquo;s chan eil duine<br>
      a&rsquo; coimhead (fhathast). Bidh an C&egrave;ilidh a&rsquo; t&ograve;iseachadh<br>
      a dh&rsquo;aithghearr&mdash;agus gus an uairsin, rach leis an t-sruth!
    </p>

    <p class="tagline">A daily current of G&agrave;idhlig language news, culture, learning, and events.</p>

    <form id="signup" onsubmit="handleSubmit(event)">
      <input type="email" id="email" placeholder="Enter your email" required>
      <button type="submit">Join the <em>sruth.</em></button>
    </form>

    <p class="thankyou" id="thanks">Tapadh leat! We&rsquo;ll be in touch.</p>

    <p class="footnote">No noise. Just the current. Daily.</p>
    <p class="launch">Globalceilidh.com launches soon.</p>
  </div>

  <script>
    function handleSubmit(e) {
      e.preventDefault();
      var email = document.getElementById('email').value;
      if (!email) return;
      document.getElementById('signup').style.display = 'none';
      document.getElementById('thanks').style.display = 'block';
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
