/* eslint-disable */
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

export const rawEmailOne = `Delivered-To: inbound@example.com
Received: by 2002:a17:906:518a:0:0:0:0 with SMTP id y10csp2561015ejk;
        Wed, 11 May 2022 13:06:39 -0700 (PDT)
X-Google-Smtp-Source: ABdhPJzRwjY4yMbFSRccoFiGqSVoCsD7sMGCL1JZGaZk1kQNYDeR1X7Fx4UsCETBmyGeILMn9RVt
X-Received: by 2002:a17:907:7f87:b0:6f5:1c31:6b6 with SMTP id qk7-20020a1709077f8700b006f51c3106b6mr25360027ejc.248.1652299598847;
        Wed, 11 May 2022 13:06:38 -0700 (PDT)
ARC-Seal: i=2; a=rsa-sha256; t=1652299598; cv=pass;
        d=google.com; s=arc-20160816;
        b=MRBKi3l5+5gOfTVbfn9AhhgcSRCOOUTEjKnR4pRr+QeW5f0WSXYSb5l6vIytiuNXJx
         A84fSYvFEIR9xe2OD/o3KR6A9XaONyh03kZPpD4janoDaGH+fpwjghUfJAjyzPncUHlx
         dGd5ffep6JXmwDGaQpifjI5Me+X75+RCpKTj+YqGBNJJrLmx0xsJPyqMN0qbf6FSS5zz
         ty1SIfkRAYOZmEN1w3zAbj42LUAOsy8xToomHe49kWYPtJqzZa6dRBsivdZehsffDUZS
         I86MQwpj6OsgajSEuiOuGDHjNg+JAbrONU3qC7zPPk5ju18wXtFQs+FTKCImf0UjNgVr
         +9hw==
ARC-Message-Signature: i=2; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20160816;
        h=mime-version:suggested_attachment_session_id:content-language
         :accept-language:in-reply-to:references:message-id:date:thread-index
         :thread-topic:subject:cc:to:from:dkim-signature;
        bh=6W7fKOZMyhL1AawzmEFj4MjroY7kjwDiEbPRfbUHw+M=;
        b=LO253mA9UZMTBIP3dDt2WpR55bOVN08H+1Zjdp6ALEgP0zbGJUZycBFJEW7y6mSz3e
         uaVcqDnsIy10fRpX7BBhONLGo1NR1od3d8NXYOQm9OCffjAQyCe8QpDHvgjwCCbsAthB
         NzzujFASMzjbDZuyBuMxkaHp8o2dRF45ompulEa1LJ3ieBlrO2Ee/3QtTTKVMVXfzQ6I
         jKJXu1gMWt6Re6fgWqTpbKXDHEYQnvbVY70lnMMd8XiTE3esPqsy6AARQ2NJafO1OwQx
         cEzx6weBGMdwv4zXfvQOwuPh0QXVeiq0BDRLWVTUb5Uz+yqO9jTmKCe10oIUCw8kUhNa
         yNdQ==
ARC-Authentication-Results: i=2; mx.google.com;
       dkim=pass header.i=@jurisidiction.onmicrosoft.com header.s=selector2-jurisidiction-onmicrosoft-com header.b=bEftAe3v;
       arc=pass (i=1 spf=pass spfdomain=jurisidiction.gov dkim=pass dkdomain=jurisidiction.gov dmarc=pass fromdomain=jurisidiction.gov);
       spf=pass (google.com: domain of public-inbox@example.com designates 2a01:111:f400:7d05::721 as permitted sender) smtp.mailfrom=public-inbox@example.com
Return-Path: <public-inbox@example.com>
Received: from GCC02-BL0-obe.outbound.protection.outlook.com (mail-bl0gcc02on20721.outbound.protection.outlook.com. [2a01:111:f400:7d05::721])
        by mx.google.com with ESMTPS id du15-20020a17090772cf00b006f4fe0c838bsi3292872ejc.270.2022.05.11.13.06.38
        (version=TLS1_2 cipher=ECDHE-ECDSA-AES128-GCM-SHA256 bits=128/128);
        Wed, 11 May 2022 13:06:38 -0700 (PDT)
Received-SPF: pass (google.com: domain of public-inbox@example.com designates 2a01:111:f400:7d05::721 as permitted sender) client-ip=2a01:111:f400:7d05::721;
Authentication-Results: mx.google.com;
       dkim=pass header.i=@jurisidiction.onmicrosoft.com header.s=selector2-jurisidiction-onmicrosoft-com header.b=bEftAe3v;
       arc=pass (i=1 spf=pass spfdomain=jurisidiction.gov dkim=pass dkdomain=jurisidiction.gov dmarc=pass fromdomain=jurisidiction.gov);
       spf=pass (google.com: domain of public-inbox@example.com designates 2a01:111:f400:7d05::721 as permitted sender) smtp.mailfrom=public-inbox@example.com
ARC-Seal: i=1; a=rsa-sha256; s=arcselector9901; d=microsoft.com; cv=none; b=HZX+VlFEtqWqi1P0Lfi9KwXYqCrwgrLPD6Aq4YM122NM1ZaFLfZM6r8TFCLsepZr6MSboOgYC2Aj+STlPfS9iKYWDvLjkV+SE33hrZauXuKFepAlnf/5gOvsFxVlyPnAUvehsdHYi+TA+dH5fove5qjYQnYJmI6dhMaImixkdoqMzppMmRBHAZq3BwiBxWNamRAF/tmYCt7L3sEy+lulT1TbFp4LXyeJOMjJI/dYix7KnpH5ag2td0ca+ABniExiK+sWGV9FBAITDgKkRyUQ21+xTxqy+UntOhDXcO5FD2A5OWhW3Bz3Ptf/uO+tYLzHLwAYDZqgne5wFnKpfKfAjg==
ARC-Message-Signature: i=1; a=rsa-sha256; c=relaxed/relaxed; d=microsoft.com; s=arcselector9901; h=From:Date:Subject:Message-ID:Content-Type:MIME-Version:X-MS-Exchange-AntiSpam-MessageData-ChunkCount:X-MS-Exchange-AntiSpam-MessageData-0:X-MS-Exchange-AntiSpam-MessageData-1; bh=6W7fKOZMyhL1AawzmEFj4MjroY7kjwDiEbPRfbUHw+M=; b=GAaGC9oe9MwJR5jFzcyoM55CJq1sQLkgdk0vssvTOTgcRTqvenTvkTVVWW0kL+hGD0qt3IaXq/IX+pKAWCeBvsvKZLcdWhhiT+En/ez5GyGBvmJ8PdzV3NMSv9PxxHP5has2vklu725MLC3vQhm1gbM+FeVMBtZF5kryIrCBwByd6gmMb3CsJPnP5Yw+Itmss0653xLkOS+INhDQIWX8xxbX1McYuF1mzuAY1UTYsiko/W6jGRaTfXyl30Gn39QDc/qPL/JcEkMPGmi4v7rMr8KUV1OfiS4zp0AXr8Mb9EIEmt4sETZWhn506nZyVN1+j54V+ROpRLi9ZSI1l/YVbQ==
ARC-Authentication-Results: i=1; mx.microsoft.com 1; spf=pass smtp.mailfrom=jurisidiction.gov; dmarc=pass action=none header.from=jurisidiction.gov; dkim=pass header.d=jurisidiction.gov; arc=none
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=jurisidiction.onmicrosoft.com; s=selector2-jurisidiction-onmicrosoft-com; h=From:Date:Subject:Message-ID:Content-Type:MIME-Version:X-MS-Exchange-SenderADCheck; bh=6W7fKOZMyhL1AawzmEFj4MjroY7kjwDiEbPRfbUHw+M=; b=bEftAe3vMAnAAbjwq0Ar4zv0OOLV53NJ1gB7gbGXX8ikmSZPKMrEy8UlUY86FYqxPNZgW+4SdfgO0DIvfGZ3K8lV7dEOYVSP/eoJQCdaz2erTJznrND+x6Lqnc4zWXYZSKJciCv15EChR26Ows4Glbooq1zSI5otFRVFo7I75Pg=
Received: from DM8PR09MB6695.namprd09.prod.outlook.com (2603:10b6:5:2e9::22) by DM8PR09MB6488.namprd09.prod.outlook.com (2603:10b6:5:2e7::21) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id 15.20.5227.21; Wed, 11 May 2022 20:06:35 +0000
Received: from DM8PR09MB6695.namprd09.prod.outlook.com ([fe80::4cde:1fc9:63a2:3db5]) by DM8PR09MB6695.namprd09.prod.outlook.com ([fe80::4cde:1fc9:63a2:3db5%9]) with mapi id 15.20.5227.023; Wed, 11 May 2022 20:06:35 +0000
From: Public Works <public-inbox@example.com>
To: "inbound@example.com" <inbound@example.com>
CC: Copied Recipient <copied-recipient@example.com>
Subject: Fw: The actual subject line
Thread-Topic: The actual subject line
Thread-Index: AQHYZXHWdjI3c7vh+06iRUQNiIW2Bq0aGgdk
Date: Wed, 11 May 2022 20:06:35 +0000
Message-ID: <DM8PR09MB6695D6788661B4BBFF67ECD3C4C89@DM8PR09MB6695.namprd09.prod.outlook.com>
References: <CAC=67EDOV0G6P-9AAgH+GDtJdgfW0eQ9eaKT2Zb-=co=kN6gAg@mail.gmail.com>
In-Reply-To: <CAC=67EDOV0G6P-9AAgH+GDtJdgfW0eQ9eaKT2Zb-=co=kN6gAg@mail.gmail.com>
Accept-Language: en-US
Content-Language: en-US
X-MS-Has-Attach:
X-MS-TNEF-Correlator:
suggested_attachment_session_id: f45ba91c-06f3-94a0-31da-a05ce950f64f
authentication-results: dkim=none (message not signed) header.d=none;dmarc=none action=none header.from=jurisidiction.gov;
x-ms-publictraffictype: Email
x-ms-office365-filtering-correlation-id: 3dc98766-2c67-427f-256f-08da3389c071
x-ms-traffictypediagnostic: DM8PR09MB6488:EE_
x-microsoft-antispam-prvs: <DM8PR09MB6488EBA082C3A062F72A76F9C4C89@DM8PR09MB6488.namprd09.prod.outlook.com>
x-ms-exchange-senderadcheck: 1
x-ms-exchange-antispam-relay: 0
x-microsoft-antispam: BCL:0;
x-microsoft-antispam-message-info: apSG4F9//Cf3Z7fmeKRHeeYoKX6Hk2ngtn+FM6g82OoSy6D95AymDTGePWGT/tY2KHSOhq3H3q/SrC6K7/ziYy9b/gVNfQq+35/UcraKMa830RhZBqnkz0nNm4bIiYOG1dJCCh1H/mSlvCXwc6yqf0oUeHcxzPGGOYTQWLEqZIAMgNiSSrKrc7G8rU2FDBbY8zq4/9MOHJts63uzeH7n90gZL9IV/EdNaX36i9lTv3InWY3f8naIY8EcYgSPnaWXdDGAyGxQGCM5mRFMpwo8A+FaMVcodocCu5E1yKiaTZoUztXKWAADWKRhdQ8c3S1WGCwlSsOrbPRFz/7pyCn6DYlNUdQ3CrAVQHJVidDsOJrn6Vj76aPQEy/0aYNNjisWFmwFFoCwS3bl1YUIpQmMxuJf18VRmFqwfLO3W6C3Yk0grqpQkymrwFlTnjWbc+xYfg0kUrAmZW/kww8cjeEJhYuJ3QCBP3Kc2TqO98lhRciebe8sRaG9iVn9O3XPlP6lriBW5jBCj8No8yl35eJFIgNUems+bUBDdR5lyT2zbFMiANpcs8u2wBbiHCF48hWMRdVlCb4RG0l/T6vu7WkNZ0ZCtXJ5cKFzXxTm8h3ELb53Nmen8VVVL/p8Y40aE9IJpOAeTDPFGGCunsqj4epLHCMf4AIveIIDSF72zQq1hOQvJPOmaEt4B+LRF9mpbK4KWHMSmFxU1kR3jHM/A2mNVg==
x-forefront-antispam-report: CIP:255.255.255.255;CTRY:;LANG:en;SCL:1;SRV:;IPV:NLI;SFV:NSPM;H:DM8PR09MB6695.namprd09.prod.outlook.com;PTR:;CAT:NONE;SFS:(13230001)(39840400004)(346002)(136003)(376002)(396003)(366004)(450100002)(19627405001)(186003)(66946007)(71200400001)(76116006)(91956017)(66476007)(52536014)(66556008)(64756008)(40140700001)(33656002)(66446008)(8936002)(9686003)(5660300002)(83380400001)(26005)(4326008)(4744005)(8676002)(107886003)(53546011)(110136005)(508600001)(86362001)(6506007)(55016003)(7696005)(2906002)(38070700005)(316002)(122000001)(38100700002);DIR:OUT;SFP:1102;
x-ms-exchange-antispam-messagedata-chunkcount: 1
x-ms-exchange-antispam-messagedata-0: cBMWwweDoUhRqCVV2eb/UFEXBkKH0aMbKlVRqEr2G31bcICbxfAkq/qgXZWacEtPQoC0omYfSbNIon2dhp8PJLd4cH7H6+hFTUSO1p+ATEkc8nxER+2kB2OJ3U69U96WVM5D85dZpkYJ6pqTvajq094kBPwd+HXT7OmOCzce3tcyl062sptejWGQyJfgBUDT72qissSr2cZFYj0NDgmOEK2U+Vm5EcQLr9zNEDkAjJYater6o/I3G7aVQDBFVneUq3kB/E78D8DmZhDJxQ2rUTJ9oRXZDaUvXTimWPqsqrfoBBhSjMol4KjleKjRjJDDZSCPT3wqoS3x5CoDlxYhjHLO9OYjl2R+vdPNeNycOJA1wu+0B5pogo4+aoUu7Lh1zV8qog6wFrX50kVoXS8YEP9ZiQ/hczRG7NpAIRGF/YxbpyLCm8zEbRxGfFesNJut5Pr4L/3kotGL4TRw5OTQLPcyGsXSXNtOp4yOTnijzeMyl4Gn30pg6mV15T0ECc8AW2XSYX4Gaon+q5k50e/jB+I2cU1KLz6bHDLA0flOqaq2lQjrw26vo1pYEAgsHzisLEnFIK/YvjzZQWx+eFCB6CyV/CMFzx/wic01A701UJsCvsROPq56dL+BJmxcpRVBJekp3ZKhSHMwl2K+W6MyVPpNuXO40xokpWnVyJmHDHJV3RRR7HvHFVuIFMBnMVJIL8r4x97/Z7Tej/nG6R6H75LhSURM8h3gruVLys5XNjAk9ajBY2OCgwpcsj1YOPpIQ6Hc3aaZiVZ3VJC241ZY2JRzxds809uAJB0yl0IhRIW4YkkatrcmiYe4FP0vonUlqJmnLpkG9yf6Fp4B0GO/DZ3fIglwb2jUzx0c2f0VqAFBQ+Yo6jaZkqYly+In5Hx2bk8VtfwMj4GGoljagEkEjcDcqlTRAP8JfQQB1iiNTnn02l2wzyHcjDxykf0RiCKXh1JvLPgcfqhd9ZH2S+CPZ+EhlSu7p7l6qhrmP9y7r7OyvezryvL3fxt9dDTgERALDbevTVPXoeIKd5QMILUizgU+h96EGur/OEluR5QsvS51nKxrlInNmcazaFK83S7o1T54zmrCYGYFchAOJMHrnumajL43aVFrldw9KrN2EPvKXi+xeI4BmPLuYoc2mQ546pQEV+ZAcmwd/AlnUqDhM6Faj6dkOdqdvpzj4WqD0SDReDtKQ8XHvEwOTnX1zuHrMLfT7GTJS3I/an3PgZdGjVNFsmDXBIdQZ0e4HJw/45SZgBkbV9PJEB5OWdEPdUejspNZdjQbWYDwOmiKHwqAVnn/XaEFmxMLHzHoQ7FjnEucmidsKc1o5QX7opqsDmzA2RhsGoaDoG7MyZLenta0JND/Z9BDF7Pf7Va1jZ/Xn8ds8X3MnSmtFeAQntyhYNPoYseztXSOQBu7RGTePrMTFk03dOnWRyejmPpOClyR2Npk6j09ifbQscQTBvdx1XUR0PTI/6PaMryaUFQ9BEd81GGmGNI1VtmZEwtZE34cCsRlK0JS0JSJatS1RN0FJRtZ3XdrRcbclU3BSOk62edW29OmLEpNbewQlAJX3ruxfR9DmFlSMM4R03UJXeFD40c8lAgpXJaoheDLSlXKNswmkDO82uzokBH8i4RzbksxJMPtirsRBpIMVuMnZMgir+9sNMYrNTYk5r9r1EFJHwlvvIebP76v/qDimxWoFg1x6zg=
Content-Type: multipart/alternative; boundary="_000_DM8PR09MB6695D6788661B4BBFF67ECD3C4C89DM8PR09MB6695namp_"
MIME-Version: 1.0
X-OriginatorOrg: jurisidiction.gov
X-MS-Exchange-CrossTenant-AuthAs: Internal
X-MS-Exchange-CrossTenant-AuthSource: DM8PR09MB6695.namprd09.prod.outlook.com
X-MS-Exchange-CrossTenant-Network-Message-Id: 3dc98766-2c67-427f-256f-08da3389c071
X-MS-Exchange-CrossTenant-originalarrivaltime: 11 May 2022 20:06:35.8210 (UTC)
X-MS-Exchange-CrossTenant-fromentityheader: Hosted
X-MS-Exchange-CrossTenant-id: 23dd27b7-0d53-4da2-bedc-f99e18d3cd88
X-MS-Exchange-Transport-CrossTenantHeadersStamped: DM8PR09MB6488

--_000_DM8PR09MB6695D6788661B4BBFF67ECD3C4C89DM8PR09MB6695namp_
Content-Type: text/plain; charset="us-ascii"
Content-Transfer-Encoding: quoted-printable


________________________________
From: Actual Submitter <actual-submitter@example.com>
Sent: Wednesday, May 11, 2022 4:02 PM
To: Public Works <public-inbox@example.com>
Subject: The actual subject line


The actual message

--_000_DM8PR09MB6695D6788661B4BBFF67ECD3C4C89DM8PR09MB6695namp_
Content-Type: text/html; charset="us-ascii"
Content-Transfer-Encoding: quoted-printable

<html>
<head>
<meta http-equiv=3D"Content-Type" content=3D"text/html; charset=3Dus-ascii"=
>
<style type=3D"text/css" style=3D"display:none;"> P {margin-top:0;margin-bo=
ttom:0;} </style>
</head>
<body dir=3D"ltr">
<div style=3D"font-family: Calibri, Arial, Helvetica, sans-serif; font-size=
: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div id=3D"appendonsend"></div>
<hr style=3D"display:inline-block;width:98%" tabindex=3D"-1">
<div id=3D"divRplyFwdMsg" dir=3D"ltr"><font face=3D"Calibri, sans-serif" st=
yle=3D"font-size:11pt" color=3D"#000000"><b>From:</b> Actual Submitter &lt;=
actual-submitter@example.com&gt;<br>
<b>Sent:</b> Wednesday, May 11, 2022 4:02 PM<br>
<b>To:</b> Public Works &lt;public-inbox@example.com&gt;<br>
<b>Subject:</b> The actual subject line</font>
<div>&nbsp;</div>
</div>
<div>
<p><span style=3D"font-family:'Calibri',sans-serif; background:#FFFF99">[<s=
trong>NOTICE:</strong>&nbsp; This message originated outside
<strong>DO NOT CLICK&nbsp;</strong>on&nbsp;<strong>links</strong> or open&n=
bsp;<strong>attachments</strong> unless you are sure the content is safe.]<=
/span></p>
<div>
<div dir=3D"ltr">This is Actual Submitter.
<div><br>
</div>
<div>I am using this to forward to GovFlow for testing of&nbsp;forwarding e=
mails to a helpdesk for City Users</div>
<div><br>
</div>
<div>No action required.</div>
<div><br>
</div>
<div>Thanks</div>
<div><br>
</div>
<div>Actual Submitter</div>
<div>757-220-6186</div>
</div>
</div>
</div>
</body>
</html>

--_000_DM8PR09MB6695D6788661B4BBFF67ECD3C4C89DM8PR09MB6695namp_--`

