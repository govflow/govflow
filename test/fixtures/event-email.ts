import { EmailEventAttributes } from "../../src/types";

export const emailEvent = [
    {
        "email": "example@test.com",
        "timestamp": 1513299569,
        "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
        "event": "processed",
        "category": "cat facts",
        "sg_event_id": "sg_event_id",
        "sg_message_id": "sg_message_id"
    },
    {
        "email": "example@test.com",
        "timestamp": 1513299569,
        "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
        "event": "deferred",
        "ip": "168.1.1.1",
        "category": "cat facts",
        "sg_event_id": "sg_event_id",
        "sg_message_id": "sg_message_id",
        "response": "400 try again later",
        "attempt": "5"
    },
    {
        "email": "example@test.com",
        "timestamp": 1513299569,
        "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
        "event": "delivered",
        "ip": "168.1.1.1",
        "category": "cat facts",
        "sg_event_id": "sg_event_id",
        "sg_message_id": "sg_message_id",
        "response": "250 OK"
    },
    {
        "email": "example@test.com",
        "timestamp": 1513299569,
        "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
        "event": "open",
        "sg_machine_open": false,
        "category": "cat facts",
        "sg_event_id": "sg_event_id",
        "sg_message_id": "sg_message_id",
        "useragent": "Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
        "ip": "255.255.255.255"
    },
    {
        "email": "example@test.com",
        "timestamp": 1513299569,
        "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
        "event": "click",
        "category": "cat facts",
        "sg_event_id": "sg_event_id",
        "sg_message_id": "sg_message_id",
        "useragent": "Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
        "ip": "255.255.255.255",
        "url": "http://www.sendgrid.com/"
    },
    {
        "email": "example@test.com",
        "timestamp": 1513299569,
        "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
        "event": "bounce",
        "ip": "168.1.1.1",
        "category": "cat facts",
        "sg_event_id": "sg_event_id",
        "sg_message_id": "sg_message_id",
        "reason": "500 unknown recipient",
        "status": "5.0.0"
    },
    {
        "email": "example@test.com",
        "timestamp": 1513299569,
        "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
        "event": "dropped",
        "category": "cat facts",
        "sg_event_id": "sg_event_id",
        "sg_message_id": "sg_message_id",
        "reason": "Bounced Address",
        "status": "5.0.0"
    },
    {
        "email": "example@test.com",
        "timestamp": 1513299569,
        "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
        "event": "spamreport",
        "sg_event_id": "sg_event_id",
        "sg_message_id": "sg_message_id"
    },
    {
        "email": "example@test.com",
        "timestamp": 1513299569,
        "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
        "event": "unsubscribe",
        "category": "cat facts",
        "sg_event_id": "sg_event_id",
        "sg_message_id": "sg_message_id"
    },
    {
        "email": "example@test.com",
        "timestamp": 1513299569,
        "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
        "event": "group_unsubscribe",
        "category": "cat facts",
        "sg_event_id": "sg_event_id",
        "sg_message_id": "sg_message_id",
        "useragent": "Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
        "ip": "255.255.255.255",
        "url": "http://www.sendgrid.com/",
        "asm_group_id": 10
    },
    {
        "email": "example@test.com",
        "timestamp": 1513299569,
        "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
        "event": "group_resubscribe",
        "category": "cat facts",
        "sg_event_id": "sg_event_id",
        "sg_message_id": "sg_message_id",
        "useragent": "Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
        "ip": "000.000.000.000",
        "url": "http://www.sendgrid.com/",
        "asm_group_id": 10
    }
] as unknown as EmailEventAttributes[]
