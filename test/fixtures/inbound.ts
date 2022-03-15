export const inboundEmail = {
    headers: 'Received: by 1234mvd7.sendgrid.net with SMTP id t5sWpZPHWH Tue, 01 Mar 2022 13:31:57 +0000 (UTC)\n' +
      'From: Jo Bloggs <jo.bloggs@example.com>\n' +
      'Content-Type: text/plain; charset=us-ascii\n' +
      'Content-Transfer-Encoding: 7bit\n' +
      'Mime-Version: 1.0 (Mac OS X Mail 15.0 \\(3693.40.0.1.81\\))\n' +
      'Subject: This is the subject line\n' +
      'Message-Id: <E6000B59-FA06-4BCB-9A90-E91F3615BD91@icloud.com>\n' +
      'Date: Tue, 1 Mar 2022 15:31:54 +0200\n' +
      'To: test@inbound.example.com\n' +
      'X-Mailer: Apple Mail (2.3693.40.0.1.81)\n',
    attachments: '0',
    dkim: '{@example.com : pass}',
    subject: 'This is the subject line',
    to: 'fake-jurisdiction-id.fake-department-id@inbound.example.com',
    spam_score: '0',
    from: 'Jo Bloggs <jo.bloggs@example.com>',
    text: 'This is the text\n',
    sender_ip: '1.1.1.1',
    spam_report: 'Spam detection software, running on the system "1234mvd7.sendgrid.net",\n' +
      'has NOT identified this incoming email as spam.  The original\n' +
      'message has been attached to this so you can view it or label\n' +
      'similar future email.  If you have any questions, see\n' +
      '@@CONTACT_ADDRESS@@ for details.\n' +
      '\n' +
      'Content preview:  This [...] \n' +
      '\n' +
      'Content analysis details:   (0.0 points, 5.0 required)\n' +
      '\n' +
      ' pts rule name              description\n' +
      '---- ---------------------- --------------------------------------------------\n' +
      '\n',
    envelope: '{"to":["test@inbound.example.com"],"from":"jo.bloggs@example.com"}',
    charsets: '{"to":"UTF-8","subject":"UTF-8","from":"UTF-8","text":"us-ascii"}',
    SPF: 'pass'
  }