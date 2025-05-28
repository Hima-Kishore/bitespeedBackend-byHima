import { Request, Response } from "express";
import prisma from "../prismaClient";

export const identify = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  // validate email format
  const validEmail =
    email &&
    email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  if (!email || !phoneNumber || !validEmail) {
    return res
      .status(400)
      .json({ error: "Enter a valid email address and phone number" });
  }

  // check if contact already exists
  let contact = await prisma.contact.findMany({
    where: {
      OR: [{ email }, { phoneNumber }],
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Check if the email and phone number are already in use
  const contactExists = contact.find(
    (c) => c.email === email && c.phoneNumber === phoneNumber
  );

  if (contactExists) {
    return res
      .status(400)
      .json({ error: "Both email and phone number are already in use." });
  }

  // console.log("Existing contacts", contact);

  let newContact;
  // If no existing contact, create a new primary contact
  if (contact.length === 0) {
    newContact = [
      await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "primary",
        },
      }),
    ];
  } else {
    // If there are existing contacts, create a new secondary contact
    newContact = [
      ...contact,
      await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkedId: contact[0].id,
        },
      }),
    ];
  }

  // console.log("New contacts", newContact);

  // Separate primary and secondary contacts
  const primaryContact = newContact[0];
  let secondaryContacts;
  if (newContact.length > 1) {
    secondaryContacts = newContact.slice(1);
  } else {
    secondaryContacts = null;
  }

  // for only unique values
  const uniqueEmails = new Set([
    primaryContact.email,
    ...(secondaryContacts?.map((c) => c.email) ?? []),
  ]);
  const uniquePhoneNumbers = new Set([
    primaryContact.phoneNumber,
    ...(secondaryContacts?.map((c) => c.phoneNumber) ?? []),
  ]);

  return res.status(200).json({
    contact: {
      primaryContactId: primaryContact.id,
      emails: [...uniqueEmails],
      phoneNumbers: [...uniquePhoneNumbers],
      secondaryContactIds: secondaryContacts?.map((c) => c.id) ?? [],
    },
  });
};