export const rawEmailTwo = `Delivered-To: inbound@example.com
Received: by 2002:a17:906:518a:0:0:0:0 with SMTP id y10csp1891263ejk;
        Mon, 16 May 2022 02:01:58 -0700 (PDT)
X-Google-Smtp-Source: ABdhPJyH6HoDFtsh3kmqsBkTjJL3ltnsAHPTsp2ZGj/ovA/gLm8XfNMKfTgkqWmGNCBQzCQ+MqcH
X-Received: by 2002:a05:622a:1193:b0:2f3:d34f:118b with SMTP id m19-20020a05622a119300b002f3d34f118bmr14302905qtk.305.1652691718427;
        Mon, 16 May 2022 02:01:58 -0700 (PDT)
ARC-Seal: i=1; a=rsa-sha256; t=1652691718; cv=none;
        d=google.com; s=arc-20160816;
        b=kbs1lZ3bBy3vNgPLoxDieQ6AO/GpbAbnvXY2L0Nj5lYbuab76tOJXz1hMGa/ucG3Te
         4e2W8poAxMCOkcd/i6tNo+sqe5woFtdezWJSfff/W0JLT0OeqqP3wln4p9vVtQ2497AC
         zu0M2WYx3PcQdbz2Doa6wQN+wlus/SRIw0vueIB23rNc7cco8kjpEG6DkmkCB66fz4My
         s+tGezjS/a2cd2rZwGVtBNy2fpt/S/P2f0ty82mvuq8lot6PqNMd5VeVwXeI3G5pxCjW
         qX4nTjPcDB8lKCrGjKwRCDxu7S48Rzvqag2Lp5ucn8l81jjehVMu2kGjAay70FD1IQ2B
         ++5g==
ARC-Message-Signature: i=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20160816;
        h=date:to:references:message-id:subject:mime-version:from
         :dkim-signature:dkim-signature;
        bh=EgyUp3ApvYDsXeIveuhSZeRry6v+rWYBEE26sDZWgwg=;
        b=GOw1gXfEgpXLsQHJCFOjHSRAtaJrXFY62HgCtqZ+TKsBzrMXdrpZ86IfzrVtTRYffg
         80ePirb5bvOPQDaw15pHF1KCuKZjXicaZQzj8L/qOIkkn69liB0GtGBedcf85JAorem9
         ePvALrKdUHfkuQgUgjD7SwAiejeiWIFY8zX2zGvuvPlnXqKw87+7Y6T7LNfQngfB2yJa
         YbYmrCFBJPSvYfg1TN7ZNfmUK8IPGba0VONiAk4muvwXDO3n7dQmS1uSFpJMVR2/rdBP
         FxXZ+D+uQAPlFtlf6D9WcpS7gJWVgFZ8a3ohjUrMXckTvb2+v4YS8rmv+6NcnlRbC5mx
         dR2w==
ARC-Authentication-Results: i=1; mx.google.com;
       dkim=pass header.i=@example.com header.s=fm1 header.b=ph58WZvF;
       dkim=pass header.i=@messagingengine.com header.s=fm1 header.b=Z7tPdyyb;
       spf=pass (google.com: domain of actual-submitter@example.com designates 66.111.4.28 as permitted sender) smtp.mailfrom=actual-submitter@example.com
Return-Path: <actual-submitter@example.com>
Received: from out4-smtp.messagingengine.com (out4-smtp.messagingengine.com. [66.111.4.28])
        by mx.google.com with ESMTPS id c12-20020ac87d8c000000b002f34798c52csi5644098qtd.730.2022.05.16.02.01.57
        for <inbound@example.com>
        (version=TLS1_3 cipher=TLS_AES_256_GCM_SHA384 bits=256/256);
        Mon, 16 May 2022 02:01:58 -0700 (PDT)
Received-SPF: pass (google.com: domain of actual-submitter@example.com designates 66.111.4.28 as permitted sender) client-ip=66.111.4.28;
Authentication-Results: mx.google.com;
       dkim=pass header.i=@example.com header.s=fm1 header.b=ph58WZvF;
       dkim=pass header.i=@messagingengine.com header.s=fm1 header.b=Z7tPdyyb;
       spf=pass (google.com: domain of actual-submitter@example.com designates 66.111.4.28 as permitted sender) smtp.mailfrom=actual-submitter@example.com
Received: from compute5.internal (compute5.nyi.internal [10.202.2.45]) by mailout.nyi.internal (Postfix) with ESMTP id D0CF65C0084 for <inbound@example.com>; Mon, 16 May 2022 05:01:57 -0400 (EDT)
Received: from mailfrontend1 ([10.202.2.162])
  by compute5.internal (MEProxy); Mon, 16 May 2022 05:01:57 -0400
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=example.com; h= cc:content-type:date:date:from:from:in-reply-to:message-id :mime-version:references:reply-to:sender:subject:subject:to:to;
	 s=fm1; t=1652691717; x=1652778117; bh=EgyUp3ApvYDsXeIveuhSZeRry 6v+rWYBEE26sDZWgwg=; b=ph58WZvFljWKp9HmwVZrQvGD2AptHN0E9mmQbKGKv FQ+Hts6KxBtsh5kt31++tr9RLFdQZ6zvBLEn3z2nVSM+4O6dFWZcti8S5fWU4hU3 ns79C/QPrjao0ycpZok+vbaciEkleou8DiBzMrPfaOdSDOPPQaBHYXmdNebcYVQe vEM/0P+noqWiL6ZRsoLzDWBAMOhogNViWKEE7ZnVsinA2f79R5Vm5HtvaRt8J51x TYi4yYg3qCUcrzkRa9GR2BO3ACV6a95Nyj9FIGZCByKdA+AsGRp75Mf0QiGRTYAG k1FKcFy7NGhvY40iIRgisoQUifTsdbnashElmVE8DFK1Q==
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d= messagingengine.com; h=cc:content-type:date:date:from:from :in-reply-to:message-id:mime-version:references:reply-to:sender :subject:subject:to:to:x-me-proxy:x-me-proxy:x-me-sender :x-me-sender:x-sasl-enc; s=fm1; t=1652691717; x=1652778117; bh=E gyUp3ApvYDsXeIveuhSZeRry6v+rWYBEE26sDZWgwg=; b=Z7tPdyyb6NQ9jK6K3 CmdOclnVCrReFeCIa5f4oLYcgZdPz/3lQCxfF3XgvLImCDuV2l5/Cm44M17AKmRQ PKOwmiFmbwFbDzAOxO0SKXI/Gm+RCDpBQ5a2CDFVL0JVFy8kiGkqx2IQMN3fGInX ewyU4lmoLXqNYi+v1EU3rBz2Sbs5qKo0Uh+9RmLDvPdYE8uIDM2/g3ifSO9m6C+9 FaZUg7kEZk0eegGsSgF+natfIPAtVby1zdWISWABKjVnMWnBKjeZlvXUelf9ESHF 02VDA9CvP2ZaoNa+o9adzWteehDsnKHfEdtUu64L+xowzIgIiINr+vWWHLKq3nx3 sKWTA==
X-ME-Sender: <xms:BROCYmfUw5rdWgtPXLGVYmGXaTYHcx2IUY4PLCaj6bbdCSDaK3FLew>
    <xme:BROCYgMWID9SMPCKuBDGIR6LLzyyFd49NB35s29UM6uxOP5WWlyUmUbJ9WFcMLHiq
    GJSIs039PafJsYr9fo>
X-ME-Received: <xmr:BROCYnhplJC4z7eZ8eLumx4X04tC7538synonF4qkGLCJ3FSKVhtTSkYjiNn81abt14OYVZwIZ-8p-31YeytEVqn5ymkMaGcCITXiY7z0lZc>
X-ME-Proxy-Cause: gggruggvucftvghtrhhoucdtuddrgedvfedrheehgddtlecutefuodetggdotefrodftvf
    curfhrohhfihhlvgemucfhrghsthforghilhdpqfgfvfdpuffrtefokffrpgfnqfghnecu
    uegrihhlohhuthemuceftddtnecunecujfgurhephfgtggfukfhfvfffofesrgdtmherhh
    dtvdenucfhrhhomheprfgruhhlucghrghlshhhuceophgruhhlseifrghlshhhrdgtohdr
    ihhlqeenucggtffrrghtthgvrhhnpeeiheeuffdvvedtffevuefhjefgudfhteevgfevje
    ffheeijeeuvdevgfejkeejteenucevlhhushhtvghrufhiiigvpedtnecurfgrrhgrmhep
    mhgrihhlfhhrohhmpehprghulhesfigrlhhshhdrtghordhilh
X-ME-Proxy: <xmx:BROCYj8kdnWBcVSy-1hrnPNmBForNPOiZbXPJ_SraZyl5QEByA4MoQ>
    <xmx:BROCYivNNXA16POt6v6IJMCYriOyP8e9ua5MZbMBZrFE-dyFkmppQg>
    <xmx:BROCYqGZxwvgcgCow0OCx9hXQ30-pSu8sOsN8VzxPc-alklY9U_Cqg>
    <xmx:BROCYj7mAYyZMDW68yBc_yzRV2xMiVtNrXqu7s0M7hSKuB9UEPkH6g>
Received: by mail.messagingengine.com (Postfix) with ESMTPA for <inbound@example.com>; Mon, 16 May 2022 05:01:57 -0400 (EDT)
From: Actual Submitter <actual-submitter@example.com>
Content-Type: multipart/alternative; boundary="Apple-Mail=_5603F30B-A0D6-49C4-B110-A42BF5A2B249"
Mime-Version: 1.0 (Mac OS X Mail 15.0 \(3693.60.0.1.1\))
Subject: Fwd: The actual subject line
Message-Id: <E439C9C1-9FBF-4A69-8519-FEE6FC19B991@example.com>
References: <CAK-7d+DxP=ApJFWOVCaTjcHGU=PA5DSagWZ_JjBz1t1GqMU8JA@mail.gmail.com>
To: Inbound GovFlow <inbound@example.com>
Date: Mon, 16 May 2022 12:01:55 +0300
X-Mailer: Apple Mail (2.3693.60.0.1.1)

--Apple-Mail=_5603F30B-A0D6-49C4-B110-A42BF5A2B249
Content-Transfer-Encoding: quoted-printable
Content-Type: text/plain; charset=us-ascii

Test forward

> Begin forwarded message:
>=20
> From: Actual Submitter <actual-submitter@example.com>
> Subject: Re: Actual subject line
> Date: 16 May 2022 at 11:55:00 GMT+3
> To: Public Inbox <public-inbox@example.com>
>=20
> The actual message


--Apple-Mail=_5603F30B-A0D6-49C4-B110-A42BF5A2B249
Content-Transfer-Encoding: quoted-printable
Content-Type: text/html; charset=us-ascii

<html><head><meta http-equiv=3D"Content-Type" content=3D"text/html; charset=
=3Dus-ascii"></head><body style=3D"word-wrap: break-word; -webkit-nbsp-mode=
: space; line-break: after-white-space;" class=3D"">Test forward<br class=
=3D""><div><br class=3D""><blockquote type=3D"cite" class=3D""><div class=
=3D"">Begin forwarded message:</div><br class=3D"Apple-interchange-newline"=
><div style=3D"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; marg=
in-left: 0px;" class=3D""><span style=3D"font-family: -webkit-system-font, =
Helvetica Neue, Helvetica, sans-serif; color:rgba(0, 0, 0, 1.0);" class=3D"=
"><b class=3D"">From: </b></span><span style=3D"font-family: -webkit-system=
-font, Helvetica Neue, Helvetica, sans-serif;" class=3D"">Actual Submitter &lt;<a=
 href=3D"mailto:inbound@example.com" class=3D"">inbound@example.com</a>&gt;<br clas=
s=3D""></span></div><div style=3D"margin-top: 0px; margin-right: 0px; margi=
n-bottom: 0px; margin-left: 0px;" class=3D""><span style=3D"font-family: -w=
ebkit-system-font, Helvetica Neue, Helvetica, sans-serif; color:rgba(0, 0, =
0, 1.0);" class=3D""><b class=3D"">Subject: </b></span><span style=3D"font-=
family: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif;" class=
=3D""><b class=3D"">Re: The actual subject line</b><br class=3D""></span></div><div style=3D"m=
argin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px;" c=
lass=3D""><span style=3D"font-family: -webkit-system-font, Helvetica Neue, =
Helvetica, sans-serif; color:rgba(0, 0, 0, 1.0);" class=3D""><b class=3D"">=
Date: </b></span><span style=3D"font-family: -webkit-system-font, Helvetica=
 Neue, Helvetica, sans-serif;" class=3D"">16 May 2022 at 11:55:00 GMT+3<br =
class=3D""></span></div><div style=3D"margin-top: 0px; margin-right: 0px; m=
argin-bottom: 0px; margin-left: 0px;" class=3D""><span style=3D"font-family=
: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif; color:rgba(0,=
 0, 0, 1.0);" class=3D""><b class=3D"">To: </b></span><span style=3D"font-f=
amily: -webkit-system-font, Helvetica Neue, Helvetica, sans-serif;" class=
=3D"">Actual Submitter &lt;<a href=3D"mailto:actual-submitter@example.com" class=3D"">paul@wa=
lsh.co.il</a>&gt;<br class=3D""></span></div><br class=3D""><div class=3D""=
><div dir=3D"ltr" class=3D"">trying to reply to a message that was magicall=
y sent from outlook with no extra verification apart from having a microsof=
t account.</div><br class=3D""><div class=3D"gmail_quote"><div dir=3D"ltr" =
class=3D"gmail_attr">On Mon, May 16, 2022 at 11:34 AM Actual Submitter &lt;<a hre=
f=3D"mailto:actual-submitter@example.com" class=3D"">actual-submitter@example.com</a>&gt; wrote:<br=
 class=3D""></div><blockquote class=3D"gmail_quote" style=3D"margin:0px 0px=
 0px 0.8ex;border-left-width:1px;border-left-style:solid;border-left-color:=
rgb(204,204,204);padding-left:1ex">




<div dir=3D"ltr" class=3D"">
<div style=3D"font-family: Calibri, Arial, Helvetica, sans-serif; font-size=
: 12pt;" class=3D"">
The actual subject line</div>
</div>

</blockquote></div>
</div></blockquote></div><br class=3D""></body></html>
--Apple-Mail=_5603F30B-A0D6-49C4-B110-A42BF5A2B249--`