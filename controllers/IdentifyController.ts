import { Request, Response } from "express";
import prisma from "../prismaClient";

export const identify = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Provide at least email or phoneNumber" });
  }

  try {
    const matchingContacts = await prisma.contact.findMany({
      where: {
        OR: [
          email ? { email } : undefined,
          phoneNumber ? { phoneNumber } : undefined,
        ].filter(Boolean) as any,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    let primaryContact = null;

    if (matchingContacts.length > 0) {
      primaryContact = matchingContacts.find(c => c.linkPrecedence === "primary") || matchingContacts[0];

      // Ensure all other contacts link to this primary
      for (const contact of matchingContacts) {
        if (contact.id !== primaryContact.id && contact.linkPrecedence === "primary") {
          await prisma.contact.update({
            where: { id: contact.id },
            data: {
              linkPrecedence: "secondary",
              linkedId: primaryContact.id,
            },
          });
        }
      }
    }

    // If no matching contact or new info, create secondary contact
    const isNewInfo = !matchingContacts.some(
      (c) => c.email === email && c.phoneNumber === phoneNumber
    );

    let newlyCreated = null;

    if (!primaryContact) {
      // No contact at all, create primary
      newlyCreated = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "primary",
        },
      });
      primaryContact = newlyCreated;
    } else if (isNewInfo) {
      // Create secondary contact linked to primary
      newlyCreated = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "secondary",
          linkedId: primaryContact.id,
        },
      });
    }

    // Get all contacts linked to the same primary
    const allLinkedContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: primaryContact.id },
          { linkedId: primaryContact.id },
        ],
      },
    });

    const emails = [
      ...new Set(allLinkedContacts.map(c => c.email).filter(Boolean)),
    ];
    const phoneNumbers = [
      ...new Set(allLinkedContacts.map(c => c.phoneNumber).filter(Boolean)),
    ];
    const secondaryContactIds = allLinkedContacts
      .filter(c => c.linkPrecedence === "secondary")
      .map(c => c.id);

    return res.status(200).json({
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    });

  } catch (err) {
    console.error("Error identifying contact:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
